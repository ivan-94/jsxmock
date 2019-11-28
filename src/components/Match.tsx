/* @jsx h */
import get from 'lodash/get'
import { h, Component } from '../h'
import { Request, Response } from '../server'
import { MethodProps } from './Method'
import {
  EMPTY_OBJECT,
  statusCode,
  transformData,
  normalizedMatchReturn,
} from '../utils'
import { MockType } from '../mock'

export interface MatchByTypeProps
  extends Omit<MethodProps, 'children' | 'path' | 'method'> {
  key: string
  value: any | ((value: any) => boolean)
  skip?: boolean
  children?:
    | string
    | number
    | object
    | boolean
    | ((req: Request, res: Response) => void | boolean)
    | MockType
}

export interface MatchByProps
  extends Omit<MethodProps, 'children' | 'path' | 'method'> {
  match?: (req: Request, res: Response) => boolean
  skip?: boolean
  children?:
    | string
    | number
    | object
    | boolean
    | ((req: Request, res: Response) => void | boolean)
    | MockType
}

function response(
  req: Request,
  res: Response,
  props: MatchByTypeProps | MatchByProps,
) {
  const { children, code = 200, headers = EMPTY_OBJECT } = props

  if (children && typeof children === 'function') {
    return normalizedMatchReturn(children(req, res))
  } else {
    res.status(statusCode(code))
    res.set(headers)

    if (children) {
      res.send(transformData(children))
    } else {
      res.end()
    }
    return true
  }
}

function isMatch(src: any, value: any | ((value: any) => boolean)) {
  if (typeof value === 'function') {
    return !!value(src)
  }
  return src === value
}

export const MatchBy: Component<MatchByProps> = props => {
  const { match, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        if (match ? match(req, res) : true) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchByHeader: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = req.get(key)
        if (isMatch(src, value)) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchBySearch: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = get(req.query, key)
        if (isMatch(src, value)) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchByBody: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = get(req.body, key)
        if (isMatch(src, value)) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchByJSON: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = get(req.body, key)
        if (req.is('json') && isMatch(src, value)) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchByParams: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = get(req.params, key)
        if (isMatch(src, value)) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}

export const MatchByForm: Component<MatchByTypeProps> = props => {
  const { key, value, skip } = props
  return (
    <match skip={skip}>
      {(req, res) => {
        const src = get(req.body, key)
        if (
          req.is('application/x-www-form-urlencoded') &&
          isMatch(src, value)
        ) {
          return response(req, res, props)
        }

        return false
      }}
    </match>
  )
}
