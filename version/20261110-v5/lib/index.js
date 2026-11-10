/**
 * dsh-composer-butler — Host 半身。
 *
 * 为什么是纯 JS、无构建：本机没有可用的 DSH 源码 checkout，也没有 tsc
 * （dev_build_plugin 报「无 DSH checkout，且运行环境解析不到 DSH 依赖/tsc」）。
 * 生态里 dsh-our-free-model 已用「手写 ModuleLoader bundle、零构建」的方式
 * 在同一个桌面端跑通，因此这里沿用同一条路线，只依赖 shell 提供的运行时。
 *
 * 职责：
 *  1. /api/scan 接收 client 侦察结果 → 落盘 scan.json（开发期核对真实 DOM）；
 *  2. /api/state 读写开关状态 → state.json（重启不丢，满足「设置实时持久化」）；
 *  3. /api/rules 读写特征表 → rules.json（DSH 升级后可改配置适配，不必重编译）；
 *  4. composer_butler_status 工具，便于在会话里直接问当前状态。
 *
 * @module index.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 插件包根目录（本文件在 lib/ 下，上一级即包根）。 */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** 浏览器半身读取的 API 前缀。 */
const API_PREFIX = '/@lanbaolu/dsh-composer-butler/api'

export const name = '@lanbaolu/dsh-composer-butler'
export const inject = ['webServer', 'tools']

/**
 * 数据目录：默认插件包根。刻意不写死绝对路径，换机器不会失效。
 * 可用 config.dataDir 覆盖。
 */
function resolveDataDir(config) {
  const configured = typeof config?.dataDir === 'string' ? config.dataDir.trim() : ''
  return configured === '' ? ROOT : path.resolve(configured)
}

/** 把请求体读完并解析为 JSON；空体返回 {}。 */
async function readJsonBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  const raw = Buffer.concat(chunks).toString('utf8')
  if (raw.trim() === '') return {}
  return JSON.parse(raw)
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

async function readJsonFile(file) {
  try {
    return JSON.parse(await fs.promises.readFile(file, 'utf8'))
  } catch {
    return null
  }
}

/**
 * 每个文件的写入串行化队列。
 *
 * ⚠️ 实测缺陷（2026-11-11）：client 端 hidden 与 anchors 变更多次触发 POST /state，
 * 两个请求几乎同时到达时，`fs.writeFile` 的两次写入会交错，state.json 里出现
 * 重复尾段（`"updatedAt": ...}` 之后又一段 `"updatedAt": ...}`），JSON 直接解析失败，
 * composer_butler_status 的 state 变成 null、下次启动也读不回配置。
 * 修法：同一路径的写入串成 Promise 链，并且先写临时文件再 rename 原子替换。
 */
const writeChains = new Map()

/**
 * 原子写 JSON：串行化 + 临时文件 + rename。
 * rename 在 Windows 上走 MoveFileEx(MOVEFILE_REPLACE_EXISTING)，可以覆盖已存在文件。
 */
async function writeJsonFile(file, payload) {
  const previous = writeChains.get(file) ?? Promise.resolve()
  const next = previous.then(async () => {
    await fs.promises.mkdir(path.dirname(file), { recursive: true })
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
    await fs.promises.writeFile(tmp, JSON.stringify(payload, null, 2), 'utf8')
    await fs.promises.rename(tmp, file)
  })
  // 链条不能因为一次失败就永久 reject（否则后续写入全被带崩）。
  writeChains.set(file, next.catch(() => {}))
  return next
}

/**
 * 提供浏览器半身使用的 API + 会话内状态查询工具。
 *
 * inject 声明 webServer 与 tools：前者是 client 读写状态的通道（核心能力，
 * 缺了整个插件没有意义），后者是会话内直接查询的入口。
 */
export function apply(ctx, config) {
  const dataDir = resolveDataDir(config)
  const scanFile = path.join(dataDir, 'scan.json')
  const stateFile = path.join(dataDir, 'state.json')
  const rulesFile = path.join(dataDir, 'rules.json')

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: API_PREFIX,
    handler: async (req, res) => {
      const url = String(req.url ?? '')
      const sub = url.startsWith(API_PREFIX) ? url.slice(API_PREFIX.length) : url
      const route = sub.split('?')[0].replace(/\/+$/, '') || '/'
      const isPost = req.method === 'POST'

      try {
        if (route === '/scan' && isPost) {
          await writeJsonFile(scanFile, await readJsonBody(req))
          return sendJson(res, 200, { ok: true, file: scanFile })
        }

        if (route === '/scan') {
          const data = await readJsonFile(scanFile)
          if (data === null) return sendJson(res, 404, { ok: false, error: 'scan.json 尚不存在' })
          return sendJson(res, 200, data)
        }

        if (route === '/state' && isPost) {
          await writeJsonFile(stateFile, await readJsonBody(req))
          return sendJson(res, 200, { ok: true })
        }

        if (route === '/state') {
          const data = await readJsonFile(stateFile)
          return sendJson(res, 200, data ?? { hidden: [], anchors: [] })
        }

        if (route === '/rules' && isPost) {
          await writeJsonFile(rulesFile, await readJsonBody(req))
          return sendJson(res, 200, { ok: true })
        }

        if (route === '/rules') {
          const data = await readJsonFile(rulesFile)
          if (data === null) return sendJson(res, 404, { ok: false, error: 'rules.json 尚不存在' })
          return sendJson(res, 200, data)
        }

        if (route === '/info') {
          return sendJson(res, 200, { dataDir, apiBase: API_PREFIX })
        }

        return sendJson(res, 404, { ok: false, error: `未知路由 ${route}` })
      } catch (error) {
        return sendJson(res, 500, { ok: false, error: String(error) })
      }
    },
  }), 'composer-butler: api')

  // 会话内可直接查询状态（inject 已声明 tools，服务必然可用）。
  ctx.effect(() => ctx.tools.register({
    name: 'composer_butler_status',
    description: '查看输入框按钮管家的扫描结果与当前隐藏清单（读 scan.json / state.json）。',
    parameters: {},
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: String(value) }],
    },
    async execute() {
      return JSON.stringify({
        dataDir,
        scan: await readJsonFile(scanFile),
        state: await readJsonFile(stateFile),
      }, null, 2)
    },
  }), 'composer-butler: status tool')
}
