import { has, genUseHooks } from '@lionad/cx-definition'
import type { CxComponentRuntime, CxComponentSlot } from '@lionad/cx-definition'
import { computed, unref, inject } from 'vue'

export const useCxSlot = (comp: CxComponentRuntime) => {
  const isEditMode = computed(() => unref(inject('is-cx-edit', false)))

  /**
   * showSlot 判断是否启用插槽（根据组件是否有对应插槽的子组件）
   *
   * 由于 cx-component 一定会向组件暴露的插槽提供 cx-render-components 组件，
   * 编辑器拖拽组件显示插槽占位依赖此特性，所以 Vue 组件中的此类写法：
   * <slot name="header"><h1>Header</h1></slot> 是不生效的，h1 会被覆盖，
   * 需要改写为，<slot name="header" v-if="showSlot('header')" /><h1 v-else>Header</h1>
   *
   * 其次相关 Nuxt UI，Nuxt UI 2 组件内插槽的写法是如果有 $slot.xxx 就显示，不然显示默认内容，
   * 所以 cx 组件需要一种方法确认在什么时候需要从 cx 组件向 Nuxt UI 2 组件提供插槽内容，
   * 举一些例子：
   * 1. 当 cx 组件对应插槽内容不为空时，需要显示插槽内容
   * 2. 当 cx 组件对应插槽内容为空时，可能 cx 组件内实现了 fallback 逻辑，如 cx-figure 组件未上传图片时显示占位符号
   * 3. 非编辑状态下，不需要 fallback 逻辑时，可能需要强制显示插槽内容（以便覆盖 Nuxt UI 组件中可能存在的默认内容）
   *
   * 之后可能要批量对接其他组件库，所以目前不太确信此类写法是否需要重构
   */
  const showSlot = (slotName: CxComponentSlot['key']) => {
    // console.log('[info] showSlot', slotName, comp?.components?.[slotName]?.length ?? 0)
    return has(comp?.components?.[slotName]?.length)
  }
  // ?
  const showDefault = () => {
    return isEditMode.value
  }

  return {
    showSlot,
    showDefault,
  }
}
