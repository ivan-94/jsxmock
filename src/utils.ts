export const EMPTY_OBJECT = {}
export const EMPTY_ARRAY = []

export function statusCode(code: string | number) {
  return typeof code === 'string' ? parseInt(code, 10) : code
}
