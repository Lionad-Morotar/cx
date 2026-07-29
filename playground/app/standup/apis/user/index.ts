import { apiQuery } from '../../utils/query-client'

import type { Request } from '..'

export type User = {
  id: string
  name: string
  username: string
  avatarUrl: string
  created: string
  email: string
  state: string // "blocked"
  webUrl: string
}

export type Users = User[]

/**
 * 获取用户列表
 */
export const apiUserList: Request<never, User[]> = () => {
  return apiQuery('/users', {})
}
