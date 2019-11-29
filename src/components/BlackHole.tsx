/* @jsx h */
import { h } from '../h'
import { MatchProps, Match } from './Match'

export interface BlackHoleProps extends Omit<MatchProps, 'match'> {}

export const BlackHole = (props: BlackHoleProps) => {
  return <Match {...props} />
}
