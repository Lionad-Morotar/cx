// 站会域装配：骨架指令、iconfont sprite、域内全局组件
import { RouterLink } from 'vue-router'
import { vCxSkeleton } from '~/standup/utils/skeleton'
import CxSvgIcon from '~/standup/components/cx-svg-icon.vue'
import CxCard from '~/standup/components/cx-card.vue'
import { CxBasics } from '@lionad/cx-comps'

// CxScrollbar：滚动容器物料，业务组件模板直接 <CxScrollbar> 用，替代 el-scrollbar
const CxScrollbar = (CxBasics as readonly any[]).find((x) => x?._cx_meta?.key === 'cx-scrollbar')

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('cx-skeleton', vCxSkeleton)
  if (CxScrollbar) nuxtApp.vueApp.component('CxScrollbar', CxScrollbar as any)
  nuxtApp.vueApp.component('CxSvgIcon', CxSvgIcon)
  nuxtApp.vueApp.component('CxCard', CxCard)
  // NuxtLink 在 Nuxt 4 为按需自动导入（非全局注册），vendored 预构建组件
  // 运行时 resolveComponent('NuxtLink') 会失败，此处以 RouterLink 兜底
  nuxtApp.vueApp.component('NuxtLink', RouterLink)
})
