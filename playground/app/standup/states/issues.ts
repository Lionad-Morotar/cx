import { onMounted } from 'vue'
import { ref, watchEffect, unref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import type { MaybeRef } from 'vue'
import { apiGetSyncTime } from '../apis'

// 获取会议的 issue 同步时间
export const useIssueSyncTime = (id?: MaybeRef<string>) => {
  id = id || useRouteQuery<string>('standupID')
  const ret = ref('')

  const getIssueSyncTime = async () => {
    const _id = unref(id)
    watchEffect(async () => {
      if (_id) {
        const res = (await apiGetSyncTime(_id)) as any
        ret.value = res?.data || ''
      }
    })
  }

  onMounted(getIssueSyncTime)

  return ret
}
