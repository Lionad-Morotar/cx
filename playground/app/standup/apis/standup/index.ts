import { v4 as uuidV4 } from 'uuid'
import { apiMutate, apiQuery, queryClient } from '../../utils/query-client'
import { cloneDeep } from 'lodash-es'

import type { Request } from '..'
import type { Issue, User } from '..'

export * from './standup-participants'

export type Standup = {
  id: string
  name: string
  created: string
  createdBy: string
  meetingDate: string
  startTime: string
  endTime: string
  state: 'IN_PROGRESS' | 'ENDED' | 'UNKNOWN'
  participants: User['id'][]
}

export type StandupStatus = Standup['state']

export type Standups = Standup[]

export type GroupOfStandup = {
  offsetCount: number
  startDay: string
  endDay: string
  standups: Standups
}

export type GroupOfStandups = GroupOfStandup[]

export type MeetingType = 'day' | 'week' | 'month'

/**
 * 获取站会列表
 */
export const apiGetStandups: Request<
  {
    startTime?: string
    endTime?: string
    type?: MeetingType
  },
  Standups
> = async (data) => {
  return apiQuery('/standup/list', {
    type: 'day',
    ...data,
  })
}

/**
 * 开始站会
 * * 可以重复调用
 */
export const apiStartStandup: Request<
  {
    startTime: string
    type?: MeetingType
  },
  {
    id: string
  }
> = async (data) => {
  // 写后失效：开会后站会列表与详情必须重取
  queryClient.invalidateQueries()
  return apiMutate('/standup/start', {
    type: 'day',
    ...data,
  })
}

/**
 * 结束站会
 */
export const apiStopStandup: Request<
  {
    type?: MeetingType
  },
  null
> = async (data) => {
  // 写后失效：散会后站会列表与详情必须重取
  queryClient.invalidateQueries()
  return apiMutate('/standup/end', {
    type: 'day',
    ...data,
  })
}

/**
 * 获取站会详情
 */
export const apiGetStandupDetail: Request<
  {
    id: string
  },
  Standup
> = async (data) => {
  const res = await apiQuery('/standup/detail', {
    ...data,
  })
  const ret = cloneDeep(res)
  try {
    ret.data.participants = JSON.parse(ret.data?.participants || '[]')
  } catch {
    // ignore
  }
  return ret
}

/**
 * 获取站会数据同步时间
 */
export const apiGetSyncTime: Request<string, string> = async (id) => {
  return apiQuery('/standup/sync-time', {
    type: 'day',
    id,
  })
}

/**
 * 获取站会 issues 内容
 */
export const apiGetStandupRelatedIssues: Request<
  {
    date: string
    assigneeUserName: string
    // 是否实时查数据（默认否，查对应会议的归档数据）
    initData: boolean
    type?: MeetingType
    allUser?: boolean
  },
  Issue[]
> = async (data) => {
  return apiQuery('/issues/user-list', {
    initData: false,
    type: 'day',
    allUser: false,
    ...data,
  })
}

/**
 * 创建站会问题记录
 */
export const apiCreateStandupMemo: Request<
  {
    assignee: string
    meetingId: string
    contents: { content: string }[]
    type?: MeetingType
  },
  unknown
> = async (data) => {
  return apiMutate('/standup/memo/create', {
    type: 'day',
    ...data,
    contents: data?.contents || [],
  })
}

/**
 * 获取站会的个人的问题记录
 */
export const apiGetStandupMemo = (disabled: boolean) =>
  (async (data) => {
    const res = await apiQuery('/standup/memo/get', {
      type: 'day',
      ...data,
    })
    try {
      res.data.contents = JSON.parse(res.data?.problem || '[]')
    } catch (err) {
      // console.info(
      //   "[ERR] error in parse standup contents",
      //   err,
      //   data,
      //   res,
      //   disabled
      // );
      if (!disabled) {
        console.info('[INFO] try create standup memo')
        const createReq = await apiCreateStandupMemo(data as any)
        if ((createReq?.data as any)?.id) {
          console.info('[INFO] create success, retry get')
          const res = await apiMutate('/standup/memo/get', {
            type: 'day',
            ...data,
          })
          res.data.contents = JSON.parse(res?.data?.problem || '[]')
          res.data.contents = res.data.contents.map((x: any) => {
            if (x.id) return x
            else return { ...x, id: uuidV4() }
          })
          return res
        } else {
          throw new Error('... but failed', { cause: err })
        }
      } else {
        console.info('[INFO] disabled, skip')
      }
    }
    return res
  }) as Request<
    {
      assignee: string
      meetingId: string
      type?: MeetingType
    },
    {
      id: string
      contents: {
        id: string
        content: string
      }[]
    }
  >

/**
 * 更新站会的个人的问题记录
 */
export const apiUpdateStandupMemo: Request<
  {
    id: string
    assignee: string
    meetingId: string
    contents: { content: string }[]
    type?: MeetingType
  },
  unknown
> = async (data) => {
  // 写后失效：记录更新后站会数据必须重取
  queryClient.invalidateQueries()
  return apiMutate('/standup/memo/update', {
    type: 'day',
    ...data,
    contents: data?.contents || [],
  })
}
