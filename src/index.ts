import { runServer } from './server'
import { VNode } from './h'
import { render, validate } from './render'

export * from './h'
export * from './render'
export * from './components'

/**
 * 启动服务器
 * @param config
 */
export function start(root: () => VNode<any>) {
  const tree = render(root())
  const config = validate(tree)
  runServer(config)
}
