/* @jsx h */
import { match } from 'path-to-regexp'
import { h, Component, Children } from '../h'
import {
  hasElementChildren,
  renderChilren,
  isInstance,
  Instance,
} from '../render'
import { Request, Response, Matcher } from '../server'
import {
  EMPTY_OBJECT,
  statusCode,
  transformData,
  normalizedMatchReturn,
  FUNC_RTN_FALSE,
} from '../utils'
import { isMock, MockType } from '../mock'

export type METHODS = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION' | 'HEAD'

export interface MethodProps {
  path?: string
  method?: METHODS
  skip?: boolean
  children?:
    | string
    | number
    | object
    | ((req: Request, res: Response) => void | boolean)
    | MockType
    | Children
  headers?: { [key: string]: string }
  code?: number | string
  desc?: string
}

export type FixedMethodProps = Omit<MethodProps, 'method'>

export const Method: Component<MethodProps> = props => {
  const {
    method = 'GET',
    path = '/',
    code = 200,
    children,
    headers = EMPTY_OBJECT,
    skip,
  } = props
  let response: Matcher
  let pathMatcher = match(path, { decode: decodeURIComponent })

  if (children && typeof children === 'function' && !isMock(children)) {
    response = (req, res) => {
      return normalizedMatchReturn(children(req, res))
    }
  } else if (hasElementChildren(props.children)) {
    // FIXME: 这里耦合组件渲染细节
    const submatchs = renderChilren(props.children).filter(
      i => isInstance(i) && !i.props.skip,
    ) as Instance[]

    // submatchs validate
    submatchs.forEach(i => {
      if (i.type !== 'match' || i.children == null || i.children.length === 0) {
        throw new Error(`Method 下级组件必须时合法的 match 组件`)
      }
    })

    response = submatchs.length
      ? (req, res) => {
          for (const child of submatchs) {
            const rep = child!.children![0] as Matcher
            if (normalizedMatchReturn(rep(req, res))) {
              return true
            }
          }
          return false
        }
      : FUNC_RTN_FALSE
  } else {
    response = (req, res) => {
      res.status(statusCode(code))
      res.set(headers)
      // TODO: content type
      if (children) {
        res.send(transformData(children))
      } else {
        res.end()
      }
      return true
    }
  }

  return (
    <match skip={skip}>
      {(req, res) => {
        // 判断方法和路径是否匹配
        if (req.method !== method) {
          return false
        }

        const matched = pathMatcher(req.path)
        if (!matched) {
          return false
        }

        if (matched.params) {
          Object.assign(req.params, matched.params)
        }

        return response(req, res)
      }}
    </match>
  )
}

function fixedMethod(method: METHODS) {
  return (props: FixedMethodProps) => {
    return <Method method={method} {...props} />
  }
}

export const Get = fixedMethod('GET')
export const Post = fixedMethod('POST')
export const Put = fixedMethod('PUT')
export const Delete = fixedMethod('DELETE')
export const Option = fixedMethod('OPTION')
export const Head = fixedMethod('HEAD')

export default Method
