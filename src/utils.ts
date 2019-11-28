import { isMock } from './mock'

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY = []
export const FUNC_RTN_FALSE = () => false

export function statusCode(code: string | number) {
  return typeof code === 'string' ? parseInt(code, 10) : code
}

export async function transformData(data: any): Promise<any> {
  if (isMock(data)) {
    return data()
  } else if (isPromise(data)) {
    const rtn = await data
    // 可能是 mock
    return transformData(rtn)
  }

  return data
}

export function isPromise<R = any>(t: any): t is Promise<R> {
  return (
    !!t &&
    (typeof t === 'object' || typeof t === 'function') &&
    typeof t.then === 'function'
  )
}
