import { Request, Response } from 'express'
import { Connection } from 'sockjs'

export { Request, Response, Connection }
export type MulterFile = Express.Multer.File

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

export interface Middlewares {
  m: Middleware
  parent: Middlewares | null
  skip: boolean
  children: Middlewares[]
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

export type Element<T = {}> = VNode<T> | unknown
export type PropsWithChildren<P> = P & { children: Element }
export type Component<T = {}> = (props: PropsWithChildren<T>) => Element<T>

export interface VNode<P = {}> {
  _vnode: true
  type: Component<P> | string
  props: P & { children: Element<any>[] | Element<any> }
}
