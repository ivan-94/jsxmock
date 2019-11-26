declare module '@gdjiami/mocker' {
  export type Comp<T> = (props: T) => {}
  export interface VNode<P = {}> {
    type: Comp<P>
    props: P
  }

  export type Child =
    | VNode<any>
    | object
    | string
    | number
    | boolean
    | null
    | undefined
  export type Children = Child[]
  export type Request = any
  export type Response = any

  export interface Common {
    children?:
      | string
      | number
      | object
      | boolean
      | ((req: Request, res: Response) => void)
    code?: number
    desc?: string
  }

  export interface Method extends Common {
    path: string
  }

  export interface MatchBy extends Common {
    key: string
    value: any | ((value: any) => boolean)
  }

  // 请求方法
  const Get: Comp<Method>
  const Post: Comp<Method>
  const Put: Comp<Method>
  const Delete: Comp<Method>
  const Option: Comp<Method>
  const Upload: Comp<{
    key?: string
    multiple?: string
    // TODO: 完善
  }>

  // 匹配方法
  // 必须在 Method 下面
  const MatchByHeader: Comp<MatchBy>
  const MatchByForm: Comp<MatchBy>
  const MatchBySearch: Comp<MatchBy>
  const MatchByJSON: Comp<MatchBy>
  const JSONRPC: Comp<{
    method: string
    desc?: string
    children: string | number | object | ((req: any) => any)
  }>

  function h<P>(type: Comp<P>, props: P | null, ...children: Child[]): VNode<P>

  namespace h {
    export namespace JSX {
      interface ElementAttributesProperty {
        props: any
      }

      interface ElementChildrenAttribute {
        children: any
      }

      interface IntrinsicElements {
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

  export {
    h,
    Get,
    Post,
    Put,
    Delete,
    MatchByHeader,
    MatchByForm,
    MatchBySearch,
    MatchByJSON,
    JSONRPC,
  }
}
