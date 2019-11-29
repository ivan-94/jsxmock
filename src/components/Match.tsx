/* @jsx h */
import { h, hasVNode } from '../h'
import {
  Request,
  Response,
  Middleware,
  MiddlewareMatcher,
  ComponentChildren,
  StringRecord,
} from '../type'
import { statusCode, transformData } from '../utils'
import { MockType, isMock } from '../mock'
import { normalizedMatcherReturn } from '../runner'

export type CustomResponder =
  | MiddlewareMatcher
  | MockType
  | boolean
  | string
  | number
  | object
  | null
  | undefined

export interface MatchProps {
  match?: (req: Request, res: Response) => boolean
  skip?: boolean
  headers?: StringRecord
  code?: number | string
  desc?: string
  children?: ComponentChildren | CustomResponder
}

export function generateCustomResponder(
  responder: CustomResponder,
  options: { code?: string | number; headers?: StringRecord },
): Middleware | null {
  const { code = 200, headers } = options
  if (responder && typeof responder === 'function' && !isMock(responder)) {
    // 自定义响应
    return (req, res) => normalizedMatcherReturn(responder(req, res))
  } else if (!hasVNode(responder)) {
    // 固定响应
    return async (req, res) => {
      res.status(statusCode(code))

      if (headers) {
        res.set(headers)
      }

      if (responder) {
        const data = await transformData(responder)
        res.send(data)
      } else {
        res.end()
      }
      return true
    }
  }
  return null
}

/**
 * 底层 Match 组件
 */
export const Match = (props: MatchProps) => {
  const { match, skip, children } = props
  let response = generateCustomResponder(children, props)

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
