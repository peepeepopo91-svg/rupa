import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
const TOKEN_FILE = resolve(process.cwd(), ".github-token.json");
function resolveGitHubToken() {
  const envTok = process.env.GITHUB_TOKEN;
  if (envTok) return envTok;
  try {
    const data = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
    if (typeof data.token === "string" && data.token.trim()) return data.token.trim();
  } catch {
  }
  return null;
}
function resolveTokenSource() {
  try {
    const data = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
    const tok = data.token;
    if (typeof tok === "string" && tok.trim()) return { token: tok.trim(), source: "file" };
  } catch {
  }
  const envTok = process.env.GITHUB_TOKEN;
  if (envTok) return { token: envTok, source: "env" };
  return null;
}
function persistToken(token) {
  writeFileSync(TOKEN_FILE, JSON.stringify({ token }, null, 2), "utf8");
  process.env.GITHUB_TOKEN = token;
}
function eraseToken() {
  try {
    const data = JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
    if (data.token) {
      unlinkSync(TOKEN_FILE);
      delete process.env.GITHUB_TOKEN;
      return true;
    }
  } catch {
  }
  return false;
}
const OWNER = "peepeepopo91-svg";
const REPO = "rupa";
const BRANCH = "main";
const BASE = "https://api.github.com";
function getToken() {
  const token = resolveGitHubToken();
  if (!token) throw new Error("GITHUB_TOKEN secret is not configured");
  return token;
}
function buildHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}
async function ghFetch(path, init) {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: buildHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`GitHub API ${res.status} on ${path}: ${body}`);
  }
  return res.json();
}
async function commitFiles(files, message) {
  if (files.length === 0) throw new Error("commitFiles: no files provided");
  const ref = await ghFetch(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`);
  const headSha = ref.object.sha;
  const headCommit = await ghFetch(`/repos/${OWNER}/${REPO}/git/commits/${headSha}`);
  const baseTreeSha = headCommit.tree.sha;
  const blobs = await Promise.all(
    files.map(
      (f) => ghFetch(`/repos/${OWNER}/${REPO}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: "utf-8" })
      })
    )
  );
  const newTree = await ghFetch(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: files.map((f, i) => ({
        path: f.path,
        mode: "100644",
        type: "blob",
        sha: blobs[i].sha
      }))
    })
  });
  const newCommit = await ghFetch(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] })
  });
  await ghFetch(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: newCommit.sha })
  });
  return { sha: newCommit.sha };
}
async function getRepoStatus() {
  try {
    const data = await ghFetch(`/repos/${OWNER}/${REPO}/commits/${BRANCH}`);
    return {
      connected: true,
      branch: BRANCH,
      latestCommit: {
        message: data.commit.message,
        sha: data.sha.slice(0, 7),
        date: data.commit.author.date
      }
    };
  } catch {
    return { connected: false, branch: BRANCH, latestCommit: null };
  }
}
export {
  commitFiles as c,
  eraseToken as e,
  getRepoStatus as g,
  persistToken as p,
  resolveTokenSource as r
};
