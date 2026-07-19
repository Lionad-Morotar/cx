import { vi } from 'vitest'
import { defineEventHandler, readBody, getRouterParam, setResponseHeader } from 'h3'

// nitro 自动导入的 h3 工具在 vitest 环境手动挂载（server routes 测试需要）
Object.assign(globalThis, {
  defineEventHandler,
  readBody,
  getRouterParam,
  setResponseHeader,
})

// 测试环境不触网：standup 域模块级请求（label/user/gitlab-project 缓存预热）
// 会经 $fetch→全局 fetch 发出，全量跑时与其他测试并发产生 unhandled rejection
const envelope = { code: '0', message: 'ok', success: true, data: [] }

vi.stubGlobal(
  'fetch',
  vi.fn(
    async () =>
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  ),
)
