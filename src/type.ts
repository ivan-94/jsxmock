import { Request, Response } from 'express'
import { Connection } from 'sockjs'

export { Request, Response, Connection }
export type MulterFile = Express.Multer.File
export type StringRecord = { [key: string]: string }

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

export interface VNode<P = {}> {
  _vnode: true
  type: Component<P> | string
  props: P & { children: ComponentChildren }
}

export type ComponentChild =
  | VNode<any>
  | object
  | string
  | number
  | boolean
  | null
  | undefined
export type ComponentChildren = ComponentChild[] | ComponentChild
export type RenderableProps<P> = Readonly<P & { children?: ComponentChildren }>
export type Component<P = any> = (props: RenderableProps<P>) => VNode<P> | null

export declare namespace JSXInternal {
  interface Element extends VNode<any> {}

  interface ElementAttributesProperty {
    props: any
  }

  interface ElementChildrenAttribute {
    children: any
  }

  interface IntrinsicElements {
    // 核心元素
    server: {
      prefix?: string
      port?: string | number
      host?: string
      https?: boolean
      children: any
    }
    // 类似于koa 的中间件
    use: {
      m: Middleware
      skip?: boolean
      children?: any
    }
    fragment: {}
    websocket: {
      path: string
      onMessage?: (data: any, conn: Connection) => void
      onConnect?: (conn: Connection) => void
      onClose?: () => void
    }
  }
}
