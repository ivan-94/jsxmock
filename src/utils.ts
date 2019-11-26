import { isMock } from './mock'

export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY = []

export function statusCode(code: string | number) {
  return typeof code === 'string' ? parseInt(code, 10) : code
}

export function transformData(data: any) {
  if (isMock(data)) {
    return data()
  }

  return data
}
