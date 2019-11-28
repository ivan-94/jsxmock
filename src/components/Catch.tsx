/* @jsx h */
import { h, Component } from '../h'
import { Request, Response } from '../server'

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
          return rec()
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
