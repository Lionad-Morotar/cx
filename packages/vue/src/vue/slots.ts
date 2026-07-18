import { computed, useSlots } from 'vue'

/**
 * 有时我们需要在组件代理内部组件的插槽，举个例子，
 * 页面组件有列表组件，而列表组件里有一个列表项组件，
 * 如果要在页面组件的列表组件给列表项组件传递插槽，
 * 则需要在列表组件里使用 useCmptSlots('item') 方法，
 * 再将结果用 template v-for 的形式在模版声明即可，
 * 页面组件使用 template #item-xxx，
 * 其中 xxx 为列表项组件内的插槽名称
 */
export const useCmptSlots = (prefix: string) => {
  const slots = useSlots()
  return computed(() => {
    const ret = Object.entries(slots).reduce(
      (acc, [name, slot]) => {
        if (name.startsWith(prefix + '-')) {
          const realName = name.replace(prefix + '-', '')
          acc[realName] = slot
        }
        return acc
      },
      {} as Record<string, any>,
    )
    return ret
  })
}
