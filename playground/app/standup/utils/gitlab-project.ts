import { useMemoize } from '@vueuse/core'
import { fallback } from './'
import { useAsync } from '../hooks/use-async'
import { apiGitlabProjectList } from '../apis'

import type { GitlabProject, GitlabProjects } from '../apis'

const userRequest = useAsync(async () =>
  apiGitlabProjectList({
    offset: 0,
    pageSize: 999,
  }),
).exec()

export const getGitlabProject = useMemoize(
  async (x: GitlabProject['id'] | GitlabProject['name']) => {
    const projects = (await userRequest)?.data?.objects || []
    const find = projects.find((y: any) => y.id === x || y.name === x)
    return {
      ...find,
      name: fallback(find?.name),
      webUrl: find?.webUrl || '/',
    } as GitlabProject
  },
)

export const getGitlabProjects = async (xs?: (GitlabProject['id'] | GitlabProject['name'])[]) => {
  if (!xs?.length) {
    return []
  }
  const res = await Promise.all(xs.map(async (x) => (await getGitlabProject(x)) || null))
  return res.filter((x) => !!x) as GitlabProjects
}
