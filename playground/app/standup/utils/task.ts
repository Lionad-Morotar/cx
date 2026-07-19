import { fallback } from './'
import { useMemoize } from '@vueuse/core'
import { getUser, getUsers } from './user'
import { getGitlabProject } from './gitlab-project'
import { getLabel, getLabels } from './label'

import type { IssueLine } from '../apis'
import type { Issue } from '../apis'

const getIssueID = useMemoize(
  (x: Issue) => {
    if (!x?.webUrl?.split) return ''
    const splits = x.webUrl.split('/')
    return splits[splits.length - 1]
  },
  {
    getKey: (x) => x?.webUrl,
  },
)

const getDisplayProjectURL = useMemoize(
  (x: Issue) => {
    if (!x?.webUrl?.split) return ''
    // console.log('[debug] x', x)
    const splits = x.webUrl.split('.cn/')
    if (splits[1]) {
      return splits[1].split('/-/')[0]
    } else {
      return x.webUrl
    }
  },
  {
    getKey: (x) => x?.webUrl,
  },
)

export const formatIssue = async (x: Issue) => {
  const tester = await getUser(x.tester)
  const assignee = await getUser(x.assignee)
  const participants = await getUsers((x.participants || '').split(','))
  const gitlabProject = await getGitlabProject(x.gitlabProject)
  const issueTypeLabel = await getLabel(x.issueType)
  const issueStageLabel = await getLabel(x.issueStage)
  const issueLabels = await getLabels((x.labels || '').split(','))
  const gitlabIssueID = getIssueID(x)
  const displayWebURL = getDisplayProjectURL(x)
  return {
    ...x,
    name: fallback(x.name),
    issueGroup: fallback(x.issueGroup),
    gitlabProject: fallback(gitlabProject.name),
    gitlabUrl: fallback.url(x.gitlabUrl),
    webUrl: fallback.url(x.webUrl),
    issueLine: fallback(x.issueLine),
    tester: fallback(tester.name || tester.username),
    relatedUsers: fallback(x.relatedUsers),
    testBeginAt: fallback(x.testBeginAt),
    testingCount: fallback(x.testingCount),
    testFinishAt: fallback(x.testFinishAt),
    uiCheckingCount: fallback(x.uiCheckingCount),
    pmCheckingCount: fallback(x.pmCheckingCount),
    issueStage: fallback(issueStageLabel?.name),
    issueType: fallback(issueTypeLabel?.name),
    assignee: fallback(assignee.name || assignee.username),
    assigneeGitlabUrl: fallback.url(assignee.webUrl),
    userAssignee: assignee,
    userParticipants: participants,
    labels: x.labels,
    issueLabels,
    acceptedAt: fallback(x.acceptedAt),
    planedAt: fallback(x.planedAt),
    funcDesigningAt: fallback(x.funcDesigningAt),
    funcDesignedAt: fallback(x.funcDesignedAt),
    uiDesigningAt: fallback(x.uiDesigningAt),
    uiDesignedAt: fallback(x.uiDesignedAt),
    npAt: fallback(x.npAt),
    uiNpAt: fallback(x.uiNpAt),
    pmNpAt: fallback(x.pmNpAt),
    wipAt: fallback(x.wipAt),
    solvedAt: fallback(x.solvedAt),
    inReviewAt: fallback(x.inReviewAt),
    passedAt: fallback(x.passedAt),
    testingAt: fallback(x.testingAt),
    uiCheckingAt: fallback(x.uiCheckingAt),
    uiPassedAt: fallback(x.uiPassedAt),
    pmCheckingAt: fallback(x.pmCheckingAt),
    pmPassedAt: fallback(x.pmPassedAt),
    gitlabIssueID: fallback(gitlabIssueID),
    displayWebURL: fallback(displayWebURL),
  }
}
export type FormattedIssue = Awaited<ReturnType<typeof formatIssue>>

const IssueStages = [
  {
    id: 'wait',
    label: '等待',
  },
  {
    id: 'func_design',
    label: '需求设计',
  },
  {
    id: 'ui_design',
    label: '界面设计',
  },
  {
    id: 'development',
    label: '开发',
  },
  {
    id: 'test',
    label: '测试',
  },
  {
    id: 'ui_check',
    label: '界面验收',
  },
  {
    id: 'pm_check',
    label: '产品验收',
  },
] as const

export type Stage = (typeof IssueStages)[number]['id']

export const getStage = (stage: Stage) => {
  const find = IssueStages.find((x) => x.id === stage)
  return (
    find || {
      id: 'unknown',
      label: '未知',
    }
  )
}
