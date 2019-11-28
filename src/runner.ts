import omit from 'lodash/omit'
import { Request, Response, Connection } from './server'
import { Instance, isInstance, NodeType } from './render'

export type Middleware = (
  req: Request,
  res: Response,
  match: (matched?: boolean) => Promise<boolean>,
) => Promise<any>

export interface Middlewares {
  m: Middleware
  parent: Middlewares | null
  skip: boolean
  children: Middlewares[] | null
}

export interface HostConfig {
  prefix?: string
  port?: number
  https?: boolean
  host?: string
}

export interface WebSocketConfig {
  path: string
  onMessage?: (data: any, conn: Connection) => void
  onConnect?: (conn: Connection) => void
  onClose?: () => void
}

export interface ServiceConfig {
  server: HostConfig
  middlewares: Middlewares
  ws: Map<string, WebSocketConfig>
}

export const NoopMiddleware: Middleware = async (req, res, next) => next(true)

function createMiddlewares(cb: Middleware, parent?: Middlewares) {
  return {
    m: cb,
    parent: parent || null,
    skip: false,
    children: null,
  }
}

/**
 * 转换实例树为服务器配置
 */
export function transformTree(tree: Instance | unknown): ServiceConfig {
  const server: HostConfig = {}
  const middlewares: Middlewares = createMiddlewares(NoopMiddleware)
  const ws: Map<string, WebSocketConfig> = new Map()

  if (!isInstance(tree) || tree.tag !== NodeType.Server) {
    throw new Error('root component must be <server>')
  }

  Object.assign(server, omit(tree.props, 'children'))

  // DSF 遍历
  let current: Instance | null = null
  let currentMiddlewares = middlewares
  let md: Middlewares | null = null

  current = tree.child
  while (current) {
    md = null

    switch (current.tag) {
      case NodeType.Use:
        md = createMiddlewares(current.props.m, currentMiddlewares)
        md.skip = !!current.props.skip
        if (currentMiddlewares.children) {
          currentMiddlewares.children.push(md)
        } else {
          currentMiddlewares.children = [md]
        }
        break
      case NodeType.WebSocket:
        const config = { ...current.props }
        const path = (config.path = config.path || '/')
        if (ws.has(path)) {
          console.warn(`websocket path conflicted: ${path}`)
        }
        ws.set(path, config)
        break
    }

    if (current.child) {
      current = current.child
      if (md) {
        currentMiddlewares = md
      }
    } else if (current.sibling) {
      current = current.sibling
    } else {
      if (current?.return && current.return.tag === NodeType.Use) {
        currentMiddlewares = currentMiddlewares.parent!
      }
      current = current.return?.sibling || null
    }
  }

  return {
    server,
    middlewares,
    ws,
  }
}

/**
 * 中间件运行
 */
export async function runMiddlewares(
  req: Request,
  res: Response,
  current: Middlewares,
): Promise<boolean> {
  if (current == null || current.m == null) {
    console.warn('use m props cannot be null')
    return false
  }

  if (current.skip) {
    return false
  }

  return new Promise((resolve, reject) => {
    current
      .m(req, res, async matched => {
        if (matched) {
          if (current.children && current.children.length) {
            // 递归匹配子节点
            try {
              for (const child of current.children) {
                const matched = await runMiddlewares(req, res, child)
                if (matched) {
                  resolve(true)
                  return true
                }
              }

              // 所有子节点都没有匹配
              resolve(false)
              return false
            } catch (err) {
              reject(err)
              throw err
            }
          }
          // 没有子节点, 直接匹配
          resolve(true)
          return true
        }

        resolve(false)
        return false
      })
      .catch(reject)
  })
}
