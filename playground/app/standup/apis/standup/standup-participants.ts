import { apiMutate } from '../../utils/query-client'

import type { Request } from '..'

/**
 * 设置会议参会人
 */
export const apiUpdateStandupParticipants: Request<{
  id: string
  participants: string[]
}> = async (data) => {
  return apiMutate('/standup/participants', {
    ...data,
  })
}
