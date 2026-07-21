import { env, WEBUI_URL } from '@shared/env'
import type { DockerService } from './docker'

export class WebUIService {
  private log: (line: string) => void

  constructor(onLog: (line: string) => void) {
    this.log = onLog
  }

  async isReady(): Promise<boolean> {
    try {
      const res = await fetch(WEBUI_URL, { signal: AbortSignal.timeout(env.REQUEST_TIMEOUT_MS) })
      return res.ok || res.status === 200
    } catch {
      return false
    }
  }

  async waitForReady(timeoutMs = 120_000): Promise<void> {
    this.log('Waiting for Open WebUI...')
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      if (await this.isReady()) {
        this.log('Open WebUI is ready')
        return
      }
      await sleep(1000)
    }
    throw new Error('Open WebUI did not become ready within the timeout period')
  }

  /**
   * Open WebUI persists admin settings in SQLite and overrides compose env.
   * Keep web search on legacy function-calling so the globe runs SearXNG RAG
   * (native tools break on many local Ollama models).
   */
  async ensureWebSearchConfig(docker: DockerService): Promise<void> {
    if (!(await docker.isContainerRunning(env.CONTAINER_NAME))) return

    this.log('Ensuring Open WebUI web search defaults...')
    const script = `
import json, sqlite3, time
con = sqlite3.connect("/app/backend/data/webui.db")
cur = con.cursor()
now = int(time.time())
updates = {
  "web.search.enable": True,
  "web.search.engine": "searxng",
  "web.search.searxng_query_url": "http://${env.SEARXNG_CONTAINER_NAME}:8080/search?q=<query>",
  "web.search.result_count": 3,
  "web.search.concurrent_requests": 10,
  "models.default_params": {"function_calling": "legacy"},
  "models.default_metadata": {
    "capabilities": {
      "builtin_tools": False,
      "web_search": True,
      "code_interpreter": False,
      "image_generation": False,
    }
  },
}
for key, value in updates.items():
  cur.execute(
    "INSERT INTO config(key, value, updated_at) VALUES(?,?,?) "
    "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
    (key, json.dumps(value), now),
  )
# Prefer legacy FC on existing model rows so the globe uses forced RAG search.
cur.execute("SELECT id, params FROM model")
for model_id, params_raw in cur.fetchall():
  try:
    params = json.loads(params_raw) if params_raw else {}
  except Exception:
    params = {}
  if not isinstance(params, dict):
    params = {}
  if params.get("function_calling") in (None, "", "default", "native"):
    params["function_calling"] = "legacy"
    cur.execute(
      "UPDATE model SET params=?, updated_at=? WHERE id=?",
      (json.dumps(params), now, model_id),
    )
con.commit()
con.close()
print("ok")
`.trim()

    try {
      const out = await docker.exec(env.CONTAINER_NAME, ['python3', '-c', script])
      if (!out.includes('ok')) {
        this.log(`Warning: web search config patch returned: ${out.trim() || '(empty)'}`)
      }
    } catch (err) {
      this.log(`Warning: could not patch web search config: ${err}`)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
