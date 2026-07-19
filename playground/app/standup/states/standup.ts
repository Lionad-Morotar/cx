import { computed } from 'vue'
import { isEqual } from 'lodash-es'

import { useProjectUsers } from './project'
import { useStandupAbsentUsers } from './users'
import { useStandupType } from './standups'

import type { MeetingType } from '../apis'
import type { Ref, ComputedRef } from 'vue'
import type { User, Users } from '../apis'

export type StandupDomainModel = {
  standupType: Ref<MeetingType>
  projectUsers: Ref<Users>
  standupAbsentUsers: Ref<Users>
  presentUsers: ComputedRef<Users>
  firstPresentUser: ComputedRef<User | null>
  lastPresentUser: ComputedRef<User | null>
  isAbsent: (user: User) => boolean
  isFirstPresent: (user: User) => boolean
  isLastPresent: (user: User) => boolean
}

const isSameUser = (x: User | null, y: User | null) =>
  Boolean(x && y && isEqual(String(x.id), String(y.id)))

export const useStandup = (): StandupDomainModel => {
  const projectUsers = useProjectUsers()
  const standupType = useStandupType()
  const standupAbsentUsers = useStandupAbsentUsers()

  const isAbsent = (user: User) => standupAbsentUsers.value.some((u) => isSameUser(user, u))

  const presentUsers = computed(() => projectUsers.value.filter((x) => !isAbsent(x)))
  const firstPresentUser = computed(() => presentUsers.value.find((x) => x) ?? null)
  const lastPresentUser = computed(() => presentUsers.value.findLast((x) => x) ?? null)

  const isFirstPresent = (user: User) => isSameUser(user, firstPresentUser.value)
  const isLastPresent = (user: User) => isSameUser(user, lastPresentUser.value)

  const states: StandupDomainModel = {
    standupType,
    projectUsers,
    standupAbsentUsers,
    presentUsers,
    firstPresentUser,
    lastPresentUser,
    isAbsent,
    isFirstPresent,
    isLastPresent,
  }
  return states
}
