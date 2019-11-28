import omit from 'lodash/omit'
import { Request, Response, Connection } from './server'
import { Instance, isInstance, NodeType } from './render'
import { isPromise } from './utils'

/**
 * @param req express 请求对象
 * @param res express 响应对象
 * @param recurse 递归执行下级中间件, 返回一个boolean，表示下级是否中间件匹配。如果下级组件执行错误，这里也会抛出异常，可以使用try/catch 包裹
 * @returns 返回一个 boolean 表示是否匹配，如果匹配，后续的中间件将不会被执行
 */
export type Middleware = (
  req: Request,
  res: Response,
  // 递归
  recurse: () => Promise<boolean>,
) => Promise<boolean>

export interface Middlewares {
  m: Middleware
  parent: Middlewares | null
  skip: boolean
  children: Middlewares[] | null
}

/**
 * 返回 false 表示跳过 不匹配
 */
export type MiddlewareMatcherReturn = Promise<false | void> | false | void
export type MiddlewareMatcher = (
  req: Request,
  res: Response,
) => MiddlewareMatcherReturn

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

export const NoopMiddleware: Middleware = (req, res, next) => next()

/**
 * 规范化 Matcher 返回值为规范的 middleware 返回值
 */
export async function normalizedMatcherReturn(rtn: any) {
  return isPromise(rtn) ? rtn.then(i => i !== false) : rtn !== false
}

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
          console.warn(`websocket path conflict: ${path}`)
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

  return current.m(req, res, async () => {
    if (current.children && current.children.length) {
      // 递归匹配子节点
      for (const child of current.children) {
        const matched = await runMiddlewares(req, res, child)
        if (matched) {
          return true
        }
      }

      // 所有子节点都没有匹配
      return false
    }

    return false
  })
}
