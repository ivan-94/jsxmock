import { runServer } from './server'
import { VNode } from './h'
import { render, validate } from './render'
import { mock } from './mock'

export * from './h'
export * from './render'
export * from './components'
export { mock }

/**
 * 启动服务器
 * @param config
 */
export function start(root: () => VNode<any>) {
  const tree = render(root())
  const config = validate(tree)
  runServer(config)
}
