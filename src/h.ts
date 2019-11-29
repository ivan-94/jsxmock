import { EMPTY_OBJECT } from './utils'
import { VNode, Component, JSXInternal, ComponentChild } from './type'

export function isVNode(type: any): type is VNode<any> {
  return type && type._vnode
}

/**
 * 判断children 中是否包含组件
 * @param children
 */
export function hasVNode(children: any) {
  return !!children && Array.isArray(children)
    ? children.some(isVNode)
    : isVNode(children)
}

/**
 * JSX 工厂方法
 */
export function h<T>(
  type: string | Component<T>,
  props: T | null,
  ...children: ComponentChild[]
): VNode<T> {
  const copy: any = { ...(props || EMPTY_OBJECT) }
  copy.children =
    copy.children || (children.length > 1 ? children : children[0])

  return {
    _vnode: true,
    type,
    props: copy,
  }
}

export declare namespace h {
  export import JSX = JSXInternal
}
