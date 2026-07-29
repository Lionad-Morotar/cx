// 站会请求层接入 vue-query：与 apis 层共享同一 QueryClient 单例，
// 组件层 useQuery 与 api 层 apiQuery 命中同一缓存与失效域（ssr:false 无需脱水/注水）
import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from '~/standup/utils/query-client'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
