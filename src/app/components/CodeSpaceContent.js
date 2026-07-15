"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/src/app/context/ThemeContext";
import {
  ChevronDown,
  Save,
  Loader2,
  File,
  Folder,
  FolderOpen,
  Search,
  GitBranch,
  GitCommit,
  X,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Code2,
  Pencil,
  FilePlus,
  FolderPlus,
  Trash2,
  MoreVertical,
  ExternalLink,
  Globe,
  Sparkles,
} from "lucide-react";

const PREVIEW_WINDOW_NAME = "codership-preview";
const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/";

const LANGUAGE_MAP = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
  sass: "scss",
  less: "less",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  rb: "ruby",
  php: "php",
  sql: "sql",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  bash: "shell",
  vue: "html",
  svelte: "html",
};

function getLanguageFromPath(filePath) {
  if (!filePath) return "plaintext";
  const ext = filePath.split(".").pop()?.toLowerCase();
  return LANGUAGE_MAP[ext] || "plaintext";
}

function isWebFile(path) {
  const lang = getLanguageFromPath(path);
  return ["html", "css", "javascript", "typescript", "scss", "less"].includes(lang);
}

function pickFile(paths, patterns) {
  for (const pattern of patterns) {
    const match = paths.find((p) => pattern.test(p));
    if (match) return match;
  }
  return null;
}

function collectWebAssets(openTabs) {
  const byPath = {};
  openTabs.forEach((tab) => {
    byPath[tab.path] = tab.content;
  });
  const paths = Object.keys(byPath);

  const htmlPath =
    pickFile(paths, [/index\.html?$/i, /\.html?$/i]) ||
    paths.find((p) => getLanguageFromPath(p) === "html");
  const cssPath =
    pickFile(paths, [/styles?\.css$/i, /main\.css$/i, /\.css$/i, /\.scss$/i]) ||
    paths.find((p) => ["css", "scss", "less"].includes(getLanguageFromPath(p)));
  const jsPath =
    pickFile(paths, [/script\.js$/i, /main\.js$/i, /app\.js$/i, /\.jsx?$/i, /\.tsx?$/i]) ||
    paths.find((p) => ["javascript", "typescript"].includes(getLanguageFromPath(p)));

  return {
    html: htmlPath ? byPath[htmlPath] : "",
    css: cssPath ? byPath[cssPath] : "",
    js: jsPath ? byPath[jsPath] : "",
  };
}

function buildPreviewDocument(html, css, js) {
  let doc = html?.trim() || "";
  const styleBlock = css?.trim() ? `<style>\n${css}\n</style>` : "";
  const scriptBlock = js?.trim()
    ? `<script>\n${js}\n<\/script>`
    : "";

  if (!doc) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preview</title>
  ${styleBlock}
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#666;">
    <p>Open an HTML file or add HTML/CSS/JS tabs to see a preview.</p>
  </div>
  ${scriptBlock}
</body>
</html>`;
  }

  if (styleBlock) {
    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", `${styleBlock}\n</head>`);
    } else if (doc.includes("<head>")) {
      doc = doc.replace("<head>", `<head>\n${styleBlock}`);
    } else {
      doc = doc.replace(/<html[^>]*>/i, (m) => `${m}\n<head>${styleBlock}</head>`);
    }
  }

  if (scriptBlock) {
    if (doc.includes("</body>")) {
      doc = doc.replace("</body>", `${scriptBlock}\n</body>`);
    } else {
      doc += `\n${scriptBlock}`;
    }
  }

  if (!/<!DOCTYPE/i.test(doc) && !/<html/i.test(doc)) {
    doc = `<!DOCTYPE html>\n<html><head><meta charset="utf-8" />${styleBlock}</head><body>${doc}${scriptBlock}</body></html>`;
  }

  return doc;
}

function getStarterContent(filePath) {
  const lang = getLanguageFromPath(filePath);
  if (lang === "html") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document</title>
</head>
<body>

</body>
</html>
`;
  }
  if (lang === "css") return "/* styles */\n\n";
  if (["javascript", "typescript"].includes(lang)) return "// your code here\n\n";
  if (lang === "json") return "{\n  \n}\n";
  return "";
}

