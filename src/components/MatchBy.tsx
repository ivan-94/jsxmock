/* @jsx h */
import get from 'lodash/get'
import { h } from '../h'
import { Request } from '../type'
import { MatchProps, Match } from './Match'

function isMatch(src: any, value: any | ((value: any) => boolean)) {
  if (typeof value === 'function') {
    return !!value(src)
  }
  return src === value
}

export interface MatchByTypeProps extends Omit<MatchProps, 'match'> {
  key: string
  value: any | ((value: any) => boolean)
}

const createMatcher = (
  match: (req: Request, key: string, value: any) => boolean,
) => {
  return (props: MatchByTypeProps) => {
    const { key, value, ...other } = props
    return (
      <Match match={(req, res) => match(req, key, value)} {...other}></Match>
    )
  }
}

export const MatchByHeader = createMatcher((req, key, value) => {
  const src = req.get(key)
  return isMatch(src, value)
})

export const MatchBySearch = createMatcher((req, key, value) => {
  const src = get(req.query, key)
  return isMatch(src, value)
})

export const MatchByBody = createMatcher((req, key, value) => {
  const src = get(req.body, key)
  return isMatch(src, value)
})

export const MatchByJSON = createMatcher((req, key, value) => {
  if (!req.is('json')) {
    return false
  }

  const src = get(req.body, key)
  return isMatch(src, value)
})

export const MatchByParams = createMatcher((req, key, value) => {
  const src = get(req.params, key)
  return isMatch(src, value)
})

export const MatchByForm = createMatcher((req, key, value) => {
  if (!req.is('application/x-www-form-urlencoded')) {
    return false
  }
  const src = get(req.body, key)
  return isMatch(src, value)
})
