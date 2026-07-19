import { reactive, nextTick } from 'vue'
import type { Get, IsEveryTrueThen } from './types'
import type { Column } from '../type'

type UseEditingStates = {
  isLoading: boolean
  target: string
  value: string
  edit: (item: any, column: Column) => void
  cancel: () => void
  clear: () => Promise<void>
  commit: () => Promise<void>
}

export const useEditing = <
  Q extends Record<string, any>,
  T extends {
    makeQuery: (v: string, s: UseEditingStates) => Q
    apiChange: (v: Q) => Promise<void>
  },
>(
  _opts: GuardUseEditingOpts<T, Q>,
) => {
  const getDefaultOpts = () => ({
    makeQuery: (v: string) =>
      ({
        data: v,
      }) as unknown as Q,
  })

  const opts = Object.assign(getDefaultOpts(), _opts)
  if (!opts.apiChange) {
    throw new Error('[ERR] argument missing apiChange')
  }

  const states = reactive<UseEditingStates>({
    isLoading: false,
    target: '',
    value: '',
    edit,
    cancel,
    clear,
    commit,
  })

  async function clear(): Promise<void> {
    states.target = ''
    states.value = ''
  }

  async function edit(item: any, column: Column): Promise<void> {
    states.target = item.id
    states.value = item[column.key]
  }

  function cancel() {
    clear()
  }

  async function commit(): Promise<void> {
    if (states.isLoading) {
      console.log('[info] waiting for last commit')
      return
    }
    try {
      states.isLoading = true
      const query = opts.makeQuery(states.value, states)
      await opts.apiChange(query)
      await clear()
      nextTick()
    } finally {
      states.isLoading = false
    }
  }

  return states as UseEditingStates
}

export type GuardUseEditingOpts<T, Q> = IsEveryTrueThen<
  [
    /* 保证 makeQuery 返回的类型和 apiChange 接受的类型相等 */
    Get<T, 'makeQuery'> extends (v: any, s: any) => Q ? true : false,
    Get<T, 'apiChange'> extends (v: Q) => Promise<any> ? true : false,
  ],
  T
>
