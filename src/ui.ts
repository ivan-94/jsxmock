import fs, { promises as fp } from 'fs'
import path from 'path'
import { transformFileAsync } from '@babel/core'
import { start, restart } from './index'

const NAME = '.mocker'
const EXTS = ['.tsx', '.jsx', '.js']

const BabelConfig = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-react-jsx',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
}

/**
 * 查找配置文件
 */
async function findConfig() {
  const cwd = process.cwd()
  let file: string | undefined
  for (const ext of EXTS) {
    const name = NAME + ext
    try {
      await fp.access(name, fs.constants.F_OK)
      file = name
      break
    } catch {
      continue
    }
  }

  if (file == null) {
    throw new Error(`${NAME}{${EXTS.join('|')}} not found in ${cwd}`)
  }

  return path.join(cwd, file)
}

function wrapCode(code: string) {
  const wrapped = `(function(require, module, exports, __dirname, __filename) {
    ${code}
  })`

  return eval(wrapped)
}

function getInitial(code: string, filename: string) {
  const fn = wrapCode(code)
  const module = {
    exports: {} as any,
  }

  fn(require, module, module.exports, path.dirname(filename), filename)

  const res = module.exports?.default || module.exports
  if (res == null) {
    throw new Error(`${filename} not default export mocker configuration`)
  }

  if (typeof res !== 'function') {
    throw new Error(`mocker configuration must be a function`)
  }

  return res
}

export async function tranformAndRun() {
  const file = await findConfig()
  try {
    const res = await transformFileAsync(file, BabelConfig)
    if (res == null || res.code == null) {
      throw new Error(`failed to transpile ${file}: babel tranform return null`)
    }
    const initial = getInitial(res.code, file)
    start(initial)

    let compiling = false
    fs.watchFile(file, async () => {
      if (compiling) {
        return
      }

      try {
        compiling = true
        console.log('file change recompiling')
        const res = await transformFileAsync(file, BabelConfig)
        if (res == null || res.code == null) {
          throw new Error(
            `failed to transpile ${file}: babel tranform return null`,
          )
        }
        const initial = getInitial(res.code, file)
        restart(initial)
        console.log('mock config patched')
      } catch (err) {
        console.error(err)
      } finally {
        compiling = false
      }
    })
  } catch (err) {
    console.error(err)
  }
}
