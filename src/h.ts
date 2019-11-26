import { Request, Response } from './server'

export type PrimitiveElement = null | undefined | string | boolean | number
export type Element<T> = VNode<T> | PrimitiveElement
export type Children = Element<any>[]
export type Comp<T> = (props: T) => Element<T>

export interface VNode<P = {}> {
  _vnode: true
  type: Comp<P> | string
  props: P & { children: Element<any>[] | Element<any> }
}

export function isVNode(type: any): type is VNode<any> {
  return type && type._vnode
}

export function h<T>(
  type: string | VNode<T>,
  props: T | null,
  ...children: Element<any>[]
) {
  const copy: any = props ? { ...props } : {}
  copy.children = children.length > 1 ? children : children[0]

  return {
    _vnode: true,
    type,
    props: copy,
  }
}

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
      mocker: {
        port?: string | number
        host?: string
        https?: boolean
        children: any
      }
      match: { children: (req: Request, res: Response) => void }
      proxy: { to: string }
      websocket: {
        path: string
        onMessage?: (data: any, self: any) => void
        onConnect?: (self: any) => void
        onClose?: () => void
        onError?: (err: any) => void
      }
    }
  }
}
