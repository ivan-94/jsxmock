/* @jsx h */
import { h } from '../h'
import { Component, Request, Response } from '../type'

export interface CatchProps {
  onError: (err: any, req: Request, res: Response) => void
}

/**
 * 捕获下级异常
 */
export const Catch: Component<CatchProps> = props => {
  const { children, onError } = props
  return (
    <use
      m={async (req, res, rec) => {
        try {
          return await rec()
        } catch (err) {
          onError(err, req, res)
          return true
        }
      }}
    >
      {children}
    </use>
  )
}
