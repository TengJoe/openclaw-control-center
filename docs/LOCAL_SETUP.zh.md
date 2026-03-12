# 本地安装指南

这份指南是给“第一次安装这个 fork”的用户看的。按下面做，不需要理解内部实现。

## 1. 你需要先有这些东西

- 已经安装并能运行 `OpenClaw`
- 机器上有 `node` 和 `npm`
- 本机能访问 OpenClaw Gateway
- 能读到：
  - `~/.openclaw`
  - `~/.codex`（没有也能跑，只是部分面板会降级）

## 2. clone 这个 fork

```bash
git clone https://github.com/TengJoe/openclaw-control-center.git
cd openclaw-control-center
```

## 3. 安装依赖

```bash
npm install
```

## 4. 创建配置文件

```bash
cp .env.example .env
```

## 5. 先只改这些值

先生成一个本地 token：

```bash
openssl rand -hex 24
```

然后把 `.env` 改成类似这样：

```env
GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_HOME=/Users/你的用户名/.openclaw
CODEX_HOME=/Users/你的用户名/.codex
READONLY_MODE=true
APPROVAL_ACTIONS_ENABLED=false
APPROVAL_ACTIONS_DRY_RUN=true
IMPORT_MUTATION_ENABLED=false
IMPORT_MUTATION_DRY_RUN=false
LOCAL_TOKEN_AUTH_REQUIRED=true
LOCAL_API_TOKEN=把刚才生成的随机字符串填到这里
MONITOR_CONTINUOUS=false
UI_MODE=true
UI_PORT=4310
```

如果你的 OpenClaw workspace 不止一个，还可以加：

```env
EDITABLE_WORKSPACE_ROOTS=/Users/你的用户名/.openclaw/workspace,/Users/你的用户名/.openclaw/workspace-writer,/Users/你的用户名/.openclaw/workspace-coder
```

## 6. 验证项目能运行

```bash
npm run build
npm test
```

如果这里只是想先跑起来，不想改任何高风险行为，就不要把只读相关开关改掉。

## 7. 启动 UI

```bash
node --import tsx src/index.ts
```

## 8. 打开页面

先打开：

- `http://127.0.0.1:4310/login`

然后：

1. 输入 `.env` 里的 `LOCAL_API_TOKEN`
2. 登录后先看：
   - `Overview / 总览`
   - `Usage / 用量`
   - `Staff / 员工`

## 9. 正常现象

这些情况不一定表示坏了：

- `Usage / Subscription` 部分信息不完整
  原因：这台机器可能没有完整订阅快照或 Codex 数据
- `monitor missing`
  原因：这个 fork 在只读 UI 模式下会尽量减少启动时的落盘产物
- 某些 agent 分组没有文件
  原因：当前 `openclaw.json` 和 workspace 实际结构决定了它能看到哪些内容

## 10. 常用排查

看健康检查：

```bash
curl http://127.0.0.1:4310/healthz
```

如果页面打不开，先看：

```bash
lsof -nP -iTCP:4310 -sTCP:LISTEN
```

如果登录后还是看不到想要的数据，先确认：

```bash
ls ~/.openclaw
cat ~/.openclaw/openclaw.json
```
