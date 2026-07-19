import { useAsync } from '../hooks/use-async'
import { useMemoize } from '@vueuse/core'
import { apiUserList } from '../apis'

import type { User, Users } from '../apis'

const userRequest = useAsync(apiUserList).exec()

export const getUser = useMemoize(async (x: User['id'] | User['name'] | User['username']) => {
  const users = (await userRequest)?.data || []
  const find = users.find((y: User) => +y.id === +x || y.name === x || y.username === x)
  return {
    ...find,
    name: find?.name || '-',
    username: find?.username || '-',
    webUrl: find?.webUrl || '/',
    avatarUrl: find?.avatarUrl || '/',
  } as User
})

export const getUsers = useMemoize(
  async (xs?: (User['id'] | User['name'] | User['username'])[]) => {
    if (!xs?.length) {
      return []
    }
    const res = await Promise.all(xs.map(async (x) => (await getUser(x)) || null))
    return res.filter((x) => !!x) as Users
  },
)
