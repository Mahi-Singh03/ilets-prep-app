const GITHUB_API = "https://api.github.com";

export function githubHeaders(token, accept = "application/vnd.github.v3+json") {
  return {
    Authorization: `Bearer ${token}`,
    Accept: accept,
    "User-Agent": "CodershipAI",
  };
}

export async function commitViaContentsApi(
  owner,
  repo,
  token,
  { path, content, message, branch, sha }
) {
  const encodedPath = encodeFilePath(path);
  const base64Content = Buffer.from(content, "utf-8").toString("base64");

  const body = {
    message,
    content: base64Content,
    branch,
  };
  if (sha) body.sha = sha;

  return fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}`, {
    method: "PUT",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function normalizePath(path) {
  return path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export function encodeFilePath(path) {
  const normalized = normalizePath(path);
  return normalized.split("/").map(encodeURIComponent).join("/");
}

export async function getRepository(owner, repo, token) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: githubHeaders(token),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch repository: ${response.status}`);
  }

  return response.json();
}

export async function listBranches(owner, repo, token) {
  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/branches?per_page=100`, {
    headers: githubHeaders(token),
  });

  if (!response.ok) return [];
  const branches = await response.json();
  return branches.map((b) => b.name);
}

export async function getBranchRef(owner, repo, token, branchName) {
  return fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branchName)}`,
    { headers: githubHeaders(token) }
  );
}

/**
 * Resolves a valid branch for read/write operations.
 * Falls back to default_branch, then any existing branch, then default for empty repos.
 */
export async function resolveBranch(owner, repo, token, requestedBranch) {
  const repoData = await getRepository(owner, repo, token);
  const defaultBranch = repoData.default_branch || "main";

  const candidates = [
    requestedBranch,
    defaultBranch,
    "main",
    "master",
  ].filter((b, i, arr) => b && arr.indexOf(b) === i);

  for (const branch of candidates) {
    const refResponse = await getBranchRef(owner, repo, token, branch);
    if (refResponse.ok) return branch;
  }

  // Empty repo — no refs exist yet; use default for initial commit
  return defaultBranch;
}

export async function getTokenScopes(token) {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(token),
  });
  const scopes = response.headers.get("x-oauth-scopes") || "";
  return scopes.split(",").map((s) => s.trim()).filter(Boolean);
}

export function assertWriteAccess(repoData, scopes) {
  const canWrite = scopes.includes("repo") || scopes.includes("public_repo");

  if (scopes.length > 0 && !canWrite) {
    throw new Error(
      `GitHub token missing write access (scopes: ${scopes.join(", ")}). Sign out, then sign in with GitHub again to grant repository permissions.`
    );
  }

  if (repoData.private && !scopes.includes("repo")) {
    throw new Error(
      "Private repositories require full repo access. Sign out and sign in with GitHub again."
    );
  }

  if (repoData.permissions && !repoData.permissions.push && !repoData.permissions.admin) {
    throw new Error("You don't have write access to this repository.");
  }
}

/** True only when the repo has never received a push (no commits at all). */
export function isRepoEmpty(repoData) {
  return !repoData.pushed_at;
}

export async function getFileSha(owner, repo, token, path, branch) {
  const encodedPath = encodeFilePath(path);
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    { headers: githubHeaders(token) }
  );

  if (response.ok) {
    const data = await response.json();
    return data.sha;
  }

  if (response.status === 404) return null;

  throw new Error(await parseGitHubError(response));
}

export async function parseGitHubError(response) {
  const data = await response.json().catch(() => ({}));
  const parts = [data.message || `GitHub API error: ${response.status}`];

  if (data.errors?.length) {
    parts.push(
      data.errors
        .map((e) => e.message || e.code)
        .filter(Boolean)
        .join("; ")
    );
  }

  if (response.status === 404) {
    parts.push(
      "Verify the repository, branch, and file path exist. If this is a private repo, re-authenticate with GitHub."
    );
  }

  return parts.filter(Boolean).join(" — ");
}
