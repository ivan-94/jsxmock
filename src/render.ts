import omit from 'lodash/omit'
import { isVNode } from './h'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './utils'
import {
  Middleware,
  Middlewares,
  WebSocketConfig,
  HostConfig,
  VNode,
  Element,
  Component,
} from './type'

/**
 * 节点类型
 */
export enum NodeType {
  Server,
  Use,
  WebSocket,
  Fragment,
  Primitive, // 类似于DOM 的 TextNode、这些节点会被忽略
  Custom,
}

/**
 * 节点实例
 */
export interface Instance {
  _inst: true
  // 节点分类
  tag: NodeType
  // 节点类型
  type: string | Component<any> | unknown
  props: any
  // 父节点
  return: Instance | null
  // 第一个子节点
  child: Instance | null
  // 兄弟节点
  sibling: Instance | null
}

export const NoopMiddleware: Middleware = (req, res, next) => next()

const BuildinElements: { [type: string]: NodeType } = {
  server: NodeType.Server,
  use: NodeType.Use,
  websocket: NodeType.WebSocket,
  fragment: NodeType.Fragment,
}

function isInstance(t: any): t is Instance {
  return t && t._inst
}

function createInstance<T = {}>(vnode: VNode<T> | unknown): Instance {
  if (!isVNode(vnode)) {
    return {
      _inst: true,
      tag: NodeType.Primitive,
      type: vnode,
      props: EMPTY_OBJECT,
      return: null,
      child: null,
      sibling: null,
    }
  }

  let tag: NodeType
  if (typeof vnode.type === 'string') {
    if (vnode.type in BuildinElements) {
      tag = BuildinElements[vnode.type]
    } else {
      throw new Error(`Unknown element type: ${vnode.type}`)
    }
  } else if (typeof vnode.type === 'function') {
    tag = NodeType.Custom
  } else {
    throw new Error(`Unknown element type: ${vnode.type}`)
  }

  return {
    _inst: true,
    tag,
    type: vnode.type,
    props: vnode.props || EMPTY_OBJECT,
    return: null,
    child: null,
    sibling: null,
  }
}

function createMiddlewares(cb: Middleware, parent?: Middlewares) {
  return {
    m: cb,
    parent: parent || null,
    skip: false,
    children: [],
  }
}

function childrenToArray(children?: Element<any> | Element<any>[]) {
  return children
    ? Array.isArray(children)
      ? children
      : [children]
    : EMPTY_ARRAY
}

function mountChilren(children: any, parent: Instance) {
  const ls = childrenToArray(children)
  let prev: Instance | undefined
  for (const item of ls) {
    const rtn = mount(item, parent)
    if (prev != null) {
      prev.sibling = rtn
    }
    prev = rtn
  }
}

let currentMiddlewares: Middlewares
let currentWs: Map<string, WebSocketConfig>
let md: Middlewares
function mount(vnode: VNode | unknown, parent: Instance | null): Instance {
  const inst = createInstance(vnode)
  let prevMiddlewares: Middlewares

  if (parent) {
    inst.return = parent
    if (parent.child === null) {
      parent.child = inst
    }
  }

  if (inst.tag === NodeType.Primitive) {
    return inst
  } else if (inst.tag === NodeType.Custom) {
    // custom component
    const rtn = (inst.type as Component)(inst.props)
    mount(rtn, inst)
    return inst
  }

  if (inst.tag === NodeType.Use) {
    // 收集中间件
    prevMiddlewares = currentMiddlewares
    md = createMiddlewares(inst.props.m, currentMiddlewares)
    md.skip = !!inst.props.skip
    currentMiddlewares.children.push(md)
    currentMiddlewares = md
  } else if (inst.tag === NodeType.WebSocket) {
    // 收集websocket
    const config = { ...inst.props }
    const path = (config.path = config.path || '/')
    if (currentWs.has(path)) {
      console.warn(`websocket path conflict: ${path}`)
    }
    currentWs.set(path, config)
  }

  // host component
  mountChilren(inst.props.children, inst)

  if (inst.tag === NodeType.Use) {
    currentMiddlewares = prevMiddlewares!
  }

  return inst
}

export function render(vnode: VNode | unknown) {
  const server: HostConfig = {}
  const middlewares: Middlewares = (currentMiddlewares = createMiddlewares(
    NoopMiddleware,
  ))
  const ws: Map<string, WebSocketConfig> = (currentWs = new Map())

  const tree = mount(vnode, null)

  // validate
  if (!isInstance(tree) || tree.tag !== NodeType.Server) {
    throw new Error('root node must be <server>')
  }

  Object.assign(server, omit(tree.props, 'children'))

  return {
    server,
    middlewares,
    ws,
  }
}
