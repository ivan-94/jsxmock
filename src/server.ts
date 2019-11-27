import http from 'http'
import https from 'https'
import cors from 'cors'
import express, { Request, Response } from 'express'
import isEqual from 'lodash/isEqual'
import sockjs, { Connection } from 'sockjs'
import { ServiceConfig, WebSocketConfig } from './render'

export { Request, Response, Connection }

export type Matcher = (req: Request, res: Response) => boolean

const DEFAULT_PORT = 4321
const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_HTTPS = false

let running = false
let currentConfig: ServiceConfig
let server: http.Server | https.Server
let registerSockHandlers: { [prefix: string]: WebSocketConfig } = {}

export function patchServer(config: ServiceConfig) {
  if (!running) {
    runServer(config)
  } else if (!isEqual(config.server, currentConfig.server) && server) {
    console.info('hard restart server')
    server.close(() => {
      registerSockHandlers = {}
      runServer(config)
    })
  } else {
    // hot patch
    console.info('hot patch')
    currentConfig = config
    attachSockjs(config.ws)
  }
}

function handleSockConnect(path: string, conn: Connection) {
  console.info('websocket connected: ' + path)
  const cf = registerSockHandlers[path]
  if (cf == null) {
    conn.close('1000', 'Not Handler')
    return
  }

  cf.onConnect?.(conn)

  conn.on('data', message => {
    cf.onMessage?.(message, conn)
  })

  conn.on('close', () => {
    cf.onClose?.()
  })
}

function attachSockjs(ws: WebSocketConfig[]) {
  for (const cf of ws) {
    if (cf.path in registerSockHandlers) {
      registerSockHandlers[cf.path] = cf
      continue
    }

    // attach
    registerSockHandlers[cf.path] = cf
    const sockSrv = sockjs.createServer({})
    sockSrv.installHandlers(server, { prefix: cf.path })
    sockSrv.on('connection', handleSockConnect.bind(null, cf.path))
  }
}

export function runServer(config: ServiceConfig) {
  console.info('starting server...')
  running = true
  currentConfig = config
  const {
    port = DEFAULT_PORT,
    host = DEFAULT_HOST,
    https: enableHTTPS = DEFAULT_HTTPS,
    prefix = '/',
  } = currentConfig.server

  // TODO: 端口查找
  const app = express()
  server = enableHTTPS ? https.createServer(app) : http.createServer(app)

  // json 解析
  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const router = express.Router()

  // TODO: 日志
  // TODO: file watch
  router.use((req, res, next) => {
    console.info(`${req.method} ${req.path}`)

    let hit = false
    for (const m of currentConfig.matches) {
      if ((hit = m(req, res))) {
        break
      }
    }

    if (!hit) {
      // TODO: proxy
    }

    if (!hit) {
      console.warn(`${req.method} ${req.path} 请求未命中任何模拟器`)
    }

    next()
  })

  app.use(prefix, router)

  attachSockjs(currentConfig.ws)

  server.listen(port, host, () => {
    console.log(`Mock 服务器已启动: ${host}:${port}`)
  })
}
