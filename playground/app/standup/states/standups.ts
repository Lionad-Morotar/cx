import type { Standups } from '../apis/standup/index'
import { onMounted, computed, ref, unref, watchEffect } from 'vue'
import { useAsync } from '../hooks/use-async'
import { useRouteQuery } from '@vueuse/router'
import { apiGetStandups } from '../apis'
import { dayjs } from '../utils'
import type { MeetingType } from '../apis'

import type { Standup } from '../apis'
import type { MaybeRef } from 'vue'

const standupType = ref<MeetingType>('day')

export const useStandupType = (type?: MeetingType) => {
  if (type) {
    standupType.value = type
  }
  return standupType
}

const isInitialized = ref(false)
const standupsReq = useAsync(async (args?: any) => {
  const res =
    (await apiGetStandups({
      type: useStandupType().value,
      ...args,
    })) || {}
  res.data = (res?.data || []).sort(
    (a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf(),
  )
  return res
})
standupsReq.resultHook(() => (isInitialized.value = true))

export const refresh = async () => {
  isInitialized.value = false
  await standupsReq.exec()
}

// 根据 ID 获取站会详情
export const useStandupDetail = (id?: MaybeRef<string>) => {
  id = id || useRouteQuery<string>('standupID')
  const target = ref({} as Standup)

  if (target.value?.id === unref(id)) {
    return target
  }

  watchEffect(async () => {
    if (!standupsReq.isLoading && !isInitialized.value) {
      await standupsReq.exec()
    }
  })

  watchEffect(async () => {
    if (isInitialized.value) {
      const targetID = unref(id)
      const res = (await standupsReq.result)?.data || []
      const find = res.find((x) => String(x.id) === String(targetID))
      // console.log('(await standupsReq.result)?.data', res)
      // console.log("[debug] find", find, res, targetID);
      if (find) {
        target.value = find
      }
    }
  })

  return target
}

// 获取目标站会的上一次站会（以便实现差异对比的功能）
export const useLastStandup = (standup?: MaybeRef<Standup>) => {
  standup = standup || useStandupDetail()
  const last = ref(null as Standup | null)

  const targetID = computed(() => unref(standup)?.id)

  watchEffect(async () => {
    if (targetID.value) {
      const lists = (await standupsReq.result)?.data || []
      const index = lists.findIndex((x) => String(x.id) === targetID.value)
      // console.log("[debug] lists", target.value, targetID.value, lists, index);
      if (index >= 1) {
        last.value = lists[index - 1] ?? null
        // console.log("[info] last standup", last.value);
      } else {
        last.value = null
      }
    }
  })

  return last
}

export const useStandups = (_refresh = false) => {
  const ret = ref([] as Standups)

  _refresh && onMounted(refresh)

  watchEffect(async () => {
    if (!standupsReq.isLoading && !isInitialized.value) {
      await standupsReq.exec()
    }
  })

  watchEffect(async () => {
    const res = standupsReq.result?.data || []
    const sorted = res.sort(
      (a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf(),
    )
    ret.value = sorted
  })

  return ret
}
