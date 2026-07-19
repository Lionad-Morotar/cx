import { ref, unref, watchEffect } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { useDisplaySelectedProject } from './project'
import { apiGetStandupDetail } from '../apis'

import type { User, Users } from '../apis'
import type { MaybeRef } from 'vue'

const currentUser = ref<User | null>(null)
export const useCurrentUser = () => currentUser

export const useStandupAbsentUsers = (id?: MaybeRef<string>) => {
  id = id || useRouteQuery<string>('standupID')
  const ret = ref([] as Users)

  watchEffect(async () => {
    const _id = unref(id)
    if (!_id) {
      return
    }

    const projectReq = useDisplaySelectedProject
    await projectReq.exec()

    const detail = (await apiGetStandupDetail({ id: _id })).data || {}

    const ids = detail.participants || []

    const allUsers = projectReq.result?.users || []
    const absents = allUsers.filter((x) => !ids.find((y) => String(y) === String(x.id)))

    ret.value = absents
  })

  return ret
}
