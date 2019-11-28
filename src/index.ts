import {
  runServer,
  patchServer,
  Request,
  Response,
  Connection,
  MulterFile,
} from './server'
import { VNode } from './h'
import { render } from './render'
import {
  transformTree,
  Middleware,
  MiddlewareMatcher,
  MiddlewareMatcherReturn,
  normalizedMatcherReturn,
} from './runner'
import { mock } from './mock'

export * from './h'
export * from './render'
export * from './components'
export {
  mock,
  Request,
  Response,
  Connection,
  Middleware,
  MiddlewareMatcher,
  MiddlewareMatcherReturn,
  MulterFile,
  normalizedMatcherReturn,
}

/**
 * 启动服务器
 */
export function start(root: () => VNode<any>) {
  const tree = render(root())
  const config = transformTree(tree)
  runServer(config)
}

export function restart(root: () => VNode<any>) {
  const tree = render(root())
  const config = transformTree(tree)
  patchServer(config)
}
