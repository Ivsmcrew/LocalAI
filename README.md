# LocalAI Desktop

Electron desktop app for managing a local AI chat stack (native Ollama + Open WebUI in Docker).

---



### Prerequisites for user

- macOS
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Ollama](https://ollama.com/download) (native macOS app)

---



### Prerquisites for dev

- Prerequisites for user
- Node.js 18+

---



### Development

Dev mode with hot-reload

```bash
cd localai-desktop
npm install
cp .env.example .env
npm run dev
```

---



### Build

```bash
npm run build
npm run preview
```

---



### Usage

1. **First launch** — Checks Docker, Ollama, ports, and disk space. Pulls and starts the WebUI Docker container. Starts Ollama. Downloads the model. Verifies everything works. Stops the stack.
2. **Start** — launches Docker container + Ollama, opens chat window.
3. **Stop** — stops container and Ollama (Docker Desktop keeps running).
4. **Open Chat** — reopens the chat window if stack is running.

---



### Project configuration

1. `tsconfig.node.json` — config for build tooling and `electron.vite.config.ts`.

```json
{
  "compilerOptions": {
    "composite": true, // lets tsconfig.json reference this config
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo", // stores the type-check cache there
    "module": "ESNext", // module format for import/export (ESM)
    "moduleResolution": "bundler", // with module: ESNext, resolves modules and relaxes ESM strictness
    "allowSyntheticDefaultImports": true, // relaxes strictness for default imports
    "strict": true, // strict type checking
    "skipLibCheck": true, // skips type checking inside .d.ts in node_modules
    "noEmit": true // does not compile JS files; only type-checks source files
  },
  "include": ["electron.vite.config.ts"] // applies only to this file
}
```

1. `tsconfig.app.json` — config for all application code in `src/` (main, preload, renderer).

```json
{
  "compilerOptions": {
    "composite": true, // lets tsconfig.json reference this config
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo", // stores the type-check cache there
    "target": "ESNext", // target JS version for compilation
    "module": "ESNext", // module format for import/export (ESM)
    "moduleResolution": "bundler", // with module: ESNext, resolves modules and relaxes ESM strictness
    "strict": true, // strict type checking
    "skipLibCheck": true, // skips type checking inside .d.ts in node_modules
    "esModuleInterop": true, // simplifies importing CommonJS modules via ESM syntax
    "resolveJsonModule": true, // enables typed imports of JSON files
    "isolatedModules": true, // each file can be transpiled in isolation without analyzing the whole project
    "noEmit": true, // does not compile JS files; only type-checks source files
    "jsx": "react-jsx", // for checking TSX files
    "paths": {
      "@shared/*": ["./src/shared/*"] // import aliases for TS (must also be duplicated in electron.vite.config.ts for the bundler)
    }
  },
  "include": ["src/**/*"] // applies to these files
}

```

1. `package.json`

```json
{
  "main": "./out/main/index.js", // Electron entry point
  "type": "module", // all JS files are modules
  "license": "MIT", // license type; indicates a LICENSE file is required
  "scripts": {
    "dev": "electron-vite dev", // hot-reload, no .app packaging
    "build": "electron-vite build", // build to out/
    "preview": "electron-vite preview", // preview the out/ build
    "package": "npm run build && electron-builder --mac --config electron-builder.config.ts" // build + .app
  }
}
```

`electron-builder.config.ts` — packaging config (appId, productName from `.env` via `dotenv`).

---



### Environment variables

Copy `.env.example` to `.env` before development:

```bash
cp .env.example .env
```

- `.env` — values for app/stack defaults (not read at runtime in packaged `.app`). All variables use the `VITE_` prefix so electron-vite exposes them to every process via `import.meta.env`
- `src/shared/env/env.d.ts` — augments `ImportMetaEnv` so `import.meta.env.*` keys are typed
- `src/shared/env/index.ts` — single facade for main and renderer: `import { env, WEBUI_URL, OLLAMA_API_URL, OLLAMA_TAGS_URL } from '@shared/env'` (coerces `number`/`csv` and validates required vars at module load)

Values are baked into the bundle at `npm run dev` / `npm run build` (electron-vite replaces `import.meta.env.*` statically). User-specific settings (e.g. chosen model) live in `~/Library/Application Support/LocalAI/config.json`.

**Adding a new variable:**

1. Add to `.env` and `.env.example` with the `VITE_` prefix
2. Declare it in `src/shared/env/env.d.ts` (typed as `string`)
3. Add the field to `AppEnv` in `src/shared/types.ts` and read it via `req()` / `num()` / `csv()`

---



### Project layout

- `resources/` — static assets bundled with the app (`docker-compose.template.yml`, `icon.svg` source, `icon.png` for macOS packaging)
- `out/` — compiled JS from `npm run build` (electron-vite)
- `release/` — packaged `.app` / `.dmg` from `npm run package` (electron-builder)
- `src/` — application source code

### dev reset
rm -rf ~/Library/Application\ Support/LocalAI