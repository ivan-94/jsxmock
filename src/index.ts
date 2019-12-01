// TODO: 优化日志
// TODO: 集成 Github Action
// TODO: 模块化
// TODO: 单元测试
// TODO: 显示主机IP
// TODO: 接口冲突检测
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

/**
 * 更新服务器
 */
export function restart(root: () => VNode<any>) {
  const config = render(root())
  patchServer(config)
}
