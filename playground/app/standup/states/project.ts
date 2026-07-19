import { ref, computed } from 'vue'
import { useAsync } from '../hooks/use-async'
import { useStorage } from '@vueuse/core'
import { apiGetProjectDetail } from '../apis'
import { formatEAPProject } from '../utils/project'
import { uniqBy, cloneDeep } from 'lodash-es'

import type { Users } from '../apis'
import { onMounted } from 'vue'

// 获取 select-page 对应页面选择的项目的详情
export const useSelectedProject = useAsync(async () => {
  const res = await apiGetProjectDetail()
  return res.data
})

export const useDisplaySelectedProject = useAsync(async () => {
  const res = await apiGetProjectDetail()
  const ret = await formatEAPProject(res.data)
  // console.info("[info] selected project", ret);
  return ret
})

// 项目的用户列表需要排序，这里使用 localStorage 保存排序后的用户列表
export const selectedProjectUsersReq = useAsync(async () => {
  const projectReq = useDisplaySelectedProject
  await projectReq.exec()

  const usersKey = computed(() =>
    [...uniqBy(projectReq.result?.users || [], 'id')]
      .sort((a, b) => +a.id - +b.id)
      .map((x) => x.id)
      .join('-'),
  )
  const sortedUsers = computed(() => useStorage<Users>(`cx-standup-${usersKey.value}-sorting`, []))

  // 当项目用户和本地的不同时，以接口返回为准
  const users = cloneDeep(projectReq.result?.users || [])
  if (users?.length) {
    const localUsersKey = [...uniqBy(sortedUsers.value.value || [], 'id')]
      .sort((a, b) => +a.id - +b.id)
      .map((x) => x.id)
      .join('-')
    if (localUsersKey !== usersKey.value) {
      sortedUsers.value.value = users
    }
  }

  return sortedUsers.value
})

/**
 * 当前项目排序后的用户列表
 */
export const useProjectUsers = function () {
  const users = ref<Users>([])

  onMounted(async () => {
    await selectedProjectUsersReq.exec()
    users.value = selectedProjectUsersReq.result ?? []
  })

  return users
}
