import {
  encodeFilePath,
  getBranchRef,
  githubHeaders,
  normalizePath,
  parseGitHubError,
} from "@/src/lib/github-api";

const GITHUB_API_BASE = "https://api.github.com";

async function githubPost(owner, repo, token, endpoint, body) {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}${endpoint}`,
    {
      method: "POST",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(await parseGitHubError(response));
  }

  return response.json();
}

async function githubPatch(owner, repo, token, endpoint, body) {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}${endpoint}`,
    {
      method: "PATCH",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(await parseGitHubError(response));
  }

  return response.json();
}

async function createBlob(owner, repo, token, content) {
  return githubPost(owner, repo, token, "/git/blobs", {
    content,
    encoding: "utf-8",
  });
}

async function createTree(owner, repo, token, tree, baseTree) {
  const body = { tree };
  if (baseTree) body.base_tree = baseTree;
  return githubPost(owner, repo, token, "/git/trees", body);
}

async function createCommit(owner, repo, token, message, treeSha, parents = []) {
  const body = { message, tree: treeSha };
  if (parents.length > 0) body.parents = parents;
  return githubPost(owner, repo, token, "/git/commits", body);
}

/**
 * Commit a file using the low-level Git API.
 * Works for empty repositories and when the Contents API returns 404.
 */
export async function commitFileViaGitApi(owner, repo, token, { path, content, message, branch }) {
  const blob = await createBlob(owner, repo, token, content);
  const fileEntry = { path, mode: "100644", type: "blob", sha: blob.sha };

  const refResponse = await getBranchRef(owner, repo, token, branch);

  if (!refResponse.ok) {
    throw new Error(
      "Cannot use Git API on an empty repository. The repository needs an initial commit via the Contents API first."
    );
  }

  const refData = await refResponse.json();
  const parentSha = refData.object.sha;

  const parentCommitRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${parentSha}`,
    { headers: githubHeaders(token) }
  );

  if (!parentCommitRes.ok) {
    throw new Error(await parseGitHubError(parentCommitRes));
  }

  const parentCommit = await parentCommitRes.json();
  const tree = await createTree(owner, repo, token, [fileEntry], parentCommit.tree.sha);
  const commit = await createCommit(owner, repo, token, message, tree.sha, [parentSha]);

  await githubPatch(owner, repo, token, `/git/refs/heads/${encodeURIComponent(branch)}`, {
    sha: commit.sha,
  });

  return { sha: commit.sha, html_url: null };
}

async function getBranchCommitTree(owner, repo, token, branch) {
  const refResponse = await getBranchRef(owner, repo, token, branch);
  if (!refResponse.ok) {
    throw new Error(await parseGitHubError(refResponse));
  }

  const refData = await refResponse.json();
  const parentSha = refData.object.sha;

  const parentCommitRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${parentSha}`,
    { headers: githubHeaders(token) }
  );

  if (!parentCommitRes.ok) {
    throw new Error(await parseGitHubError(parentCommitRes));
  }

  const parentCommit = await parentCommitRes.json();
  return { parentSha, parentCommit };
}

