/* @jsx h */
import {
  start,
  h,
  Method,
  Get,
  Post,
  MatchByJSON,
  MatchByForm,
  JSONRPC,
  mock,
} from './src/index'

export const test = () => {
  return (
    <mocker>
      <Get code="400" path="/shit">
        shit
      </Get>
      <Post headers={{ Test: 'CustomHeader' }}>POST success</Post>
      <Method method="GET" code="200">
        hello world
      </Method>
      <Post path="/jsonrpc-test">
        <MatchByJSON key="method" value="hello">
          {{
            result: 'hello',
          }}
        </MatchByJSON>
        <MatchByForm key="method" value="world">
          {{
            result: 'hello world',
          }}
        </MatchByForm>
      </Post>
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
      <match>
        {(req, res) => {
          res.status(500).send('Mock Server Error')
          return true
        }}
      </match>
    </mocker>
  )
}

start(test)
