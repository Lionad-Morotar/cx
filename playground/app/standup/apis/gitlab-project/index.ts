import { apiQuery } from '../../utils/query-client'

import type { RequestPager, PagerArg } from '..'

import type { IssueLine } from '..'

export type GitlabProject = {
  id: string
  name: string
  webUrl: string
  issueGroup: { code: IssueLine; name: string }
  lastUpdated: string
  lastUpdatedBy: string
}

export type GitlabProjects = GitlabProject[]

type ResGitlabProjectList = {
  objects: Partial<GitlabProject>[]
}

/**
 * 获取仓库列表
 */
export const apiGitlabProjectList: RequestPager<PagerArg, ResGitlabProjectList> = async (data) => {
  return apiQuery('/gitlab-projects', {
    searchString: '',
    ...data,
  })
}
