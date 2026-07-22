/**
 * v-cx-skeleton：骨架屏指令（原骨架指令的站会域实现）
 *
 * 语义保真：
 * - binding.value truthy → 在元素内挂载 ElSkeleton 动画遮罩
 * - delay 读取 `cx-skeleton-delay` 属性（默认 500ms 慢启动，避免闪烁）
 * - value 转 falsy → fade 过渡后销毁
 */
import {
  Transition,
  createApp,
  createVNode,
  h,
  reactive,
  ref,
  toRefs,
  vShow,
  watch,
  withCtx,
  withDirectives,
} from 'vue'
import type { Directive } from 'vue'
import { CxBasics } from '@lionad/cx-components'

const INSTANCE_KEY = Symbol('cx-skeleton-instance')

// CxSkeleton 物料（components 包，shimmer 动画 SFC 自带样式），替代 ElSkeleton
const CxSkeleton = (CxBasics as readonly any[]).find((x) => x?._cx_meta?.key === 'cx-skeleton')!

interface SkeletonElement extends HTMLElement {
  [INSTANCE_KEY]?: { close: () => void }
}

function createSkeletonMask(delay: number) {
  const states = reactive({ isVisible: false })
  const displayVisible = ref(false)
  let visibleTimer = 0

  watch(
    () => states.isVisible,
    (v, ov) => {
      if (!ov && v) {
        // 慢启动：过了 delay 仍在加载才显示骨架，快请求不闪骨架
        displayVisible.value = false
        window.clearTimeout(visibleTimer)
        visibleTimer = window.setTimeout(() => {
          if (states.isVisible) displayVisible.value = true
        }, delay)
      } else {
        displayVisible.value = v
      }
    },
  )

  const component = {
    name: 'CxSkeletonMask',
    setup() {
      return () =>
        h(
          Transition,
          { name: 'fade', onAfterLeave: destroy },
          {
            default: withCtx(() => [
              withDirectives(createVNode(CxSkeleton), [[vShow, displayVisible.value]]),
            ]),
          },
        )
    },
  }

  const instance = createApp(component)
  const vm = instance.mount(document.createElement('div'))

  // 函数声明提升：render 闭包在 mount 时即引用 destroy，const 定义会落 TDZ
  function destroy() {
    vm.$el?.parentNode?.removeChild(vm.$el)
    instance.unmount()
  }

  return {
    ...toRefs(states),
    get $el(): HTMLElement {
      return vm.$el
    },
    close() {
      window.clearTimeout(visibleTimer)
      if (!displayVisible.value) {
        // 骨架从未展示（delay 内请求已完成）：Transition 不会触发 leave，
        // 等待 onAfterLeave 会泄漏子应用，直接销毁
        destroy()
        return
      }
      states.isVisible = false
    },
  }
}

export const vCxSkeleton: Directive<SkeletonElement, boolean> = {
  mounted(el, binding) {
    if (!binding.value) return
    const delay = Number(el.getAttribute('cx-skeleton-delay')) || 500
    const mask = createSkeletonMask(delay)
    mask.isVisible.value = true
    el.appendChild(mask.$el)
    el[INSTANCE_KEY] = mask
  },
  updated(el, binding) {
    if (binding.oldValue === binding.value) return
    if (binding.value && !binding.oldValue) {
      const delay = Number(el.getAttribute('cx-skeleton-delay')) || 500
      const mask = createSkeletonMask(delay)
      mask.isVisible.value = true
      el.appendChild(mask.$el)
      el[INSTANCE_KEY] = mask
    } else {
      el[INSTANCE_KEY]?.close()
      delete el[INSTANCE_KEY]
    }
  },
  unmounted(el) {
    el[INSTANCE_KEY]?.close()
    delete el[INSTANCE_KEY]
  },
}
