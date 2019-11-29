/* @jsx h */
import { h } from '../h'
import { statusCode } from '../utils'

export interface RedirectProps {
  code?: string | number
  to: string
}

export const Redirect = (props: RedirectProps) => {
  const { code = 302, to } = props
  return (
    <use
      m={async (req, res) => {
        res.redirect(statusCode(code), to)
        return true
      }}
    ></use>
  )
}
