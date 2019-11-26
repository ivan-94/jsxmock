/* @jsx h */
import { h, Children } from '../h'
import { Request } from '../server'
import { Post } from './Method'

export interface JSONRPCProps {
  path?: string
  desc?: string
  children: Children
}

export interface JSONRPCMethodProps {
  name: string
  children:
    | boolean
    | string
    | number
    | object
    // TODO: 异步
    | ((body: any, name: string, req: Request) => any)
}

export const JSONRPC = (props: JSONRPCProps) => {
  const { path, children } = props
  return (
    <Post path={path} code={200}>
      {children}
    </Post>
  )
}

JSONRPC.Method = (props: JSONRPCMethodProps) => {
  const { name, children } = props
  return (
    <match>
      {(req, res) => {
        res.status(200)

        try {
          if (!req.is('json')) {
            throw new Error('JSONRPC 协议错误，请求必须是JSON')
          }
          if (req.body.jsonrpc !== '2.0') {
            throw new Error('JSONRPC 协议错误，只支持 2.0 协议')
          }
          if (req.body.method == null) {
            throw new Error('JSONRPC 协议错误，method 不能为空')
          }

          if (req.body.method !== name) {
            return false
          }

          let rtn: any
          if (typeof children === 'function') {
            rtn = children(req.body.params, name, req)
          } else {
            rtn = children
          }
          res.send({
            id: req.body?.id,
            result: rtn,
          })
        } catch (err) {
          res.send({
            id: req.body?.id,
            error: {
              code: err.code || 500,
              message: err.message,
              data: err.data,
            },
          })
        }

        return true
      }}
    </match>
  )
}
