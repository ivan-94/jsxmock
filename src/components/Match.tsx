/* @jsx h */
import { h, Component, hasVNode } from '../h'
import { Request, Response } from '../server'
import { statusCode, transformData } from '../utils'
import { MockType, isMock } from '../mock'
import {
  Middleware,
  MiddlewareMatcher,
  normalizedMatcherReturn,
} from '../runner'

export interface MatchProps {
  match?: (req: Request, res: Response) => boolean
  skip?: boolean
  headers?: { [key: string]: string }
  code?: number | string
  desc?: string
  children?:
    | string
    | number
    | object
    | boolean
    | MiddlewareMatcher
    | MockType
    | unknown
}

/**
 * 底层 Match 组件
 */
export const Match: Component<MatchProps> = props => {
  const { match, skip, children, code = 200, headers } = props
  let response: Middleware | null = null

  if (children && typeof children === 'function' && !isMock(children)) {
    // 自定义响应
    response = (req, res) => normalizedMatcherReturn(children(req, res))
  } else if (!hasVNode(children)) {
    // 固定响应
    response = async (req, res) => {
      res.status(statusCode(code))

      if (headers) {
        res.set(headers)
      }

      if (children) {
        const data = await transformData(children)
        res.send(data)
      } else {
        res.end()
      }
      return true
    }
  }

  return (
    <use
      skip={skip}
      m={async (req, res, rec) => {
        if (match ? match(req, res) : true) {
          if (response) {
            return response(req, res, rec)
          }
          return rec()
        }

        return false
      }}
    >
      {children}
    </use>
  )
}
