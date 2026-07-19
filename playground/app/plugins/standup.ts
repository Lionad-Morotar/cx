// 站会域装配：骨架指令、iconfont sprite、域内全局组件
import { RouterLink } from 'vue-router'
import { vCxSkeleton } from '~/standup/utils/skeleton'
import CxSvgIcon from '~/standup/components/cx-svg-icon.vue'
import CxCard from '~/standup/components/cx-card.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('cx-skeleton', vCxSkeleton)
  // v-cx 内联编辑指令：物料模板里的遗留指令，宿主无编辑器语境时注册 no-op 消除警告
  nuxtApp.vueApp.directive('cx', {})
  nuxtApp.vueApp.component('CxSvgIcon', CxSvgIcon)
  nuxtApp.vueApp.component('CxCard', CxCard)
  // NuxtLink 在 Nuxt 4 为按需自动导入（非全局注册），vendored 预构建组件
  // 运行时 resolveComponent('NuxtLink') 会失败，此处以 RouterLink 兜底
  nuxtApp.vueApp.component('NuxtLink', RouterLink)
})
