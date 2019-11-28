/* @jsx h */
import { h, Component } from '../h'
import { Request, Response } from '../server'

export interface NotFoundProps {
  onNotFound: (req: Request, res: Response) => Promise<boolean>
}

/**
 * 下级未匹配任何资源
 */
export const NotFound: Component<NotFoundProps> = props => {
  const { children, onNotFound } = props
  return (
    <use
      m={async (req, res, rec) => {
        const found = await rec()
        if (!found) {
          return onNotFound(req, res)
        }
        return true
      }}
    >
      {children}
    </use>
  )
}
