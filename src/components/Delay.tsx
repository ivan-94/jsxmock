/* @jsx h */
import { h } from '../h'
import { MatchProps, Match } from './Match'

export interface DelayProps extends Omit<MatchProps, 'match'> {
  timeout?: number
}

export const Delay = (props: DelayProps) => {
  const { timeout = 3000, ...other } = props
  return (
    <use
      m={async (req, res, rec) => {
        await new Promise(res => setTimeout(res, timeout))
        return rec()
      }}
    >
      <Match {...other} />
    </use>
  )
}
