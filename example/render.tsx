/* @jsx h */
import { h } from '../src/h'
import { render } from '../src/render'
import { transformTree, runMiddlewares } from '../src/runner'

const comp = (
  <server>
    <use
      m={async (rq, rs, n) => {
        console.log('a')
        const res = await n()
        console.log('end a')
        return res
      }}
    >
      <use
        // skip
        m={async (rq, rs, n) => {
          console.log('a.1')
          await n()
          console.log('end a.1')
          return true
        }}
      ></use>
      <use
        m={async (rq, rs, n) => {
          console.log('a.2')
          await n()
          console.log('end a.2')
          return false
        }}
      ></use>
    </use>
    <use
      m={async (rq, rs, n) => {
        console.log('b')
        return false
      }}
    ></use>
    <use
      m={async (rq, rs, n) => {
        console.log('c')
        return false
      }}
    ></use>
  </server>
)

const r = render(comp)
const c = transformTree(r)
runMiddlewares({} as any, {} as any, c.middlewares)
