/* @jsx h */
import { match } from 'path-to-regexp'
import { h } from '../h'
import { Match, MatchProps } from './Match'

export type METHODS = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTION' | 'HEAD'

export interface MethodProps extends Omit<MatchProps, 'match'> {
  path?: string
  method?: METHODS
}

export type FixedMethodProps = Omit<MethodProps, 'method'>

export const Method = (props: MethodProps) => {
  const { method = 'GET', path = '/', ...other } = props
  let pathMatcher = match(path, { decode: decodeURIComponent })

  return (
    <Match
      match={req => {
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

        return true
      }}
      {...other}
    />
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
