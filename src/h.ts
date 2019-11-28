import { Connection } from './server'
import { EMPTY_OBJECT } from './utils'
import { Middleware } from './runner'

export type Primitive = null | undefined | string | boolean | number
export type Element<T = {}> = VNode<T> | Primitive
export type Children = Element<any>[]
export type Component<T = {}> = (props: T) => Element<T>

export interface VNode<P = {}> {
  _vnode: true
  type: Component<P> | string
  props: P & { children: Element<any>[] | Element<any> }
}

export function isVNode(type: any): type is VNode<any> {
  return type && type._vnode
}

/**
 * JSX 工厂方法
 */
export function createElement<T>(
  type: string | Component<T>,
  props: T | null,
  ...children: Element<any>[]
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

export const h = createElement

export declare namespace h {
  export namespace JSX {
    export interface ElementAttributesProperty {
      props: any
    }

    export interface ElementChildrenAttribute {
      children: any
    }

    export interface IntrinsicElements {
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
}
