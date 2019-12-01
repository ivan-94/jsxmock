/* @jsx h */
import { h } from '../h'
import { Path } from 'path-to-regexp'
import proxy from 'http-proxy-middleware'
import Method from './Method'

export interface ProxyProps extends proxy.Config {
  path?: Path
  target: string
}

export const Proxy = (props: ProxyProps) => {
  const { path, ...config } = props
  const md = proxy(config)
  const children = (
    <use
      m={async (req, res) =>
        new Promise(resolve => {
          md(req, res, () => resolve(false))
          resolve(true)
        })
      }
    />
  )

  return path ? (
    <Method path={path} method="*">
      {children}
    </Method>
  ) : (
    children
  )
}
