import omit from 'lodash/omit'
import { VNode, isVNode, PrimitiveElement, Children, Element } from './h'
import { Request, Response } from './server'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './utils'

export interface Instance {
  _inst: true
  type: string
  props: any
  children?: any[]
}

export interface MatchConfig {
  // 表示是否匹配
  (req: Request, res: Response): boolean
}

export interface HostConfig {
  prefix?: string
  port?: number
  https?: boolean
  host?: string
}

export interface WebSocketConfig {
  path: string
  onMessage?: (data: any, self: any) => void
  onConnect?: (self: any) => void
  onClose?: () => void
  onError?: (err: any) => void
}

export interface ProxyConfig {}

export interface ServiceConfig {
  server: HostConfig
  matches: MatchConfig[]
  ws: WebSocketConfig[]
  proxies: ProxyConfig[]
}

export function isInstance(t: any): t is Instance {
  return t && t._inst
}

export function childrenToArray(children?: Element<any> | Element<any>[]) {
  return children
    ? Array.isArray(children)
      ? children
      : [children]
    : EMPTY_ARRAY
}

export function hasElementChildren(children: any): children is Children {
  return childrenToArray(children).some(i => isVNode(i))
}

export function renderChilren(children?: any) {
  return childrenToArray(children).map(node => {
    if (isVNode(node)) {
      return render(node)
    }
    return node
  })
}

export function render(vnode: VNode): Instance | PrimitiveElement {
  if (typeof vnode.type !== 'string') {
    // custom component
    const rtn = vnode.type(vnode.props)
    if (isVNode(rtn)) {
      return render(rtn)
    }

    return rtn as PrimitiveElement
  }

  // host component
  return {
    _inst: true,
    type: vnode.type,
    props: vnode.props,
    children: renderChilren(vnode.props.children),
  }
}

export function validate(tree?: Instance | unknown): ServiceConfig {
  let server: HostConfig
  let matches: MatchConfig[] = []
  let ws: WebSocketConfig[] = []
  let proxies: ProxyConfig[] = []

  if (!isInstance(tree) || tree.type !== 'mocker') {
    throw new Error('mocker 必须为根组件')
  }

  server = omit(tree.props || EMPTY_OBJECT, 'children')

  if (tree.children) {
    for (const node of tree.children) {
      if (!isInstance(node)) {
        continue
      }

      switch (node.type) {
        case 'match':
          if (node.children == null || typeof node.children[0] !== 'function') {
            throw new Error('match children 不能为空, 且必须为函数')
          }
          matches.push(node.children[0])
          break
        case 'websocket':
          ws.push(node.props)
          break
        case 'proxy':
          proxies.push(node.props)
          break
        default:
          throw new Error(`未知组件类型: ${node.type}`)
      }
    }
  }

  return {
    server,
    matches,
    ws,
    proxies,
  }
}
