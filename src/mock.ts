import Mock from 'mockjs'

export type MockType = () => any
export const mock = (temp: any) => () => Mock.mock(temp)
mock.isMock = true

export function isMock(type: any): type is MockType {
  return type && type.isMock
}