async function getRecursiveBlobs(owner, repo, token, treeSha) {
  const treeRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`,
    { headers: githubHeaders(token) }
  );

  if (!treeRes.ok) {
    throw new Error(await parseGitHubError(treeRes));
  }

  const treeData = await treeRes.json();
  return treeData.tree.filter((item) => item.type === "blob");
}

async function applyTreeChanges(owner, repo, token, { branch, message, treeChanges }) {
  const { parentSha, parentCommit } = await getBranchCommitTree(owner, repo, token, branch);
  const tree = await createTree(owner, repo, token, treeChanges, parentCommit.tree.sha);
  const commit = await createCommit(owner, repo, token, message, tree.sha, [parentSha]);

  await githubPatch(owner, repo, token, `/git/refs/heads/${encodeURIComponent(branch)}`, {
    sha: commit.sha,
  });

  return commit;
}

/**
 * Commit multiple files in a single Git commit.
 */
export async function commitMultipleFilesViaGitApi(
  owner,
  repo,
  token,
  { branch, message, files }
) {
  if (!files?.length) {
    throw new Error("No files to commit");
  }

  const treeChanges = [];
  for (const file of files) {
    const path = normalizePath(file.path);
    if (!path) continue;
    const blob = await createBlob(owner, repo, token, file.content ?? "");
    treeChanges.push({
      path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  if (treeChanges.length === 0) {
    throw new Error("No valid file paths to commit");
  }

  return applyTreeChanges(owner, repo, token, { branch, message, treeChanges });
}

function matchesPathPrefix(filePath, folderPath) {
  return filePath === folderPath || filePath.startsWith(`${folderPath}/`);
}

/**
 * Delete a file or folder (and all nested files) in a single commit.
 */
export async function deletePathViaGitApi(owner, repo, token, { path, message, branch, isFolder }) {
  const normalized = normalizePath(path);
  const { parentCommit } = await getBranchCommitTree(owner, repo, token, branch);
  const blobs = await getRecursiveBlobs(owner, repo, token, parentCommit.tree.sha);

  const treeChanges = blobs
    .filter((item) => (isFolder ? matchesPathPrefix(item.path, normalized) : item.path === normalized))
    .map((item) => ({ path: item.path, sha: null }));

  if (treeChanges.length === 0) {
    throw new Error(isFolder ? "Folder not found or already empty" : "File not found");
  }

  return applyTreeChanges(owner, repo, token, {
    branch,
    message,
    treeChanges,
  });
}

/**
 * Rename/move a file or folder (and all nested files) in a single commit.
 */
export async function movePathViaGitApi(
  owner,
  repo,
  token,
  { oldPath, newPath, message, branch, isFolder }
) {
  const normalizedOld = normalizePath(oldPath);
  const normalizedNew = normalizePath(newPath);

  if (normalizedOld === normalizedNew) {
    throw new Error("New path must be different from the current path");
  }

  const { parentCommit } = await getBranchCommitTree(owner, repo, token, branch);
  const blobs = await getRecursiveBlobs(owner, repo, token, parentCommit.tree.sha);

  const treeChanges = [];

  if (isFolder) {
    const affected = blobs.filter((item) => matchesPathPrefix(item.path, normalizedOld));
    if (affected.length === 0) {
      throw new Error("Folder not found");
    }

    for (const item of affected) {
      const suffix = item.path.slice(normalizedOld.length);
      const newFilePath = normalizePath(`${normalizedNew}${suffix}`);
      treeChanges.push({
        path: newFilePath,
        mode: item.mode,
        type: "blob",
        sha: item.sha,
      });
      treeChanges.push({ path: item.path, sha: null });
    }
  } else {
    const item = blobs.find((b) => b.path === normalizedOld);
    if (!item) {
      throw new Error("File not found");
    }
    treeChanges.push({
      path: normalizedNew,
      mode: item.mode,
      type: "blob",
      sha: item.sha,
    });
    treeChanges.push({ path: normalizedOld, sha: null });
  }

  return applyTreeChanges(owner, repo, token, {
    branch,
    message,
    treeChanges,
  });
}

/**
 * Delete a single file via the Contents API.
 */
export async function deleteFileViaContentsApi(owner, repo, token, { path, message, branch }) {
  const normalized = normalizePath(path);
  const encodedPath = encodeFilePath(normalized);

  const getResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    { headers: githubHeaders(token) }
  );

  if (!getResponse.ok) {
    if (getResponse.status === 404) {
      throw new Error("File not found");
    }
    throw new Error(await parseGitHubError(getResponse));
  }

  const fileData = await getResponse.json();
  const deleteResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      method: "DELETE",
      headers: {
        ...githubHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sha: fileData.sha,
        branch,
      }),
    }
  );

  if (!deleteResponse.ok) {
    throw new Error(await parseGitHubError(deleteResponse));
  }

  return deleteResponse.json();
}

