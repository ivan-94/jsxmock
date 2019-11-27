import cmd from 'commander'
import fs from 'fs'
import { findConfig, getDefaultConfigurationPath, tranformAndRun } from './ui'

const temp = `
/* @jsx h */
import { h, Get, Post } from '@gdjiami/mocker'

export default () => (
  <mocker port="4321">
    <Get>hello world</Get>
    <Get path="/foo" code="400">
      foo
    </Get>
    <Post path="/bar">bar</Post>
  </mocker>
)
`

cmd.name('mocker').description('Simple mock server, declare API by JSX')

cmd.option('--init', 'create mocker configuration')

const init = async () => {
  const filename = await findConfig()
  if (filename != null) {
    console.warn('configuration file existed')
    return
  }
  const target = getDefaultConfigurationPath()
  fs.writeFileSync(target, temp)
}

const start = () => {
  tranformAndRun()
}

cmd.parse(process.argv)
if (cmd['init']) {
  init()
} else {
  start()
}
