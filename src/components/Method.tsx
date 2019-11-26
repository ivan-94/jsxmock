/* @jsx h */
import { h, Comp, Children } from '../h'
import {
  hasElementChildren,
  renderChilren,
  isInstance,
  Instance,
} from '../render'
import { Request, Response, Matcher } from '../server'
import { EMPTY_OBJECT } from '../utils'

export interface MethodProps {
  path?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION' | 'HEAD'
  children?:
    | string
    | number
    | object
    | ((req: Request, res: Response) => void)
    | Children
  headers?: { [key: string]: string }
  code?: number | string
  desc?: string
}

export const Method: Comp<MethodProps> = props => {
  const {
    method = 'GET',
    path = '/',
    code = 200,
    children,
    headers = EMPTY_OBJECT,
  } = props
  let response: Matcher
  const ncode = typeof code === 'string' ? parseInt(code, 10) : code

  if (children && typeof children === 'function') {
    response = children as Matcher
  } else if (hasElementChildren(props.children)) {
    // FIXME: 这里耦合组件渲染细节
    const submatchs = renderChilren(props.children).filter(i =>
      isInstance(i),
    ) as Instance[]

    // submatchs validate
    submatchs.forEach(i => {
      if (i.type !== 'match' || i.children == null || i.children.length === 0) {
        throw new Error(`Method 下级组件必须时合法的 match 组件`)
      }
    })

    response = (req, res) => {
      for (const child of submatchs) {
        const rep = child!.children![0] as Matcher
        if (rep(req, res)) {
          return true
        }
      }
      return false
    }
  } else {
    response = (req, res) => {
      res.status(ncode)
      res.set({
        headers,
      })
      if (children) {
        res.send(children)
      } else {
        res.end()
      }
      return true
    }
  }

  return (
    <match>
      {(req, res) => {
        // 判断方法和路径是否匹配
        // TODO: 路由支持变量
        if (req.method !== method || req.path !== path) {
          return false
        }

        return response(req, res)
      }}
    </match>
  )
}

export default Method
