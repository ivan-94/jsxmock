/* @jsx h */
import { h } from '../h'
import { Request, Response, MulterFile, MiddlewareMatcherReturn } from '../type'
import { MockType, isMock } from '../mock'
import { normalizedMatcherReturn } from '../runner'
import { EMPTY_OBJECT, EMPTY_ARRAY } from '../utils'
import { Post, FixedMethodProps } from './Method'

export interface UploadProps extends Omit<FixedMethodProps, 'children'> {
  children?:
    | string
    | number
    | object
    | ((
        req: Request,
        res: Response,
        params: { [key: string]: string | MulterFile[] },
      ) => MiddlewareMatcherReturn)
    | MockType
}

/**
 * 文件上传
 * TODO: refactor
 */
export const Upload = (props: UploadProps) => {
  const { children, ...other } = props
  const response =
    typeof children === 'function' && !isMock(children)
      ? (req: Request, res: Response) => {
          if (!req.is('multipart/form-data')) {
            res.status(400)
            res.send('Content-Type must be multipart/form-data')
            return true
          }

          const params = { ...(req.body || EMPTY_OBJECT) }
          ;((req.files || EMPTY_ARRAY) as MulterFile[]).forEach(i => {
            if (i.fieldname in params) {
              params[i.fieldname].push(i)
            } else {
              params[i.fieldname] = [i]
            }
          })

          return normalizedMatcherReturn(children(req, res, params))
        }
      : children

  return <Post {...other}>{response}</Post>
}
