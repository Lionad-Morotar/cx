import { apiQuery } from '../../utils/query-client'

import type { Request } from '..'

export type Label = {
  id: string
  name: string
  description: string
  color: string //"#ed9121"
  openIssuesCount: number
  openMergeRequestsCount: number
}

export type LabelEvent = {
  action: 'add' | 'remove'
  label: string
  user: string
  resourceType: string // "ISSUE", ...?
  createdAt: string
}

/**
 * 获取标签列表
 */
export const apiLabelListAll: Request<never, Label[]> = () => {
  return apiQuery('/labels', {})
}
