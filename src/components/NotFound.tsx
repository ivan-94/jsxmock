/* @jsx h */
import { h } from '../h'
import { Component, StringRecord } from '../type'

import { generateCustomResponder, CustomResponder } from './Match'

export interface NotFoundProps {
  onNotFound?: CustomResponder
  skip?: boolean
  code?: string | number
  headers?: StringRecord
}

/**
 * 下级未匹配任何资源
 */
export const NotFound: Component<NotFoundProps> = props => {
  const { children, skip, onNotFound, code = 404, headers } = props
  const standalone = children == null
  const responder = generateCustomResponder(onNotFound, { code, headers })

  return (
    <use
      skip={skip}
      m={async (req, res, rec) => {
        const found = standalone ? false : await rec()
        if (!found) {
          if (responder) {
            return responder(req, res, rec)
          } else {
            res.status(404)
            res.send('Not Found')
            return true
          }
        }

        return false
      }}
    >
      {children}
    </use>
  )
}
