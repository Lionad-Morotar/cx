import { request } from '../../utils/cyber'

import type { Request } from '..'

/**
 * 设置会议参会人
 */
export const apiUpdateStandupParticipants: Request<{
  id: string
  participants: string[]
}> = async (data) => {
  return request({
    method: 'POST',
    url: '/standup/participants',
    data: {
      ...data,
    },
  })
}
