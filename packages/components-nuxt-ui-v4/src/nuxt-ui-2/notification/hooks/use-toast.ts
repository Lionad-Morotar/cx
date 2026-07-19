import { createSharedComposable } from '@vueuse/core'
import { ref } from 'vue'
export const useToast = createSharedComposable(() => {
  const notifications = ref<any[]>([])
  function add(notification: any) {
    const body = {
      id: (/* @__PURE__ */ new Date()).getTime().toString(),
      ...notification
    }
    const index = notifications.value.findIndex(n => n.id === body.id)
    if (index === -1) {
      notifications.value.push(body)
    }
    return body
  }
  function remove(id: any) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
  function update(id: any, notification: any) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      const previous = notifications.value[index]
      notifications.value.splice(index, 1, { ...previous, ...notification })
    }
  }
  function clear() {
    notifications.value = []
  }
  return {
    notifications,
    add,
    remove,
    update,
    clear
  }
})
