/* @jsx h */
import { h, VNode } from '../h'
import { Request } from '../server'
import { Post, MethodProps } from './Method'
import { isMock, MockType } from '../mock'
import { transformData } from '../utils'

export interface JSONRPCProps extends Omit<MethodProps, 'method' | 'code'> {
  children: VNode<any>[]
}

export interface JSONRPCMethodProps {
  name: string
  skip?: boolean
  children:
    | boolean
    | string
    | number
    | object
    | ((body: any, name: string, req: Request) => any)
    | MockType
}

export const JSONRPC = (props: JSONRPCProps) => {
  const { children, ...other } = props
  return (
    <Post code={200} {...other}>
      <use
        m={async (req, res, rec) => {
          res.status(200)

          try {
            // 验证 json rpc 协议
            if (!req.is('json')) {
              throw new Error('JSONRPC 协议错误，请求必须是JSON')
            }

            if (req.body.jsonrpc !== '2.0') {
              throw new Error('JSONRPC 协议错误，只支持 2.0 协议')
            }

            if (req.body.method == null) {
              throw new Error('JSONRPC 协议错误，method 不能为空')
            }

            // 向下匹配方法
            return rec()
          } catch (err) {
            res.send({
              id: req.body?.id,
              error: {
                code: err.code || 500,
                message: err.message,
                data: err.data,
              },
            })
            return true
          }
        }}
      >
        {children}
      </use>
    </Post>
  )
}

JSONRPC.Method = (props: JSONRPCMethodProps) => {
  const { name, children, skip } = props
  return (
    <use
      skip={skip}
      m={async (req, res) => {
        if (req.body.method !== name) {
          return false
        }

        let rtn: any
        if (typeof children === 'function' && !isMock(children)) {
          rtn = children(req.body.params, name, req)
        } else {
          rtn = children
        }

        const result = await transformData(rtn)

        res.send({
          id: req.body?.id,
          result,
        })

        return true
      }}
    ></use>
  )
}
