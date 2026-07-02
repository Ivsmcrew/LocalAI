# LocalAI Desktop

Electron desktop app for managing a local AI chat stack (native Ollama + Open WebUI in Docker).

## Prerequisites

- macOS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/download) (native macOS app)
- Node.js 18+

## Development

```bash
cd localai-desktop
npm install
npm run dev
```

## CLI (without Electron UI)

```bash
npm run cli:init llama3.2
npm run cli:start
npm run cli:status
npm run cli:stop
```

## Build

```bash
npm run build
npm run preview
```

## Usage

1. **First launch** — Init wizard downloads Open WebUI and an Ollama model.
2. **Start** — launches Docker container + Ollama, opens chat window.
3. **Stop** — stops container and Ollama (Docker Desktop keeps running).
4. **Open Chat** — reopens the chat window if stack is running.

Config is stored in `~/Library/Application Support/LocalAI/`.
