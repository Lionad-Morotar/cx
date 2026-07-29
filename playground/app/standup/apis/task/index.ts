import { apiMutate, apiQuery } from '../../utils/query-client'
import type { PagerArg, RequestPager } from '..'

import type { IssueLine } from '..'
import type { Label, LabelEvent } from '..'
import type { User } from '..'

export type { Stage } from '../../utils/task'

export type Issue = {
  id: string
  state: 'opened' | 'closed'
  name: string
  assignee: string
  createdAt: string
  description: string
  expectedSubmitTestAt: string
  gitlabProject: string
  gitlabUrl: string
  webUrl: string
  issueGroup: string
  issueLine: IssueLine
  relatedUsers: string
  tester: string
  issueType: string
  issueStage: string
  labels: string
  retestTimes: number
  testBeginAt: string
  testFinishAt: string
  testingCount: number
  testState: string
  uiCheckingCount: string
  pmCheckingCount: number
  participants: string
  eventList: LabelEvent[]
  dueDate?: string
  userAssignee?: User
  userParticipants?: User[]
  issueLabels: Label[]
  acceptedAt: string
  planedAt: string
  funcDesigningAt: string
  funcDesignedAt: string
  uiDesigningAt: string
  uiDesignedAt: string
  npAt: string
  uiNpAt: string
  pmNpAt: string
  wipAt: string
  solvedAt: string
  inReviewAt: string
  passedAt: string
  testingAt: string
  uiCheckingAt: string
  uiPassedAt: string
  pmCheckingAt: string
  pmPassedAt: string
  syncTime: string
}
export type { FormattedIssue } from '../../utils/task'

type ResTaskList = {
  objects: Issue[]
}

/**
 * 获取任务列表
 */
export const apiTaskList: RequestPager<PagerArg, ResTaskList> = async (data) => {
  return apiQuery('/issues/list', data || {})
}

/**
 * 手动触发议题数据同步
 */
export const apiSyncIssues = async () => {
  return apiMutate('/issues/sync', {})
}

/**
 * 更新 gitlab issue 的标题字段
 */
export const apiChangeIssueTitle = async (data: { id: string; title: string }) => {
  return apiMutate('/issues/title', data)
}
