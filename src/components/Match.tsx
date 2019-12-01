/* @jsx h */
import { h, hasVNode } from '../h'
import {
  Request,
  Response,
  Middleware,
  ComponentChildren,
  StringRecord,
} from '../type'
import { statusCode, transformData } from '../utils'
import { MockType, isMock } from '../mock'

export type SendableType =
  | MockType
  | boolean
  | string
  | number
  | object
  | null
  | undefined

export type CustomResponder =
  | ((req: Request, res: Response) => SendableType | Promise<SendableType>)
  | SendableType

export interface MatchProps {
  match?: (req: Request, res: Response) => boolean
  skip?: boolean
  type?: string
  headers?: StringRecord
  code?: number | string
  desc?: string
  children?: ComponentChildren | CustomResponder
}

async function staticDataResponse(
  req: Request,
  res: Response,
  payload: SendableType,
  options: {
    code?: string | number
    headers?: StringRecord
    type?: string
  },
) {
  const { code = 200, headers, type } = options
  res.status(statusCode(code))

  if (headers) {
    res.set(headers)
  }

  if (type != null) {
    res.type(type)
  }

  if (payload) {
    let data = await transformData(payload)

    if (typeof data === 'number' || typeof data === 'boolean') {
      data = JSON.stringify(data)
      if (type == null) {
        res.type('json')
      }
    }

    res.send(data)
  } else {
    res.end()
  }
}

export function generateResponder(
  responder: CustomResponder,
  options: { code?: string | number; headers?: StringRecord; type?: string },
): Middleware | null {
  if (responder && typeof responder === 'function' && !isMock(responder)) {
    // custom response
    return async (req, res) => {
      const rtn = responder(req, res)
      // take over response
      if (!res.headersSent) {
        await staticDataResponse(req, res, rtn, options)
      }

      return true
    }
  } else if (!hasVNode(responder)) {
    // static data response
    return async (req, res) => {
      await staticDataResponse(req, res, responder, options)
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
  let responder = generateResponder(children, props)

  return (
    <use
      skip={skip}
      m={async (req, res, rec) => {
        if (match ? match(req, res) : true) {
          if (responder) {
            return responder(req, res, rec)
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
