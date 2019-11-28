import { isPromise } from './utils'
import { Request, Response, Middlewares } from './type'

/**
 * 规范化 Matcher 返回值为规范的 middleware 返回值
 */
export async function normalizedMatcherReturn(rtn: any) {
  return isPromise(rtn) ? rtn.then(i => i !== false) : rtn !== false
}

/**
 * 中间件运行
 */
export async function runMiddlewares(
  req: Request,
  res: Response,
  current: Middlewares,
): Promise<boolean> {
  if (current == null || current.m == null) {
    console.warn('use m props cannot be null')
    return false
  }

  if (current.skip) {
    return false
  }

  return current.m(req, res, async () => {
    if (current.children && current.children.length) {
      // 递归匹配子节点
      for (const child of current.children) {
        const matched = await runMiddlewares(req, res, child)
        if (matched) {
          return true
        }
      }

      // 所有子节点都没有匹配
      return false
    }

    return false
  })
}
