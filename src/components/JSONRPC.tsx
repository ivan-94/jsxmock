/* @jsx h */
import { h, Children } from '../h'
import { Request } from '../server'
import { Post } from './Method'
import { isMock, MockType } from '../mock'
import { transformData } from '../utils'

export interface JSONRPCProps {
  skip?: boolean
  path?: string
  desc?: string
  children: Children
}

export interface JSONRPCMethodProps {
  name: string
  skip?: boolean
  children:
    | boolean
    | string
    | number
    | object
    // TODO: 异步
    | ((body: any, name: string, req: Request) => any)
    | MockType
}

export const JSONRPC = (props: JSONRPCProps) => {
  return <Post code={200} {...props}></Post>
}

JSONRPC.Method = (props: JSONRPCMethodProps) => {
  const { name, children, skip } = props
  return (
    <match skip={skip}>
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
          if (typeof children === 'function' && !isMock(children)) {
            rtn = children(req.body.params, name, req)
          } else {
            rtn = children
          }

          res.send({
            id: req.body?.id,
            result: transformData(rtn),
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
