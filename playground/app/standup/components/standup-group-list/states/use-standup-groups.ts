import { computed, onMounted, ref } from 'vue'

import { useAsync } from '../../../hooks/use-async'
import { dayjs, generateDay } from '../../../utils'
import { isWorkday } from '../../../utils/workday'
import { useStandups, useStandupType } from '../../../states/standups'

import type { GroupOfStandups, MeetingType, Standup, Standups } from '../../../apis'
import type { Dayjs } from 'dayjs'

/**
 * 把扁平的 standups 按会议类型聚合成时间分组（本周/本月/本年），
 * 逻辑整体迁移自迁移前的 standup-list.vue，保持分组行为一致。
 */
const groupTypeOf = (meetingType: MeetingType): 'week' | 'month' | 'year' =>
  ({ day: 'week', week: 'month', month: 'year' })[meetingType] as 'week' | 'month' | 'year'

const groupTimeOf = (groupByType: 'week' | 'month' | 'year'): number => {
  const day = 24 * 60 * 60 * 1000
  return { week: day * 7, month: day * 30, year: day * 365 }[groupByType]
}

export const useStandupGroups = () => {
  const standups = useStandups()
  const meetingType = useStandupType()

  // 周会视图只保留每周最后一个工作日作为有效会议日；月会暂不过滤
  const isMeetingDay = (t: string | Dayjs) => {
    const validFn: Record<string, (x: string | Dayjs) => boolean> = {
      day: () => true,
      week: (x) => {
        const weekGen = generateDay(dayjs(x).startOf('week'), 'next', dayjs(x).endOf('week'))
        const lastWorkDayInWeek = [...weekGen]
          .reverse()
          .find((d) => isWorkday(d.format('YYYY-MM-DD')))
        return dayjs(lastWorkDayInWeek).isSame(dayjs(x), 'day')
      },
      month: () => false,
    }
    return validFn[meetingType.value]?.(t) || false
  }

  const task = useAsync(async () => {
    const groupByType = groupTypeOf(meetingType.value)
    const groupByTime = groupTimeOf(groupByType)
    if (!groupByTime) {
      return []
    }
    if (!standups.value?.length) {
      return [] as GroupOfStandups
    }

    const sortedStandups = [...standups.value].sort(
      (a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf(),
    )
    const firstStandup = sortedStandups[0]!

    // 从第一次会议开始计算时间周期数
    const unCeilGroupCount =
      (dayjs().valueOf() - dayjs(firstStandup.meetingDate).startOf(groupByType).valueOf()) /
      groupByTime
    const groupCount = Math.max(1, Math.ceil(unCeilGroupCount))

    const groups: GroupOfStandups = Array(groupCount)
      .fill(0)
      .map((_, offset) => {
        const startDayOfGroup = dayjs(firstStandup.meetingDate).add(offset, groupByType)
        return {
          offsetCount: offset + 1,
          startDay: startDayOfGroup.startOf(groupByType).format('YYYY/MM/DD'),
          endDay: startDayOfGroup.endOf(groupByType).format('YYYY/MM/DD'),
          standups: [] as Standups,
        }
      })

    // 将站会插入对应 group
    standups.value.map((standup) => {
      const group = groups.find(
        (item) =>
          dayjs(standup.meetingDate).startOf(groupByType).format('YYYY/MM/DD') === item.startDay,
      )
      if (group) {
        group.standups.push({
          ...standup,
          meetingDate: dayjs(standup.meetingDate).format('YYYY-MM-DD'),
        })
      }
    })

    // 为每个分组补齐周期内的每一天（无站会的日子填充 UNKNOWN 占位）
    groups.map((item) => {
      const genDay = generateDay(item.startDay, 'next', dayjs(item.endDay).add(1, 'day'))
      for (const t of genDay) {
        const targetDay = dayjs(t).format('YYYY-MM-DD')
        const find = standups.value.find(
          (standup) => dayjs(standup.meetingDate).format('YYYY-MM-DD') === targetDay,
        )
        const removeDayFromGroup = () => {
          if (find) {
            item.standups.splice(
              item.standups.findIndex((standup) => standup.id !== find.id),
              1,
            )
          }
        }
        if (!isMeetingDay(t)) {
          removeDayFromGroup()
          continue
        }
        if (!find) {
          item.standups.push({
            id: targetDay,
            meetingDate: targetDay,
            startTime: '-',
            endTime: '-',
            state: 'UNKNOWN',
          } as Standup)
        }
      }
    })

    // 最新的分组排在最前
    groups.reverse()
    groups.map((item) =>
      item.standups.sort((a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf()),
    )
    return groups
  })

  const isInited = ref(false)
  const reload = async () => {
    isInited.value = false
    await task.exec()
    isInited.value = true
  }
  onMounted(reload)

  // 展示口径与迁移前 fixedDisplayGroupCount=true 一致：只取第一个分组
  const displayGroups = computed<GroupOfStandups>(
    () => task.result?.slice?.(0, 1)?.filter((x) => !!x) || ([] as GroupOfStandups),
  )

  return displayGroups
}
