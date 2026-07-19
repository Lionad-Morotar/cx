import { reactive, watch, onMounted, watchEffect, unref } from 'vue'
import { v4 as uuidV4 } from 'uuid'
import { isNil } from 'lodash-es'
import { useDebounceFn } from '@vueuse/core'
import { useAsync } from '../../hooks/use-async'
import { useStandupType } from '../../states/standups'
import { apiGetStandupMemo, apiUpdateStandupMemo } from '../../apis'
import type { Content, Mention } from './types'

import type { Ref } from 'vue'

type UncleanContent = Partial<Content> & {
  mention?: string[] | Partial<Mention>[]
}

/**
 * 维护问题列表的数据状态
 */
export const useStandupContents = (
  standupID: Ref<string>,
  userIDRef: Ref<string>,
  isDisabledRef: Ref<boolean>,
  filters: (x: Content) => boolean,
) => {
  const meetingType = useStandupType()

  const update = () => {
    if (!states.isInited) {
      return
    }
    if (!standupID.value || !userIDRef.value || !itemsReq.result?.id || !states.isInited) {
      return
    }
    apiUpdateStandupMemo({
      id: itemsReq.result?.id,
      meetingId: unref(standupID),
      assignee: unref(userIDRef),
      contents: states.sourceValue,
      type: unref(meetingType),
    })
  }
  const debouncedUpdate = useDebounceFn(update, 1000)

  const states = reactive({
    isInited: false,
    sourceValue: [] as Content[],
    // filtered value
    value: [] as Content[],
    create,
    createMention,
    clear,
    add,
    remove,
    findIndex,
    updateDB: debouncedUpdate,
    updateDBImmediate: update,
  })

  watchEffect(() => {
    states.value = (states.sourceValue || []).filter(filters)
  })

  /**
   * *********************************************************** CRUD
   */

  async function clear() {
    states.isInited = false
    states.sourceValue = []
  }

  function create(partialContent?: UncleanContent) {
    return typeof partialContent === 'string'
      ? Object.assign(washContent(), { content: partialContent })
      : Object.assign(washContent(), partialContent)
  }
  function createMention(partialMention: string | Partial<Mention> = {}) {
    return typeof partialMention === 'string'
      ? Object.assign(washMention(), { text: partialMention })
      : Object.assign(washMention(), partialMention)
  }

  function add(content?: UncleanContent, idx?: number) {
    if (isDisabledRef.value) {
      return
    }
    const n = states.create(content)
    if (isNil(idx)) {
      states.sourceValue.push(n)
    } else {
      states.sourceValue.splice(idx, 0, n)
    }
    return n
  }

  function remove(line: Content) {
    if (isDisabledRef.value) {
      return
    }
    const idx = states.sourceValue.findIndex((item) => String(item.id) === String(line.id))
    if (idx === -1) {
      return
    }
    states.sourceValue.splice(idx, 1)
  }

  function findIndex(line?: Content | ((x: Content) => boolean)) {
    if (!line) {
      return -1
    }
    if (typeof line === 'function') {
      return states.sourceValue.findIndex(line)
    }
    return states.sourceValue.findIndex((item) => String(item.id) === String(line.id))
  }

  /**
   * *********************************************************** Init & Update
   */

  const itemsReq = useAsync(async () => {
    if (!standupID.value || !userIDRef.value) {
      return {} as {
        id: string
        contents: Content[]
      }
    }
    states.isInited = false
    let res = null as any
    try {
      res = await apiGetStandupMemo(isDisabledRef.value)({
        meetingId: standupID.value,
        assignee: userIDRef.value,
        type: meetingType.value,
      })
      const contents = washContents(res.data?.contents)
      states.sourceValue = contents
    } catch {
      // memo 加载失败退化为空编辑区；res 需兜底，否则下方 return res.data 抛 TypeError
      states.sourceValue = []
      res = res ?? { data: { id: '', contents: [] } }
    }
    states.isInited = true

    return res.data
  })
  watch([() => standupID.value, () => userIDRef.value], () => {
    clear()
    itemsReq.exec()
  })
  onMounted(itemsReq.exec)

  watch(
    () => states.isInited,
    (n) => {
      if (n) {
        watch(states.sourceValue, debouncedUpdate, { deep: true })
      }
    },
  )

  return states
}

// 保证从后端返回的数据的完整性
function washContents(xs?: Partial<Content>[]): Required<Content>[] {
  return (xs || []).map(washContent)
}
function washContent(x?: string | Partial<Content>): Required<Content> {
  let source: Partial<Content>
  try {
    source = JSON.parse(x as string)
  } catch {
    source = typeof x === 'string' ? { content: x } : x!
  }

  return {
    id: source?.id || uuidV4(),
    content: source?.content || '',
    checked: source?.checked || false,
    mention: Array.isArray(source?.mention) ? washMentions(source!.mention) : [],
  }
}
function washMentions(xs?: Partial<Mention>[]): Required<Mention>[] {
  return (xs || []).map(washMention)
}
function washMention(x?: string | Partial<Mention>): Required<Mention> {
  let source: Partial<Mention>
  try {
    source = JSON.parse(x as string)
  } catch {
    source = typeof x === 'string' ? { text: x } : x!
  }

  // console.log("source mention", source);

  return {
    id: source?.id || uuidV4(),
    type: source?.type || 'text',
    text: source?.text || '',
  }
}
