#!/usr/bin/env node
/**
 * Cross-platform UI smoke test.
 * Replaces scripts/ui-smoke.sh for Windows compatibility.
 */
"use strict";

const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");

const PORT = process.env.UI_SMOKE_PORT || "4516";
const WAIT_SECONDS = Number(process.env.UI_SMOKE_WAIT_SECONDS || "10");
const ROOT = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT, "runtime");
const LOG_FILE = path.join(LOG_DIR, `ui-smoke-${PORT}.log`);

fs.mkdirSync(LOG_DIR, { recursive: true });

const logStream = fs.createWriteStream(LOG_FILE);
const child = spawn(process.execPath, ["--import", "tsx", "src/index.ts"], {
  cwd: ROOT,
  env: { ...process.env, UI_MODE: "true", UI_PORT: PORT },
  stdio: ["ignore", "pipe", "pipe"],
});

child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

function cleanup(code) {
  try { child.kill(); } catch (_) { /* ignore */ }
  process.exit(code);
}

process.on("SIGINT", () => cleanup(1));
process.on("SIGTERM", () => cleanup(1));

function fetch(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${PORT}${urlPath}`, (res) => {
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve({
        statusCode: res.statusCode || 0,
        headers: res.headers,
        body: data,
      }));
    });
    req.on("error", reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function waitForUI() {
  const deadline = Date.now() + WAIT_SECONDS * 1000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch("/healthz");
      if (res.statusCode === 200 && res.body.includes("\"ok\": true")) {
        return;
      }
      throw new Error(`unexpected health status ${res.statusCode}`);
    } catch (_) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error(`UI smoke failed: server did not become ready within ${WAIT_SECONDS}s.`);
  try { console.error(fs.readFileSync(LOG_FILE, "utf8")); } catch (_) { /* ignore */ }
  cleanup(1);
}

function hasAnyKeyword(body, keywords) {
  return keywords.some((kw) => body.includes(kw));
}

async function checkDashboardOrLogin() {
  const res = await fetch("/");
  if (res.statusCode === 200) {
    if (!hasAnyKeyword(res.body, ["OpenClaw", "Control Center", "总览", "Overview"])) {
      console.error(`FAIL: GET / returned 200 but dashboard markers were not found (${res.body.length} bytes).`);
      cleanup(1);
    }
    return;
  }

  const location = typeof res.headers.location === "string" ? res.headers.location : "";
  if (res.statusCode === 302 && location.startsWith("/login")) {
    const loginRes = await fetch("/login");
    if (loginRes.statusCode !== 200 || !hasAnyKeyword(loginRes.body, ["Local token", "本地令牌", "进入控制台"])) {
      console.error(`FAIL: GET /login did not render the expected auth page (${loginRes.statusCode}).`);
      cleanup(1);
    }
    return;
  }

  console.error(`FAIL: GET / returned unexpected status ${res.statusCode}.`);
  cleanup(1);
}

async function checkDocsOrLogin() {
  const res = await fetch("/docs?lang=en");
  if (res.statusCode === 200) {
    if (!hasAnyKeyword(res.body, ["Open document workbench", "Control Center", "Docs"])) {
      console.error(`FAIL: GET /docs?lang=en did not contain docs markers (${res.body.length} bytes).`);
      cleanup(1);
    }
      return;
  }

  const location = typeof res.headers.location === "string" ? res.headers.location : "";
  if (res.statusCode === 302 && location.startsWith("/login")) {
    return;
  }

  console.error(`FAIL: GET /docs?lang=en returned unexpected status ${res.statusCode}.`);
  cleanup(1);
}

async function checkGzipSupport() {
  const res = await new Promise((resolve, reject) => {
    const req = http.get(
      `http://127.0.0.1:${PORT}/`,
      { headers: { "Accept-Encoding": "gzip" } },
      (response) => {
        response.resume();
        response.on("end", () => resolve({
          statusCode: response.statusCode || 0,
          headers: response.headers,
        }));
      },
    );
    req.on("error", reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error("timeout")); });
  });

  const encoding = typeof res.headers["content-encoding"] === "string" ? res.headers["content-encoding"] : "";
  if (res.statusCode === 200 && encoding !== "gzip") {
    console.error("FAIL: dashboard HTML did not enable gzip when explicitly requested.");
    cleanup(1);
  }
}

async function main() {
  await waitForUI();
  await checkDashboardOrLogin();
  await checkDocsOrLogin();
  await checkGzipSupport();
  console.log(`UI smoke passed on http://127.0.0.1:${PORT}`);
  cleanup(0);
}

main().catch((err) => {
  console.error("UI smoke error:", err);
  cleanup(1);
});
