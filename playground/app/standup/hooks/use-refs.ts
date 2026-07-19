import { computed, reactive, onUnmounted } from 'vue'

export function useRefs<T>(clearOnUnmount = true) {
  const maps = reactive<Record<string, T>>({})
  const refs = computed(() => Object.values(maps))

  const set = (id: string, vm: T) => {
    maps[id] = vm
  }
  const get = (id: string) => maps[id]

  const clear = () => {
    for (const key in maps) {
      delete maps[key]
    }
  }

  clearOnUnmount && onUnmounted(clear)

  const states = reactive({
    maps,
    refs,
    set,
    get,
    clear,
    getAll: () => refs.value,
  })

  return states
}
