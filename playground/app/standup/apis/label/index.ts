import { cachedRequest } from '../../utils/cyber'

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
  return cachedRequest({
    method: 'POST',
    url: '/labels',
    data: {},
  })
}
