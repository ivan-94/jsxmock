import { VNode, isVNode, Element, Component } from './h'
import { EMPTY_ARRAY, EMPTY_OBJECT } from './utils'

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

const BuildinElements: { [type: string]: NodeType } = {
  server: NodeType.Server,
  use: NodeType.Use,
  websocket: NodeType.WebSocket,
  fragment: NodeType.Fragment,
}

export function isInstance(t: any): t is Instance {
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

function childrenToArray(children?: Element<any> | Element<any>[]) {
  return children
    ? Array.isArray(children)
      ? children
      : [children]
    : EMPTY_ARRAY
}

function renderChilren(children: any, parent: Instance) {
  const ls = childrenToArray(children)
  let prev: Instance | undefined
  for (const item of ls) {
    const rtn = render(item, parent)
    if (prev != null) {
      prev.sibling = rtn
    }
    prev = rtn
  }
}

export function render(vnode: VNode | unknown, parent?: Instance): Instance {
  const inst = createInstance(vnode)

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
    render(rtn, inst)
    return inst
  }

  // host component
  renderChilren(inst.props.children, inst)

  return inst
}