function addPathToTree(tree, filePath, isFolder = false) {
  const parts = filePath.split("/").filter(Boolean);
  if (parts.length === 0) return tree;

  const clone = JSON.parse(JSON.stringify(tree));

  const ensureFolder = (nodes, folderParts, depth) => {
    if (depth >= folderParts.length) return nodes;
    const name = folderParts[depth];
    let folder = nodes.find((n) => n.name === name && n.type === "tree");
    if (!folder) {
      folder = { name, type: "tree", children: [] };
      nodes.push(folder);
    }
    if (!folder.children) folder.children = [];
    return ensureFolder(folder.children, folderParts, depth + 1);
  };

  if (isFolder) {
    ensureFolder(clone, parts, 0);
    return clone;
  }

  const fileName = parts[parts.length - 1];
  const folderParts = parts.slice(0, -1);
  const parent =
    folderParts.length === 0
      ? clone
      : (() => {
          const root = { name: "__root__", type: "tree", children: clone };
          ensureFolder(root.children, folderParts, 0);
          let current = root.children;
          for (const part of folderParts) {
            current = current.find((n) => n.name === part).children;
          }
          return current;
        })();

  if (!parent.find((n) => n.path === filePath || n.name === fileName)) {
    parent.push({ name: fileName, type: "blob", path: filePath });
    parent.sort((a, b) => {
      if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return clone;
}

function openPreviewInBrowserTab(openTabs, previewWindowRef) {
  const { html, css, js } = collectWebAssets(openTabs);
  const doc = buildPreviewDocument(html, css, js);
  const blob = new Blob([doc], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const existing = previewWindowRef.current;
  if (existing && !existing.closed) {
    existing.location.href = url;
    existing.focus();
  } else {
    const newWindow = window.open(url, PREVIEW_WINDOW_NAME);
    previewWindowRef.current = newWindow;
    if (newWindow) {
      newWindow.focus();
    }
  }

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function LoadingOverlay({ label, sublabel }) {
  const [dots, setDots] = useState("");
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
      style={{ 
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)"
      }}
    >
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
        {label}{dots}
      </p>
      {sublabel && (
        <p className="text-xs opacity-50" style={{ color: "var(--foreground)" }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

function MonacoEditor({ theme, value, onChange, language, path }) {
  const [Editor, setEditor] = useState(null);
  const [loadingMonaco, setLoadingMonaco] = useState(true);

  useEffect(() => {
    let cancelled = false;
    import("@monaco-editor/react").then((mod) => {
      if (!cancelled) {
        setEditor(() => mod.default);
        setLoadingMonaco(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Editor || loadingMonaco) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
          <span className="text-xs text-gray-400">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      path={path}
      value={value}
      onChange={onChange}
      theme={theme === "dark" ? "vs-dark" : "light"}
      loading={
        <div className="flex h-full items-center justify-center bg-white">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
        fontLigatures: true,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 20, bottom: 20 },
        lineNumbers: "on",
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        bracketPairColorization: { enabled: true },
        quickSuggestions: { other: true, comments: false, strings: true },
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: "matchingDocuments",
        parameterHints: { enabled: true },
        acceptSuggestionOnEnter: "on",
        tabCompletion: "on",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        folding: true,
        renderLineHighlight: "all",
        renderWhitespace: "selection",
        guides: { indentation: true, bracketPairs: true },
        stickyScroll: { enabled: true },
        mouseWheelZoom: true,
        semanticHighlighting: { enabled: true },
      }}
    />
  );
}

function EditorTabBar({
  openTabs,
  activeTabPath,
  onSelectTab,
  onCloseTab,
  onOpenPreview,
  showPreviewButton,
}) {
  const fileName = (path) => path.split("/").pop();

  return (
    <div
      className="flex items-center overflow-x-auto shrink-0 border-b"
      style={{ 
        backgroundColor: "#ffffff", 
        borderBottomColor: "#e5e7eb",
        scrollbarWidth: "thin",
      }}
    >
      <div className="flex items-center gap-0.5 px-1">
        {openTabs.map((tab) => {
          const isActive = activeTabPath === tab.path;
          const isDirty = tab.content !== tab.savedContent;
          
          return (
            <div
              key={tab.path}
              className="group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer shrink-0 max-w-[200px] rounded-t-lg transition-all duration-150"
              style={{
                backgroundColor: isActive ? "#ffffff" : "#f9fafb",
                color: isActive ? "#111827" : "#6b7280",
                borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                marginTop: isActive ? "0px" : "2px",
              }}
              onClick={() => onSelectTab(tab.path)}
              title={tab.path}
            >
              <File size={12} className="shrink-0" style={{ color: isActive ? "var(--primary)" : "#60a5fa" }} />
              <span className="truncate text-[11px]">{fileName(tab.path)}</span>
              {tab.isNew && (
                <span 
                  className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-medium"
                  style={{ backgroundColor: "var(--primary)/10", color: "var(--primary)" }}
                >
                  new
                </span>
              )}
              {isDirty && (
                <span 
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse" 
                  style={{ backgroundColor: "var(--primary)" }} 
                />
              )}
              {tab.loading && <Loader2 size={10} className="animate-spin shrink-0" />}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-gray-100 shrink-0 transition-all"
                style={{ color: "#9ca3af" }}
                aria-label={`Close ${fileName(tab.path)}`}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
      
      <div className="ml-auto flex items-center gap-1 px-2">
        {showPreviewButton && (
          <button
            type="button"
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] shrink-0 rounded-lg transition-all hover:scale-[1.02] active:scale-95 font-medium"
            style={{ 
              backgroundColor: "var(--primary)", 
              color: "white",
              boxShadow: "0 2px 10px -3px var(--primary)/40"
            }}
            title="Open preview in a new browser tab"
          >
            <Globe size={12} />
            Preview
          </button>
        )}
      </div>
    </div>
  );
}

function ContextMenu({ x, y, onClose, onNewFile, onNewFolder, onRename, onDelete }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    { icon: FilePlus, label: "New File", onClick: onNewFile },
    { icon: FolderPlus, label: "New Folder", onClick: onNewFolder },
    { divider: true },
    { icon: Pencil, label: "Rename", onClick: onRename },
    { icon: Trash2, label: "Delete", onClick: onDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: y,
        left: x,
        backgroundColor: "#FFFFFF",
        border: "1px solid #e5e7eb",
        boxShadow: "0 20px 60px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={index} className="my-1.5 mx-2" style={{ borderTop: "1px solid #f3f4f6" }} />;
        }
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all hover:bg-gray-50"
            style={{ 
              color: item.danger ? "#ef4444" : "#111827",
            }}
          >
            <Icon size={14} />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function InlineCreationForm({ targetFolder, type, onSubmit, onCancel, level }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), type);
    }
  };

  const getPlaceholder = () => {
    if (type === "file") {
      const examples = ["index.html", "styles.css", "app.js", "config.json"];
      return examples[Math.floor(Math.random() * examples.length)];
    }
    return "components";
  };

  const getFolderDisplay = () => {
    if (!targetFolder) return "root";
    return targetFolder;
  };

  return (
    <div className="mt-1 mb-1 animate-in slide-in-from-left-2 fade-in duration-200">
      <div className="flex items-center gap-1.5" style={{ paddingLeft: `${level * 12 + 8}px` }}>
        {type === "folder" ? (
          <Folder size={14} className="text-yellow-500 shrink-0" />
        ) : (
          <File size={14} className="text-blue-400 shrink-0" />
        )}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 transition-all bg-white border border-gray-200 text-gray-900"
            style={{
              ringColor: "var(--primary)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
            }}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"
            style={{ color: "var(--primary)" }}
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-400"
          >
            <X size={14} />
          </button>
        </form>
      </div>
      <div 
        className="text-[9px] mt-1 opacity-40" 
        style={{ paddingLeft: `${level * 12 + 28}px` }}
      >
        {getFolderDisplay()}
      </div>
    </div>
  );
}

function FileTreeNode({ 
  node, 
  path, 
  onFileSelect, 
  expandedFolders, 
  setExpandedFolders, 
  level = 0, 
  onContextMenu,
  activeCreation,
  onCreationComplete,
  activeFilePath,
}) {
  if (node.name === ".gitkeep") return null;

  const isFolder = node.type === "tree";
  const nodePath = path ? `${path}/${node.name}` : node.name;
  const isExpanded = expandedFolders.includes(nodePath);
  const isCreatingHere = activeCreation?.active && activeCreation?.targetPath === nodePath;
  const isActiveFile = !isFolder && node.path === activeFilePath;

  const toggleFolder = (e) => {
    e.stopPropagation();
    if (isExpanded) {
      setExpandedFolders(expandedFolders.filter((f) => f !== nodePath));
    } else {
      setExpandedFolders([...expandedFolders, nodePath]);
    }
  };

  const handleFileClick = () => {
    if (!isFolder) {
      onFileSelect(node);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, node, nodePath, isFolder);
  };

  return (
    <div>
      <div
        onClick={isFolder ? toggleFolder : handleFileClick}
        onContextMenu={handleContextMenu}
        className="group flex items-center gap-1.5 pr-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150"
        style={{
          paddingLeft: `${level * 12 + 8}px`,
          ...(isActiveFile ? { 
            color: "var(--primary)",
            backgroundColor: "#f0f9ff",
            fontWeight: 500,
          } : {
            color: "#374151",
          }),
        }}
        onMouseEnter={(e) => {
          if (!isActiveFile) {
            e.currentTarget.style.backgroundColor = "#f9fafb";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActiveFile) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <FolderOpen size={15} className="text-yellow-500 shrink-0" />
            ) : (
              <Folder size={15} className="text-yellow-500 shrink-0" />
            )}
            <span className="flex-1 truncate text-[11px] font-medium">{node.name}</span>
            <ChevronDown 
              size={12} 
              className={`transition-transform duration-200 shrink-0 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
              style={{ color: "#9ca3af" }}
            />
          </>
        ) : (
          <>
            <File size={15} className="text-blue-400 shrink-0" />
            <span className="flex-1 truncate text-[11px]">{node.name}</span>
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, node, nodePath, isFolder);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all hover:bg-gray-100"
          style={{ color: "#9ca3af" }}
        >
          <MoreVertical size={12} />
        </button>
      </div>

      {isFolder && isExpanded && node.children && (
        <div>
          {isCreatingHere && (
            <InlineCreationForm
              targetFolder={nodePath}
              type={activeCreation.type}
              onSubmit={(name, type) => onCreationComplete(nodePath, name, type)}
              onCancel={() => onCreationComplete(null, null, null)}
              level={level + 1}
            />
          )}
          {node.children.map((child) => (
            <FileTreeNode
              key={child.name}
              node={child}
              path={nodePath}
              onFileSelect={onFileSelect}
              expandedFolders={expandedFolders}
              setExpandedFolders={setExpandedFolders}
              level={level + 1}
              onContextMenu={onContextMenu}
              activeCreation={activeCreation}
              onCreationComplete={onCreationComplete}
              activeFilePath={activeFilePath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function buildHierarchicalTree(flatTree) {
  const root = {};

  flatTree.forEach((item) => {
    const parts = item.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      if (!current[folderName]) {
        current[folderName] = {
          name: folderName,
          type: "tree",
          children: {},
        };
      }
      current = current[folderName].children;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = {
      name: fileName,
      type: "blob",
      path: item.path,
    };
  });

  const convertToArray = (obj) => {
    return Object.keys(obj).map((key) => {
      const item = obj[key];
      if (item.type === "tree" && item.children) {
        return {
          name: item.name,
          type: "tree",
          children: convertToArray(item.children),
        };
      }
      return {
        name: item.name,
        type: item.type,
        path: item.path,
      };
    });
  };

  return convertToArray(root);
}

const VIEWPORT_CLASS =
  "fixed inset-x-0 bottom-0 top-16 sm:top-20 z-0 flex flex-col overflow-hidden";

export default function CodeSpaceContent() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoTree, setRepoTree] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabPath, setActiveTabPath] = useState(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef(null);
  const previewWindowRef = useRef(null);
  const previewDebounceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [renamePath, setRenamePath] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [githubWriteAccess, setGithubWriteAccess] = useState(true);
  const [previewOpened, setPreviewOpened] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState("");
  const [executionError, setExecutionError] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const pyodideRef = useRef(null);
  const pyodideInitRef = useRef(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    node: null, 
    path: "", 
    isFolder: false 
  });
  
  // Active creation state
  const [activeCreation, setActiveCreation] = useState({ 
    active: false, 
    targetPath: null, 
    type: "file" 
  });

  const activeTab = useMemo(
    () => openTabs.find((t) => t.path === activeTabPath) ?? null,
    [openTabs, activeTabPath]
  );
  const dirtyTabs = useMemo(
    () => openTabs.filter((t) => t.content !== t.savedContent),
    [openTabs]
  );
  const showPreviewButton = useMemo(
    () => openTabs.some((t) => isWebFile(t.path)),
    [openTabs]
  );
  const activeFilePathForTree = activeTabPath;

  // Handle preview opening - only when user clicks the button
  const handleOpenPreview = useCallback(() => {
    openPreviewInBrowserTab(openTabs, previewWindowRef);
    setPreviewOpened(true);
    
    setMessage({
      type: "success",
      text: "🚀 Preview opened! Edit your code and click Preview again to refresh.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  }, [openTabs]);

  // Handle Python code execution with Pyodide
  const handleExecutePython = useCallback(async () => {
    if (!activeTab) {
      setMessage({ type: "error", text: "❌ No file is open" });
      return;
    }

    const lang = getLanguageFromPath(activeTab.path);
    if (lang !== "python") {
      setMessage({ type: "error", text: "❌ Current file is not a Python file" });
      return;
    }

    if (!pyodideRef.current) {
      setMessage({
        type: "error",
        text: pyodideLoading
          ? "⏳ Python runtime is still loading. Please wait..."
          : "⚠️ Python runtime failed to load. Refresh the page and try again.",
      });
      return;
    }

    setIsExecuting(true);
    setExecutionOutput("");
    setExecutionError("");
    setShowOutput(true);

    const pyodide = pyodideRef.current;
    pyodide.globals.set("_browser_prompt", (msg) => window.prompt(String(msg ?? "")));

    try {
      pyodide.globals.set("__user_code", activeTab.content);

      const result = await pyodide.runPythonAsync(`
import sys
import builtins
from io import StringIO

def _browser_input(prompt=""):
    result = _browser_prompt(str(prompt))
    if result is None:
        raise EOFError("EOF when reading a line")
    return result

builtins.input = _browser_input

_old_stdout, _old_stderr = sys.stdout, sys.stderr
_captured = StringIO()
sys.stdout = _captured
sys.stderr = _captured

try:
    exec(compile(__user_code, "<stdin>", "exec"), globals())
except Exception:
    import traceback
    traceback.print_exc()

sys.stdout = _old_stdout
sys.stderr = _old_stderr
_captured.getvalue()
      `);

      const output = result?.toString?.() ?? String(result ?? "");

      if (output.includes("Traceback (most recent call last)")) {
        setExecutionError(output.trim());
        setMessage({ type: "error", text: "❌ Execution failed. See output for details." });
      } else if (output.trim()) {
        setExecutionOutput(output.trim());
        setMessage({ type: "success", text: "✅ Code executed successfully!" });
      } else {
        setExecutionOutput("Code executed successfully (no output)");
        setMessage({ type: "success", text: "✅ Code executed successfully!" });
      }
    } catch (error) {
      const errorMsg = String(error?.message || error);
      setExecutionError(errorMsg);
      setMessage({ type: "error", text: "❌ Execution failed." });
    } finally {
      setIsExecuting(false);
    }
  }, [activeTab, pyodideLoading]);

  // REMOVED auto-refresh preview effect - preview only updates on explicit button click
  // No more auto-refresh when typing

  const updateTabContent = useCallback((path, content) => {
    setOpenTabs((prev) =>
      prev.map((tab) => (tab.path === path ? { ...tab, content } : tab))
    );
  }, []);

  const closeTab = useCallback((path) => {
    const tab = openTabs.find((t) => t.path === path);
    if (tab && tab.content !== tab.savedContent) {
      if (!confirm(`"${path.split("/").pop()}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    const closedIndex = openTabs.findIndex((t) => t.path === path);
    const nextTabs = openTabs.filter((t) => t.path !== path);
    setOpenTabs(nextTabs);

    if (activeTabPath === path) {
      const fallback = nextTabs[closedIndex] ?? nextTabs[closedIndex - 1] ?? null;
      setActiveTabPath(fallback?.path ?? null);
    }
  }, [openTabs, activeTabPath]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (session?.user?.provider === "github") {
      fetchRepositories();
      fetch("/api/github/status")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setGithubWriteAccess(data.hasWrite);
        })
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize Pyodide
  useEffect(() => {
    if (typeof window === "undefined" || pyodideInitRef.current) return;
    pyodideInitRef.current = true;

    const initPyodide = async () => {
      setPyodideLoading(true);
      try {
        if (window.loadPyodide && !pyodideRef.current) {
          const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
          pyodideRef.current = pyodide;
          setPyodideReady(true);
          return;
        }

        const script = document.createElement("script");
        script.src = `${PYODIDE_CDN}pyodide.js`;
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error("Failed to load Pyodide script"));
          document.head.appendChild(script);
        });

        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
        pyodideRef.current = pyodide;
        setPyodideReady(true);
      } catch (error) {
        console.error("Failed to initialize Pyodide:", error);
        pyodideInitRef.current = false;
        setPyodideReady(false);
        setMessage({
          type: "error",
          text: "⚠️ Python runtime failed to load. Refresh the page and try again.",
        });
      } finally {
        setPyodideLoading(false);
      }
    };

    initPyodide();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/github/repositories");
      const data = await response.json();

      if (data.success) {
        setRepositories(data.repositories);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to fetch repositories: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchRepositoryTree = async (repo, { soft = false } = {}) => {
    try {
      setLoadingTree(true);
      if (!soft) setLoadingOperation("tree");
      const response = await fetch("/api/github/tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: repo.owner,
          repo: repo.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.branch) setCurrentBranch(data.branch);
        const hierarchicalTree = buildHierarchicalTree(data.tree);
        setRepoTree(hierarchicalTree);
        if (!soft) setExpandedFolders([]);
        if (data.empty) {
          setMessage({
            type: "success",
            text: "✨ Repository is empty — right-click or use the + buttons to get started",
          });
          setTimeout(() => setMessage({ type: "", text: "" }), 4000);
        }
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to fetch repository tree: ${error.message}` });
    } finally {
      setLoadingTree(false);
      if (!soft) setLoadingOperation(null);
    }
  };

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    setCurrentBranch(repo.defaultBranch || null);
    setIsDropdownOpen(false);
    setOpenTabs([]);
    setActiveTabPath(null);
    setCommitMessage("");
    setShowRenameForm(false);
    setRenamePath("");
    setRenameTarget(null);
    setActiveCreation({ active: false, targetPath: null, type: "file" });
    setPreviewOpened(false);
    fetchRepositoryTree(repo);
  };

  const fetchFileContent = async (owner, repo, path) => {
    const existing = openTabs.find((t) => t.path === path);
    if (existing && !existing.loading) {
      setActiveTabPath(path);
      return;
    }

    setOpenTabs((prev) => {
      const found = prev.find((t) => t.path === path);
      if (found) {
        return prev.map((t) => (t.path === path ? { ...t, loading: true } : t));
      }
      return [...prev, { path, content: "", savedContent: "", loading: true }];
    });
    setActiveTabPath(path);
    setLoadingOperation("fetch-file");

    try {
      const response = await fetch("/api/github/file-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, path, branch: currentBranch }),
      });

      const data = await response.json();

      if (data.success) {
        setOpenTabs((prev) =>
          prev.map((t) =>
            t.path === path
              ? { path, content: data.content, savedContent: data.content, loading: false }
              : t
          )
        );
      } else {
        setOpenTabs((prev) => prev.filter((t) => t.path !== path));
        setActiveTabPath((current) => (current === path ? null : current));
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setOpenTabs((prev) => prev.filter((t) => t.path !== path));
      setActiveTabPath((current) => (current === path ? null : current));
      setMessage({ type: "error", text: `Failed to fetch file: ${error.message}` });
    } finally {
      setLoadingOperation(null);
    }
  };

  const handleFileSelect = (fileNode) => {
    if (selectedRepo) {
      fetchFileContent(selectedRepo.owner, selectedRepo.name, fileNode.path);
    }
  };

  const handleCommit = async (tabPath = activeTabPath) => {
    if (!commitMessage.trim()) {
      setMessage({ type: "error", text: "Please enter a commit message" });
      return;
    }
    if (!selectedRepo || !tabPath) return;

    const tab = openTabs.find((t) => t.path === tabPath);
    if (!tab || tab.content === tab.savedContent) return;

    try {
      setSaving(true);
      setLoadingOperation("commit");
      const response = await fetch("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          path: tab.path,
          message: commitMessage,
          content: tab.content,
          branch: currentBranch,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ File committed successfully!" });
        setOpenTabs((prev) =>
          prev.map((t) =>
            t.path === tab.path
              ? { ...t, savedContent: t.content, isNew: false }
              : t
          )
        );
        setRepoTree((prev) => (prev ? addPathToTree(prev, tab.path) : prev));
        setCommitMessage("");
        if (data.branch) setCurrentBranch(data.branch);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to commit: ${error.message}` });
    } finally {
      setSaving(false);
      setLoadingOperation(null);
    }
  };

  const handleCommitAll = async () => {
    if (!commitMessage.trim()) {
      setMessage({ type: "error", text: "Please enter a commit message" });
      return;
    }
    if (!selectedRepo || dirtyTabs.length === 0) return;

    try {
      setSaving(true);
      setLoadingOperation("commit-all");

      if (dirtyTabs.length === 1) {
        await handleCommit(dirtyTabs[0].path);
        return;
      }

      const response = await fetch("/api/github/commit-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          message: commitMessage,
          branch: currentBranch,
          files: dirtyTabs.map((t) => ({ path: t.path, content: t.content })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✅ ${dirtyTabs.length} files committed successfully!`,
        });
        setOpenTabs((prev) =>
          prev.map((t) =>
            dirtyTabs.some((d) => d.path === t.path)
              ? { ...t, savedContent: t.content, isNew: false }
              : t
          )
        );
        setRepoTree((prev) => {
          if (!prev) return prev;
          return dirtyTabs.reduce((tree, t) => addPathToTree(tree, t.path), prev);
        });
        setCommitMessage("");
        if (data.branch) setCurrentBranch(data.branch);
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to commit: ${error.message}` });
    } finally {
      setSaving(false);
      setLoadingOperation(null);
    }
  };

  const normalizeFolderPath = (input) =>
    input.trim().replace(/^\/+/, "").replace(/\/+$/, "");

  const expandPathAndParents = (folderPath) => {
    if (!folderPath) return;
    const parts = folderPath.split("/").filter(Boolean);
    const paths = [];
    for (let i = 0; i < parts.length; i++) {
      paths.push(parts.slice(0, i + 1).join("/"));
    }
    setExpandedFolders((prev) => {
      const newPaths = paths.filter(p => !prev.includes(p));
      return [...prev, ...newPaths];
    });
  };

  const handleCreateItem = async (targetPath, itemName, type = "file") => {
    if (!selectedRepo) {
      setMessage({ type: "error", text: "Please select a repository" });
      return;
    }

    if (!itemName || !itemName.trim()) {
      setMessage({ type: "error", text: "Please enter a name" });
      return;
    }

    const isFolder = type === "folder";
    let fullPath;
    
    if (targetPath) {
      fullPath = `${targetPath}/${itemName}`;
    } else {
      fullPath = itemName;
    }

    const filePath = fullPath.replace(/^\/+/, "");

    if (!isFolder) {
      const existing = openTabs.find((t) => t.path === filePath);
      if (existing) {
        setActiveTabPath(filePath);
        setMessage({ type: "error", text: "File is already open" });
        return;
      }

      const starter = getStarterContent(filePath);
      setRepoTree((prev) => addPathToTree(prev || [], filePath));
      const pathParts = filePath.split("/");
      if (pathParts.length > 1) {
        expandPathAndParents(pathParts.slice(0, -1).join("/"));
      } else if (targetPath) {
        expandPathAndParents(targetPath);
      }

      setOpenTabs((prev) => [
        ...prev,
        { path: filePath, content: starter, savedContent: "", loading: false, isNew: true },
      ]);
      setActiveTabPath(filePath);
      setCommitMessage(`Add ${filePath}`);
      setActiveCreation({ active: false, targetPath: null, type: "file" });
      setMessage({
        type: "success",
        text: `✅ "${filePath.split("/").pop()}" created — edit and commit when ready`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      return;
    }

    const finalPath = `${normalizeFolderPath(fullPath)}/.gitkeep`;

    try {
      setSaving(true);
      setLoadingOperation("create");
      const response = await fetch("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          path: finalPath,
          message: `Create folder ${fullPath}`,
          content: "",
          branch: currentBranch,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "✅ Folder created successfully!" });
        const folderPath = normalizeFolderPath(fullPath);
        expandPathAndParents(folderPath);
        setRepoTree((prev) => addPathToTree(prev || [], folderPath, true));
        setActiveCreation({ active: false, targetPath: null, type: "file" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to create folder: ${error.message}`,
      });
    } finally {
      setSaving(false);
      setLoadingOperation(null);
    }
  };

  const startRename = (fullPath, isFolder) => {
    setRenameTarget({ oldPath: fullPath, isFolder });
    setRenamePath(fullPath);
    setShowRenameForm(true);
  };

  const cancelRename = () => {
    setShowRenameForm(false);
    setRenamePath("");
    setRenameTarget(null);
  };

  const handleRename = async () => {
    if (!renamePath.trim() || !renameTarget || !selectedRepo) {
      setMessage({ type: "error", text: "Please enter a new path" });
      return;
    }

    const { oldPath, isFolder } = renameTarget;
    const newPath = renamePath.trim();

    const dirtyTab = openTabs.find((t) => t.path === oldPath && t.content !== t.savedContent);
    if (!isFolder && dirtyTab) {
      setMessage({ type: "error", text: "Commit or discard your changes before renaming" });
      return;
    }

    if (newPath === oldPath) {
      cancelRename();
      return;
    }

    try {
      setSaving(true);
      setLoadingOperation("rename");
      const response = await fetch("/api/github/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          oldPath,
          newPath,
          message: `Rename ${oldPath} to ${newPath}`,
          branch: currentBranch,
          isFolder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✅ ${isFolder ? "Folder" : "File"} renamed successfully!`,
        });

        if (!isFolder) {
          setOpenTabs((prev) =>
            prev.map((t) =>
              t.path === oldPath ? { ...t, path: newPath } : t
            )
          );
          if (activeTabPath === oldPath) setActiveTabPath(newPath);
        } else {
          setOpenTabs((prev) =>
            prev.map((t) => {
              if (t.path === oldPath || t.path.startsWith(`${oldPath}/`)) {
                const suffix = t.path.slice(oldPath.length);
                return { ...t, path: `${newPath}${suffix}` };
              }
              return t;
            })
          );
          if (activeTabPath?.startsWith(`${oldPath}/`) || activeTabPath === oldPath) {
            const suffix = activeTabPath.slice(oldPath.length);
            setActiveTabPath(`${newPath}${suffix}`);
          }
        }

        cancelRename();
        fetchRepositoryTree(selectedRepo, { soft: true });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to rename: ${error.message}` });
    } finally {
      setSaving(false);
      setLoadingOperation(null);
    }
  };

  const handleDelete = async (node, fullPath, isFolder) => {
    if (!selectedRepo) return;

    const confirmMessage = isFolder
      ? `Are you sure you want to delete the folder "${node.name}" and all its contents? This action cannot be undone.`
      : `Are you sure you want to delete the file "${node.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      setSaving(true);
      setLoadingOperation("delete");
      const response = await fetch("/api/github/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: selectedRepo.owner,
          repo: selectedRepo.name,
          path: fullPath,
          message: `Delete ${isFolder ? "folder" : "file"} ${node.name}`,
          branch: currentBranch,
          isFolder,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `✅ ${isFolder ? "Folder" : "File"} deleted successfully!`,
        });

        setOpenTabs((prev) =>
          prev.filter(
            (t) =>
              t.path !== fullPath &&
              !(isFolder && t.path.startsWith(`${fullPath}/`))
          )
        );
        if (
          activeTabPath === fullPath ||
          (isFolder && activeTabPath?.startsWith(`${fullPath}/`))
        ) {
          setActiveTabPath(null);
        }
        setShowRenameForm(false);
        setRenameTarget(null);

        fetchRepositoryTree(selectedRepo, { soft: true });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: `Error: ${data.error}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to delete: ${error.message}` });
    } finally {
      setSaving(false);
      setLoadingOperation(null);
    }
  };

  const handleContextMenu = (e, node, nodePath, isFolder) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
      path: nodePath,
      isFolder,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const startCreation = (targetPath, type) => {
    setActiveCreation({ active: false, targetPath: null, type: "file" });
    setTimeout(() => {
      setActiveCreation({ active: true, targetPath, type });
    }, 10);
    closeContextMenu();
  };

  const handleCreationComplete = (targetPath, name, type) => {
    if (targetPath === null) {
      setActiveCreation({ active: false, targetPath: null, type: "file" });
    } else {
      handleCreateItem(targetPath, name, type);
    }
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadingLabel = useMemo(() => {
    const labels = {
      "commit": { label: "Committing changes", sub: "Pushing to GitHub..." },
      "commit-all": { label: "Committing all files", sub: "Syncing with repository..." },
      "create": { label: "Creating folder", sub: "Setting up structure..." },
      "fetch-file": { label: "Loading file", sub: "Fetching from GitHub..." },
      "tree": { label: "Refreshing", sub: "Syncing repository..." },
      "delete": { label: "Deleting", sub: "Removing from repository..." },
      "rename": { label: "Renaming", sub: "Updating references..." },
    };
    return labels[loadingOperation] || { label: "Working...", sub: "Please wait" };
  }, [loadingOperation]);

  // SIMPLE loading state instead of skeleton
  if (status === "loading") {
    return (
      <div className={`${VIEWPORT_CLASS} items-center justify-center bg-white`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--primary)" }} />
          <p className="text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.provider !== "github") {
    return (
      <div className={`${VIEWPORT_CLASS} items-center justify-center p-4 bg-white`}>
        <div className="text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-6 inline-flex p-4 rounded-2xl bg-gray-50">
            <Code2 size={48} style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-gray-900">GitHub CodeSpace</h1>
          <p className="text-sm mb-6 leading-relaxed text-gray-500">
            Connect your GitHub account to access, edit, and preview your repositories in a powerful browser-based IDE.
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
            style={{ 
              backgroundColor: "var(--primary)", 
              color: "white",
              boxShadow: "0 4px 15px -5px var(--primary)/40"
            }}
          >
            <Code2 size={20} />
            Sign in with GitHub
          </a>
          <p className="text-xs flex items-center justify-center gap-1 mt-4 text-gray-300">
            <Sparkles size={10} />
            Real-time preview • Syntax highlighting • Git integration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={VIEWPORT_CLASS} style={{ backgroundColor: "#ffffff" }}>
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          onNewFile={() => startCreation(contextMenu.path, "file")}
          onNewFolder={() => startCreation(contextMenu.path, "folder")}
          onRename={() => {
            startRename(contextMenu.path, contextMenu.isFolder);
            closeContextMenu();
          }}
          onDelete={() => {
            handleDelete(contextMenu.node, contextMenu.path, contextMenu.isFolder);
            closeContextMenu();
          }}
        />
      )}

      {!githubWriteAccess && (
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 text-xs border-b"
          style={{ 
            background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "white", 
            borderBottomColor: "rgba(255,255,255,0.1)" 
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span>GitHub write access is missing. Sign out and sign in again to grant repository permissions.</span>
          </div>
          <a
            href="/api/auth/signout"
            className="shrink-0 px-4 py-1.5 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}
          >
            Sign out
          </a>
        </div>
      )}

      {/* Toast notification */}
      {message.text && (
        <div 
          className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200"
          style={{ maxWidth: "450px" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm"
            style={{
              backgroundColor: message.type === "error" 
                ? "#ef4444" 
                : "#22c55e",
              color: "white",
              boxShadow: message.type === "error"
                ? "0 10px 40px -10px rgba(239,68,68,0.4)"
                : "0 10px 40px -10px rgba(34,197,94,0.4)",
            }}
          >
            {message.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div 
        className="h-12 border-b flex items-center px-3 gap-2 shrink-0"
        style={{ 
          backgroundColor: "#ffffff", 
          borderBottomColor: "#e5e7eb",
        }}
      >
        {/* Repository Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-gray-50"
            style={{ 
              backgroundColor: isDropdownOpen ? "#f3f4f6" : "transparent",
              color: "#111827",
              minWidth: "170px",
              border: "1px solid #e5e7eb"
            }}
          >
            <GitBranch size={14} style={{ color: "var(--primary)" }} />
            <span className="flex-1 text-left truncate">
              {selectedRepo ? selectedRepo.name : "Select Repository"}
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 text-gray-400 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div 
              className="absolute top-full left-0 mt-1 w-80 rounded-xl shadow-2xl border z-50 animate-in slide-in-from-top-2 fade-in duration-200"
              style={{ 
                backgroundColor: "#FFFFFF",
                borderColor: "#e5e7eb",
                maxHeight: "420px",
                overflow: "hidden",
                boxShadow: "0 20px 60px -15px rgba(0,0,0,0.15)",
              }}
            >
              <div className="p-3 border-b" style={{ borderBottomColor: "#f3f4f6" }}>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 bg-gray-50 border border-gray-200 text-gray-900"
                    style={{
                      ringColor: "var(--primary)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "340px" }}>
                <button
                  onClick={fetchRepositories}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs transition-all hover:bg-gray-50 disabled:opacity-50 text-gray-500"
                >
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Refresh Repositories
                </button>

                {filteredRepositories.length === 0 && !loading && (
                  <div className="text-center py-6">
                    <Folder size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-gray-400">No repositories found</p>
                  </div>
                )}

                {filteredRepositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-gray-50 text-left"
                    style={{
                      backgroundColor: selectedRepo?.id === repo.id ? "#f3f4f6" : "transparent",
                    }}
                  >
                    <GitBranch size={12} className="text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-gray-900">{repo.name}</p>
                      {repo.description && (
                        <p className="truncate text-[10px] mt-0.5 text-gray-500">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    {selectedRepo?.id === repo.id && (
                      <Check size={14} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedRepo && (
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200"
            >
              <GitBranch size={11} />
              <span className="truncate max-w-[100px]">{currentBranch || "main"}</span>
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => startCreation(null, "file")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] transition-all hover:bg-gray-50 font-medium text-gray-500"
                title="New File"
              >
                <FilePlus size={13} />
                File
              </button>
              <button
                onClick={() => startCreation(null, "folder")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] transition-all hover:bg-gray-50 font-medium text-gray-500"
                title="New Folder"
              >
                <FolderPlus size={13} />
                Folder
              </button>
            </div>
          </div>
        )}

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-1 text-[10px] text-gray-300">
          <span>💡 Right-click → New File/Folder</span>
        </div>

        {selectedRepo && (
          <button
            onClick={() => fetchRepositoryTree(selectedRepo)}
            className="p-1.5 rounded-lg transition-all hover:bg-gray-100 text-gray-400"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        )}

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg transition-all hover:bg-gray-100 text-gray-400"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div 
          className="flex w-64 min-h-0 shrink-0 flex-col border-r"
          style={{ 
            backgroundColor: "#ffffff", 
            borderRightColor: "#e5e7eb"
          }}
        >
          {showRenameForm && renameTarget && (
            <div
              className="border-b px-3 py-2.5 shrink-0 space-y-1.5"
              style={{ borderBottomColor: "#e5e7eb", backgroundColor: "#ffffff" }}
            >
              <p className="text-[9px] uppercase tracking-wider font-semibold text-gray-400">
                Rename {renameTarget.isFolder ? "folder" : "file"}
              </p>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={renamePath}
                  onChange={(e) => setRenamePath(e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 transition-all bg-white border border-gray-200 text-gray-900"
                  style={{
                    ringColor: "var(--primary)",
                  }}
                  placeholder={renameTarget.isFolder ? "new-folder-name" : "new/path/to/file.js"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename();
                    if (e.key === "Escape") cancelRename();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleRename}
                  disabled={saving}
                  className="p-1.5 rounded-lg disabled:opacity-30 transition-all"
                  style={{ color: "var(--primary)" }}
                  title="Confirm rename"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={cancelRename}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-400"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Sidebar Header */}
          <div 
            className="h-10 border-b flex items-center justify-between px-3 shrink-0"
            style={{ borderBottomColor: "#e5e7eb" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Explorer
            </span>
            {selectedRepo && (
              <div className="flex gap-0.5">
                <button
                  onClick={() => startCreation(null, "file")}
                  className="p-1 rounded-md transition-all hover:bg-gray-100 text-gray-300"
                  title="New File"
                >
                  <FilePlus size={13} />
                </button>
                <button
                  onClick={() => startCreation(null, "folder")}
                  className="p-1 rounded-md transition-all hover:bg-gray-100 text-gray-300"
                  title="New Folder"
                >
                  <FolderPlus size={13} />
                </button>
              </div>
            )}
          </div>

          {/* File Tree */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
            {!selectedRepo ? (
              <div className="flex flex-col items-center justify-center h-full px-4 gap-3">
                <Folder size={32} className="text-gray-200" />
                <p className="text-[10px] text-center text-gray-300">
                  Select a repository to explore files
                </p>
              </div>
            ) : loadingTree ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Loader2 size={16} className="animate-spin text-gray-300" />
                <span className="text-[10px] text-gray-300">Loading files...</span>
              </div>
            ) : (
              <>
                {activeCreation.active && activeCreation.targetPath === null && (
                  <InlineCreationForm
                    targetFolder={null}
                    type={activeCreation.type}
                    onSubmit={(name, type) => handleCreateItem("", name, type)}
                    onCancel={() => setActiveCreation({ active: false, targetPath: null, type: "file" })}
                    level={0}
                  />
                )}
                {repoTree && repoTree.length > 0 ? (
                  repoTree.map((node) => (
                    <FileTreeNode
                      key={node.name}
                      node={node}
                      path=""
                      onFileSelect={handleFileSelect}
                      expandedFolders={expandedFolders}
                      setExpandedFolders={setExpandedFolders}
                      onContextMenu={handleContextMenu}
                      activeCreation={activeCreation}
                      onCreationComplete={handleCreationComplete}
                      activeFilePath={activeFilePathForTree}
                    />
                  ))
                ) : !activeCreation.active ? (
                  <div className="text-center py-6 px-3">
                    <Folder size={24} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-[10px] text-gray-300">No files yet</p>
                    <p className="text-[9px] mt-1 text-gray-200">Click + to create files or folders</p>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Repo Info */}
          {selectedRepo?.description && (
            <div className="border-t p-2.5 shrink-0" style={{ borderTopColor: "#e5e7eb" }}>
              <p className="text-[10px] truncate text-gray-300 leading-relaxed">
                {selectedRepo.description}
              </p>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
          {loadingOperation && <LoadingOverlay label={loadingLabel.label} sublabel={loadingLabel.sub} />}
          {openTabs.length > 0 ? (
            <>
              <EditorTabBar
                openTabs={openTabs}
                activeTabPath={activeTabPath}
                onSelectTab={setActiveTabPath}
                onCloseTab={closeTab}
                onOpenPreview={handleOpenPreview}
                showPreviewButton={showPreviewButton}
              />

              {activeTab ? (
                <>
                  <div 
                    className="h-9 border-b flex items-center px-3 gap-2 shrink-0 text-[10px] bg-white"
                    style={{ borderBottomColor: "#e5e7eb" }}
                  >
                    <Code2 size={12} style={{ color: "var(--primary)" }} />
                    <span className="truncate flex-1 text-gray-400">{activeTab.path}</span>
                    {activeTab.isNew && (
                      <span 
                        className="px-1.5 py-0.5 rounded-md font-medium"
                        style={{ backgroundColor: "var(--primary)/10", color: "var(--primary)" }}
                      >
                        unsaved
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md text-gray-300 bg-gray-50">
                      {getLanguageFromPath(activeTab.path)}
                    </span>
                    <button
                      onClick={() => {
                        if (showRenameForm && renameTarget?.oldPath === activeTab.path) {
                          cancelRename();
                        } else {
                          startRename(activeTab.path, false);
                        }
                      }}
                      className="p-1 rounded-md transition-all hover:bg-gray-100 text-gray-300"
                      title="Rename file"
                    >
                      <Pencil size={11} />
                    </button>
                    {activeTab.content !== activeTab.savedContent && (
                      <span className="font-medium" style={{ color: "var(--primary)" }}>● Modified</span>
                    )}
                    {getLanguageFromPath(activeTab.path) === "python" && (
                      <button
                        type="button"
                        onClick={handleExecutePython}
                        disabled={isExecuting}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
                        style={{ color: "var(--primary)" }}
                        title={
                          pyodideReady
                            ? "Run Python code"
                            : pyodideLoading
                              ? "Loading Python runtime..."
                              : "Python runtime unavailable"
                        }
                      >
                        {isExecuting || (pyodideLoading && !pyodideReady) ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            {pyodideReady ? "Run" : pyodideLoading ? "Loading..." : "Run"}
                          </>
                        )}
                      </button>
                    )}
                    {showPreviewButton && (
                      <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] hover:bg-gray-50 font-medium transition-all"
                        style={{ color: "var(--primary)" }}
                        title="Click to open preview in new browser tab"
                      >
                        <Globe size={10} />
                        Preview
                      </button>
                    )}
                    {previewOpened && (
                      <span className="text-gray-300 text-[9px]">
                        (Preview open — click to refresh)
                      </span>
                    )}
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden flex flex-col">
                    {activeTab.loading ? (
                      <div className="flex h-full items-center justify-center gap-3 bg-white">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--primary)" }} />
                        <span className="text-xs text-gray-400">Loading file...</span>
                      </div>
                    ) : (
                      <>
                        <div className={`flex-1 min-h-0 overflow-hidden ${showOutput ? "" : ""}`}>
                          <MonacoEditor
                            key={activeTab.path}
                            value={activeTab.content}
                            onChange={(value) => updateTabContent(activeTab.path, value || "")}
                            language={getLanguageFromPath(activeTab.path)}
                            path={activeTab.path}
                            theme={theme === "dark" ? "vs-dark" : "vs-light"}
                          />
                        </div>
                        
                        {/* Output Panel */}
                        {showOutput && (
                          <div 
                            className="border-t flex flex-col"
                            style={{ borderTopColor: "#e5e7eb", height: "200px" }}
                          >
                            <div 
                              className="flex items-center justify-between px-3 py-2 shrink-0 bg-gray-50 border-b"
                              style={{ borderBottomColor: "#e5e7eb" }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                  Output
                                </span>
                                {isExecuting && (
                                  <Loader2 size={12} className="animate-spin" style={{ color: "var(--primary)" }} />
                                )}
                              </div>
                              <button
                                onClick={() => setShowOutput(false)}
                                className="p-1 rounded-md hover:bg-gray-200 transition-all text-gray-400"
                                title="Close output panel"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            
                            <div 
                              className="flex-1 overflow-y-auto p-3 bg-white font-mono text-xs"
                              style={{ color: executionError ? "#ef4444" : "#1f2937" }}
                            >
                              {executionError ? (
                                <div>
                                  <div style={{ color: "#ef4444", fontWeight: 500 }}>❌ Error:</div>
                                  <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: "8px" }}>
                                    {executionError}
                                  </pre>
                                </div>
                              ) : executionOutput ? (
                                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {executionOutput}
                                </pre>
                              ) : isExecuting ? (
                                <span style={{ color: "#9ca3af" }}>Executing code...</span>
                              ) : (
                                <span style={{ color: "#9ca3af" }}>No output</span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : null}

              {/* Commit Bar */}
              <div 
                className="h-14 border-t flex items-center gap-2 px-3 shrink-0 bg-white"
                style={{ borderTopColor: "#e5e7eb" }}
              >
                <GitCommit size={14} className="text-gray-300" />
                <input
                  type="text"
                  placeholder="Commit message..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-2 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 bg-white border border-gray-200 text-gray-900"
                  style={{
                    ringColor: "var(--primary)",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (dirtyTabs.length > 1) handleCommitAll();
                      else handleCommit();
                    }
                  }}
                />
                <button
                  onClick={() => handleCommit()}
                  disabled={
                    saving ||
                    !activeTab ||
                    activeTab.content === activeTab.savedContent ||
                    !commitMessage.trim()
                  }
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-30 shrink-0"
                  style={{ backgroundColor: "var(--primary)", color: "white" }}
                  title="Commit current file"
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={12} />
                      <span className="hidden sm:inline">Commit</span>
                    </>
                  )}
                </button>
                {dirtyTabs.length > 1 && (
                  <button
                    onClick={handleCommitAll}
                    disabled={saving || !commitMessage.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-30 shrink-0 border"
                    style={{
                      borderColor: "var(--primary)",
                      color: "var(--primary)",
                      backgroundColor: "transparent",
                    }}
                    title={`Commit all ${dirtyTabs.length} modified files`}
                  >
                    <GitCommit size={12} />
                    <span className="hidden sm:inline">All ({dirtyTabs.length})</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 bg-white">
              <div className="text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-6 inline-flex p-4 rounded-2xl bg-gray-50">
                  <Code2 size={40} style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">
                  {selectedRepo ? 'Select a File' : 'Welcome to CodeSpace'}
                </h3>
                <p className="text-sm mb-6 leading-relaxed text-gray-500">
                  {selectedRepo 
                    ? 'Choose a file from the explorer to start editing, or create new files with the + button.' 
                    : 'Select a repository from the dropdown above to get started with your code.'}
                </p>
                {selectedRepo && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => startCreation(null, "file")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-95"
                      style={{ backgroundColor: "var(--primary)", color: "white" }}
                    >
                      <FilePlus size={12} />
                      New File
                    </button>
                    <button
                      onClick={() => startCreation(null, "folder")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] active:scale-95 border border-gray-200 text-gray-600"
                    >
                      <FolderPlus size={12} />
                      New Folder
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-top-2 {
          from { transform: translateY(-0.5rem); }
          to { transform: translateY(0); }
        }
        
        @keyframes slide-in-from-left-2 {
          from { transform: translateX(-0.5rem); }
          to { transform: translateX(0); }
        }
        
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        
        .animate-in {
          animation-duration: 0.2s;
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation-name: fade-in;
        }
        
        .slide-in-from-top-2 {
          animation-name: slide-in-from-top-2;
        }
        
        .slide-in-from-left-2 {
          animation-name: slide-in-from-left-2;
        }
        
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </div>
  );
}