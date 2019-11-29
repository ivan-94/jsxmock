import { runServer, patchServer } from './server'
import { render } from './render'
import { normalizedMatcherReturn } from './runner'
import { mock, rawMock } from './mock'
import { VNode } from './type'

export * from './type'
export * from './h'
export * from './components'
export { mock, rawMock, normalizedMatcherReturn }

/**
 * 启动服务器
 */
export function start(root: () => VNode<any>) {
  const config = render(root())
  runServer(config)
}

export function restart(root: () => VNode<any>) {
  const config = render(root())
  patchServer(config)
}
