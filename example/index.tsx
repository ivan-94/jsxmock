/* @jsx h */
import {
  h,
  start,
  Get,
  Post,
  All,
  MatchByJSON,
  JSONRPC,
  mock,
  Delete,
  MatchBySearch,
  Proxy,
  NotFound,
  Delay,
  Redirect,
  Catch,
} from '../src/index'
import { BlackHole } from '../src/components/BlackHole'

export const test = () => {
  return (
    <server>
      {/* default path / */}
      <Get>hello world</Get>

      {/* add custom path, code and headers */}
      <Get path="/custom-path" code="400" headers={{ 'X-Power-By': 'JSXMOCK' }}>
        {{ custom: 'return json' }}
      </Get>

      <Get path="/custom-type" type="text">
        text/plain
      </Get>
      <Get path="/buffer">{Buffer.from('buffer')}</Get>
      <Get path="/boolean">{true}</Get>
      <Get path="/number">{1}</Get>

      <Post path="/post">POST success</Post>
      <All path="/all-method">ALL Method</All>
      <Get path="/skip" skip>
        skiped
      </Get>

      {/* path match: power by path-to-regexp */}
      <Get path="/user/:id" code="202">
        {req => `GET USER ${req.params.id}`}
      </Get>

      {/* custom return */}
      <Delete path="/custom-return">
        {(req, res) => {
          res.send('deleted')
        }}
      </Delete>

      {/* mockjs: power by nuysoft/mock */}
      <Get path="/mockjs">
        {mock({
          'id|+1': 1,
          email: '@email',
          name: '@clast',
        })}
      </Get>

      {/* delay response */}
      <Get path="/delay">
        <Delay timeout={5000}>Delay Delay...</Delay>
      </Get>

      {/* redirect */}
      <Get path="/redirect">
        <Redirect to="https://baidu.com" />
      </Get>

      {/* nested match */}
      <Post path="/nested">
        <MatchBySearch key="method" value="hello">
          Match By Search: /nest?method=hello
        </MatchBySearch>
        <MatchByJSON key="method" value="world">
          {`Match By JSON: {method: 'world'}`}
        </MatchByJSON>
        <BlackHole>eat everything</BlackHole>
      </Post>

      {/* jsonrpc 2.0 */}
      <JSONRPC path="/jsonrpc">
        <JSONRPC.Method name="hello">hello</JSONRPC.Method>
        <JSONRPC.Method name="world">world</JSONRPC.Method>
        <JSONRPC.Method name="echo">{params => params}</JSONRPC.Method>
        <JSONRPC.Method name="mock">
          {mock({
            'name|1-5': 'str',
          })}
        </JSONRPC.Method>
        <JSONRPC.Method name="error">
          {params => {
            throw { message: 'message', code: 123, data: 'error data' }
          }}
        </JSONRPC.Method>
      </JSONRPC>

      <Get path="/test-not-found">
        <NotFound onNotFound="未找到任何东西">
          <Get path="/404">Not Found</Get>
        </NotFound>
      </Get>

      <Get path="/test-not-found-2">
        <Get path="/404">Not Found</Get>
        <NotFound onNotFound="未找到任何东西" />
      </Get>

      <Proxy
        path={/^\/proxy/}
        target="http://localhost:4321"
        secure={false}
        logLevel="debug"
        pathRewrite={{ '^/': '/test-proxy/' }}
      />

      <All path="/test-proxy/(.*)">
        {(req, res) => {
          res.send(`Proxy Matched: ${req.path}`)
        }}
      </All>

      <Catch
        onError={(err, req, res) => {
          res.status(500)
          res.send(`Sorry, We got some problems: ${err.message}`)
        }}
      >
        <Get path="/error">
          {() => {
            throw Error('CODE-01')
          }}
        </Get>
      </Catch>

      {/* low level middleware */}
      <use
        m={async (req, res) => {
          res.status(500).send('Mock Server Error')
          return true
        }}
      ></use>
    </server>
  )
}

start(test)
