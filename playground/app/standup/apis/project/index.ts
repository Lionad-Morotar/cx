import { request, cachedRequest } from '../../utils/cyber'

import type { Request } from '..'

/**
 * 项目模型：五角色仓库与用户以逗号分隔 ID 串承载，
 * 由 formatEAPProject 展开为对象数组
 */
export type Project = {
  id: string
  name: string
  code: string
  groupAddress: string
  created: string
  createdBy: string
  lastUpdated: string
  lastUpdatedBy: string
  projectType: string
  version: number
  beProject: string
  beUsers: string
  deProject: string
  deUsers: string
  feProject: string
  feUsers: string
  pmProject: string
  pmUsers: string
  teProject: string
  teUsers: string
}

/**
 * 设置默认项目
 */
export const apiSetDefaultProject: Request<string, unknown> = async (id) => {
  return request({
    method: 'POST',
    url: '/project/select',
    data: {
      projectId: id,
    },
  })
}

/**
 * 获取用户设置的默认项目ID
 */
export const apiGetDefaultProjectID: Request<null, { projectId: string }> = async () => {
  return request({
    method: 'POST',
    url: '/user/setting',
    data: {},
  })
}

/**
 * 获取项目详情
 */
export const apiGetProjectDetail: Request<Partial<Project>, Project> = async (data) => {
  return request({
    method: 'POST',
    url: '/project/detail',
    data,
  })
}
