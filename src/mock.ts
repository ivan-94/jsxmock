import Mock from 'mockjs'

export interface MockType {
  (): any
  _isMock: number
}

export const mock = (temp: any): MockType => {
  const wrapped = () => Mock.mock(temp)
  wrapped._isMock = 1
  return wrapped
}

export const rawMock = Mock.mock

export function isMock(type: any): type is MockType {
  return type && type._isMock
}
