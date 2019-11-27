/* @jsx h */
import get from 'lodash/get'
import { h, Comp } from '../h'
import { Request, Response } from '../server'
import { MethodProps } from './Method'
import { EMPTY_OBJECT, statusCode, transformData } from '../utils'
import { MockType } from '../mock'

export interface MatchByTypeProps
  extends Omit<MethodProps, 'children' | 'path' | 'method'> {
  key: string
  value: any | ((value: any) => boolean)
  children?:
    | string
    | number
    | object
    | boolean
    | ((req: Request, res: Response) => void)
    | MockType
}

export interface MatchByProps
  extends Omit<MethodProps, 'children' | 'path' | 'method'> {
  match?: (req: Request, res: Response) => boolean
  children?:
    | string
    | number
    | object
    | boolean
    | ((req: Request, res: Response) => void)
    | MockType
}

function response(
  req: Request,
  res: Response,
  props: MatchByTypeProps | MatchByProps,
) {
  const { children, code = 200, headers = EMPTY_OBJECT } = props
  if (children && typeof children === 'function') {
    return children(req, res)
  } else {
    res.status(statusCode(code))
    res.set(headers)

    if (children) {
      res.send(transformData(children))
    } else {
      res.end()
    }
  }
}

function isMatch(src: any, value: any | ((value: any) => boolean)) {
  if (typeof value === 'function') {
    return !!value(src)
  }
  return src === value
}

// TODO: 必须在 Method 下面
export const MatchBy: Comp<MatchByProps> = props => {
  const { match } = props
  return (
    <match>
      {(req, res) => {
        if (match ? match(req, res) : true) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchByHeader: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = req.get(key)
        if (isMatch(src, value)) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchBySearch: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = get(req.query, key)
        if (isMatch(src, value)) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchByBody: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = get(req.body, key)
        if (isMatch(src, value)) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchByJSON: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = get(req.body, key)
        if (req.is('json') && isMatch(src, value)) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchByParams: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = get(req.params, key)
        if (isMatch(src, value)) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}

export const MatchByForm: Comp<MatchByTypeProps> = props => {
  const { key, value } = props
  return (
    <match>
      {(req, res) => {
        const src = get(req.body, key)
        if (
          req.is('application/x-www-form-urlencoded') &&
          isMatch(src, value)
        ) {
          response(req, res, props)
          return true
        }

        return false
      }}
    </match>
  )
}
