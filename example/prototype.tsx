/* @jsx h */
import {
  h,
  Get,
  Post,
  MatchBySearch,
  MatchByForm,
  MatchByHeader,
  MatchByJSON,
  JSONRPC,
} from '@gdjiami/mocker'

export default () => (
  <mocker port={8888} host="0.0.0.0" https>
    <Get path="/hello" desc="描述">
      hello world
    </Get>
    {/* 普通对象 */}
    <Post path="/post" code={200}>
      {{
        message: 'success',
      }}
    </Post>
    {/* mock 对象 */}
    <Post path="/post">
      {mockjs.mock({
        'list|100': [{ name: '@city', 'value|1-100': 50, 'type|0-2': 1 }],
      })}
    </Post>
    <Post path="/jsonrpc">
      <MatchBySearch key="key" value="hello" code={200}>
        match by search
      </MatchBySearch>
      <MatchByForm key="form.key" value="hello" code={400}>
        match by form
      </MatchByForm>
      <MatchByHeader key="header.key" value="hello" code={400}>
        match by header
      </MatchByHeader>
      <MatchByJSON key="json.key" value="hello" code={400}>
        match by json
      </MatchByJSON>
      {/* 如何封装成组件 */}
      <JSONRPC method="name">hello</JSONRPC>
      {/* 自定义 */}
    </Post>
    <match>{(req, res) => {}}</match>
    {/* 未匹配到任何数据 */}
    <proxy to="http://192.168.78.201/path"></proxy>
  </mocker>
)
