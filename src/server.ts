import http from 'http'
import https from 'https'
import express, { Request, Response } from 'express'
import isEqual from 'lodash/isEqual'
import { ServiceConfig } from './render'

export { Request, Response }

export type Matcher = (req: Request, res: Response) => boolean

const DEFAULT_PORT = 4321
const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_HTTPS = false

let running = false
let currentConfig: ServiceConfig
let server: http.Server | https.Server

export function patchServer(config: ServiceConfig) {
  if (!running) {
    runServer(config)
  } else if (!isEqual(config.server, currentConfig.server) && server) {
    console.info('hard restart server')
    server.close(() => {
      runServer(config)
    })
  } else {
    // hot patch
    console.info('hot patch')
    currentConfig = config
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
  const app = express()

  // json 解析
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
      // TODO: websocket
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

  // TODO: 端口查找
  server = enableHTTPS ? https.createServer(app) : http.createServer(app)

  server.listen(port, host, () => {
    console.log(`Mock 服务器已启动: ${host}:${port}`)
  })
}
