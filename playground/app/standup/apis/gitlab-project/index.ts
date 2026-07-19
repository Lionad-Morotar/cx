import { cachedRequest } from '../../utils/cyber'

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
  return cachedRequest({
    method: 'POST',
    url: '/gitlab-projects',
    data: {
      searchString: '',
      ...data,
    },
  })
}
