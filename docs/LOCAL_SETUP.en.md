# Local Setup Guide

This guide is for someone installing this fork for the first time. Follow it step by step.

## 1. Prerequisites

- `OpenClaw` is already installed and usable
- `node` and `npm` are available on this machine
- the machine can reach the OpenClaw Gateway
- the machine can read:
  - `~/.openclaw`
  - `~/.codex` (optional, but some panels degrade without it)

## 2. Clone this fork

```bash
git clone https://github.com/TengJoe/openclaw-control-center.git
cd openclaw-control-center
```

## 3. Install dependencies

```bash
npm install
```

## 4. Create the config file

```bash
cp .env.example .env
```

## 5. Change only these values first

Generate a local token:

```bash
openssl rand -hex 24
```

Then make your `.env` look roughly like this:

```env
GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_HOME=/Users/your-name/.openclaw
CODEX_HOME=/Users/your-name/.codex
READONLY_MODE=true
APPROVAL_ACTIONS_ENABLED=false
APPROVAL_ACTIONS_DRY_RUN=true
IMPORT_MUTATION_ENABLED=false
IMPORT_MUTATION_DRY_RUN=false
LOCAL_TOKEN_AUTH_REQUIRED=true
LOCAL_API_TOKEN=paste the generated random token here
MONITOR_CONTINUOUS=false
UI_MODE=true
UI_PORT=4310
```

If your OpenClaw setup uses multiple workspaces, you can also add:

```env
EDITABLE_WORKSPACE_ROOTS=/Users/your-name/.openclaw/workspace,/Users/your-name/.openclaw/workspace-writer,/Users/your-name/.openclaw/workspace-coder
```

## 6. Verify the project

```bash
npm run build
npm test
```

If you only want a safe first run, do not relax any readonly or mutation flags yet.

## 7. Start the UI

```bash
node --import tsx src/index.ts
```

## 8. Open the pages

Open this first:

- `http://127.0.0.1:4310/login`

Then:

1. enter the `LOCAL_API_TOKEN` from `.env`
2. after login, start with:
   - `Overview`
   - `Usage`
   - `Staff`

## 9. What is normal

These do not always mean something is broken:

- incomplete `Usage / Subscription` data
  because the machine may not have complete subscription snapshots or Codex data
- `monitor missing`
  because this hardened fork reduces startup artifact writes in readonly UI mode
- some agent groups showing fewer files than expected
  because visibility depends on `openclaw.json` and the actual workspace layout

## 10. Quick troubleshooting

Check health:

```bash
curl http://127.0.0.1:4310/healthz
```

If the page does not open, check the port:

```bash
lsof -nP -iTCP:4310 -sTCP:LISTEN
```

If data is missing after login, check:

```bash
ls ~/.openclaw
cat ~/.openclaw/openclaw.json
```
