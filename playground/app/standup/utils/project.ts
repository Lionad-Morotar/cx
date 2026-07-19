import { fallback } from './'
import { getUsers } from './user'
import { getGitlabProjects } from './gitlab-project'

import type { Project } from '../apis'

export const formatEAPProject = async (x: Partial<Project>) => {
  const [pmProjects, deProjects, feProjects, beProjects, teProjects] = await Promise.all([
    getGitlabProjects(fallback.xs(x.pmProject?.split?.(','))),
    getGitlabProjects(fallback.xs(x.deProject?.split?.(','))),
    getGitlabProjects(fallback.xs(x.feProject?.split?.(','))),
    getGitlabProjects(fallback.xs(x.beProject?.split?.(','))),
    getGitlabProjects(fallback.xs(x.teProject?.split?.(','))),
  ])

  const [pmUsers, deUsers, feUsers, beUsers, teUsers] = await Promise.all([
    getUsers(fallback.xs(x.pmUsers?.split?.(','))),
    getUsers(fallback.xs(x.deUsers?.split?.(','))),
    getUsers(fallback.xs(x.feUsers?.split?.(','))),
    getUsers(fallback.xs(x.beUsers?.split?.(','))),
    getUsers(fallback.xs(x.teUsers?.split?.(','))),
  ])

  return {
    ...x,
    name: fallback(x.name),
    code: fallback(x.code),
    projectType: fallback(x.projectType, '未知类型'),
    groupAddress: fallback(x.groupAddress),
    pmProjects,
    deProjects,
    feProjects,
    beProjects,
    teProjects,
    pmUsers,
    deUsers,
    feUsers,
    beUsers,
    teUsers,
    projects: [...pmProjects, ...deProjects, ...beProjects, ...feProjects, ...teProjects],
    users: [...pmUsers, ...deUsers, ...feUsers, ...beUsers, ...teUsers],
  }
}
