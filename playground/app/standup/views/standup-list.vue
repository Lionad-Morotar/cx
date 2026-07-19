<template>
  <page-main class="standup-list-page">
    <template #preload>
      <!-- <daily-standup-dashboard
        v-if="meetingType === 'day' && lastValidStandup"
        :standup="lastValidStandup"
      />
      <weekly-standup-dashboard
        v-if="meetingType === 'week' && lastValidStandup"
        :standup="lastValidStandup"
      /> -->
    </template>

    <div class="header-section">
      <time-count weekday />
      <div class="buttons-con">
        <el-button class="manual-sync" type="primary" @mousedown="apiSyncIssues">
          <span>手动同步</span>
          <span>10:29</span>
        </el-button>
        <template v-if="isTodayStandupInProgress">
          <el-button
            ref="continueStandupBtnRef"
            type="success"
            :loading="handleContinueOrStarNewStandup.isLoading"
            @mousedown="handleContinueOrStarNewStandup.exec"
          >
            <span>继续会议</span>
          </el-button>
        </template>
        <template v-if="isTodayStandupInProgress">
          <el-button ref="continueStandupBtnRef" @mousedown="resetParticipantsReq.exec">
            <span>设置参会人</span>
          </el-button>
        </template>
        <template v-else>
          <el-button
            ref="startNewStandupBtnRef"
            type="primary"
            :loading="handleContinueOrStarNewStandup.isLoading"
            :disabled="isTodayStandupDone || handleContinueOrStarNewStandup.isLoading"
            :title="isTodayStandupDone ? '今日站会已结束' : ''"
            @mousedown="handleContinueOrStarNewStandup.exec"
          >
            <span>开会</span>
          </el-button>
        </template>
        <fullscreen-button ref="fullScreenBtnRef" />
      </div>
    </div>

    <el-scrollbar class="left-scroll-area">
      <div class="list-section-title is-first">
        本{{ timeRangeMeterStr(groupByType) }}{{ meetingTypeName }}
      </div>

      <div
        class="list-section"
        v-cx-skeleton="standupGroupTask.isLoading && !isInited"
        cx-skeleton-delay="150"
      >
        <div class="list-con">
          <span v-if="!displayStandupGroups?.length" class="empty-group-tip">
            没有找到{{ meetingTypeName }}记录
          </span>
          <template v-for="group in displayStandupGroups" :key="group.startDay">
            <folder-container
              customized-icon
              class="group-con"
              :ref="(ref: any) => groupRefsMan?.set(group.startDay, { ref, group })"
            >
              <template #header>
                <div class="group-header" @mousedown="toggleFoldContainer(group)">
                  <!-- cspell:disable-next-line -->
                  <CxSvgIcon class="icon" icon-class="benzhoudianjihou" />
                  <div class="group-con-title">
                    第{{ toCNNumber(group.offsetCount) }}{{ timeRangeMeterStr(groupByType) }}
                  </div>
                  <div class="group-range">
                    <span>{{ group.startDay }}</span>
                    <span class="sep">~</span>
                    <span>{{ group.endDay }}</span>
                  </div>
                  <!-- cspell:disable-next-line -->
                  <CxSvgIcon class="icon-open" icon-class="xiala-" />
                  <!-- cspell:disable-next-line -->
                  <CxSvgIcon class="icon-close" icon-class="shouqi3" />
                </div>
              </template>
              <template #content>
                <div class="days-con" ref="daysConRef" :class="kls">
                  <div class="empty-tip" v-if="!group.standups?.length">
                    没有找到{{ meetingTypeName }}记录
                  </div>
                  <standup-card
                    v-for="(standup, idx) in group.standups"
                    :key="`${standup.id}${idx}`"
                    :group="group"
                    :idx="idx"
                    :standup="standup"
                    :view-type="viewType"
                    :ref="(ref: any) => standupRefsMan?.set(standup.id, { ref, standup })"
                    @mousedown.stop="goDashboardPage(standup)"
                  >
                    <template #card-title v-if="meetingType === 'week'">
                      <div class="time" :title="dayjs(standup.meetingDate).format('YYYY-MM-DD')">
                        第{{ toCNNumber(idx + 1) }}周
                      </div>
                    </template>
                  </standup-card>
                </div>
              </template>
            </folder-container>
          </template>
        </div>
      </div>

      <div class="list-section-title is-second">历史{{ meetingTypeName }}</div>

      <div
        class="history-section"
        v-cx-skeleton="standupGroupTask.isLoading && !isInited"
        cx-skeleton-delay="150"
      >
        <standup-by-year
          class="history-con"
          :standups="standups"
          v-show="!standupGroupTask.isLoading"
        />
      </div>
    </el-scrollbar>

    <div class="project-members-section">
      <div class="member-section-title">项目成员</div>
      <el-scrollbar>
        <div
          class="project-members-con"
          v-cx-skeleton="sortedUsersReq.isLoading"
          cx-skeleton-delay="150"
        >
          <draggable v-model="sortedUsers" item-key="id">
            <template #item="{ element: user }">
              <div class="member">
                <CxSvgIcon class="drag-handler" icon-class="drag" />
                <div class="avatar">
                  <img :src="user.avatarUrl" />
                </div>
                <div class="name-con" @mousedown="go(user.webUrl)">
                  <span class="name">{{ user.name }}</span>
                  <span class="username">{{ user.username }}</span>
                  <span class="id">#{{ user.id }}</span>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </el-scrollbar>
    </div>

    <select-participants-dialog
      v-model:visible="selectParticipantsDialogVisible"
      ref="selectParticipantsDialogRef"
    />
  </page-main>
</template>

<script lang="ts" setup>
import { isWorkday, isHoliday, getFestival } from '../utils/workday'
import { ref, computed, nextTick, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAsync } from '../hooks/use-async'
import { dayjs } from '../utils'
import {
  apiGetStandupDetail,
  apiUpdateStandupParticipants,
  apiStartStandup,
  apiSyncIssues,
} from '../apis'
import { toCNNumber, timeStr, go, generateDay, timeRangeMeterStr } from '../utils'
import { selectedProjectUsersReq } from '../states/project'
import { useFocus, useRefs, useResponseClassName } from '../hooks'
import { refresh, useStandups, useStandupType } from '../states/standups'

import Draggable from 'vuedraggable'
import PageMain from '../components/layout/page-main.vue'
import TimeCount from '../components/time-count/time-count.vue'
import StandupCard from './components/standup/standup-card.vue'
import StandupByYear from '../components/view-standup-github-grid/view-standup-github-grid.vue'
import FullscreenButton from '../components/fullscreen-button/fullscreen-button.vue'
import FolderContainer from '../components/folder-container/ui/index.vue'
import SelectParticipantsDialog from './components/select-participants-dialog/select-participants-dialog.vue'

import type { Dayjs } from 'dayjs'
import type { User, Standup, Standups, GroupOfStandup, GroupOfStandups } from '../apis'
import type { MeetingType } from '../apis'

const route = useRoute()
const router = useRouter()

/********************************************************************************** Page Configuration */

const viewType = ref<'list-item' | 'card'>('card')
// 会议类型由 query 驱动（/standup/list?type=day|week，缺省日会）
const meetingType = computed(() => {
  const type = route?.query?.type
  return (type === 'week' || type === 'month' ? type : 'day') as MeetingType
})
const meetingTypeName = computed(() => {
  return {
    day: '站会',
    week: '周会',
    month: '月会',
  }[meetingType.value] as string
})
// query.type 原地切换（前进/后退）时同步全局会议类型并重拉数据
watchEffect(() => {
  useStandupType(meetingType.value)
})

/********************************************************************************** Styles */

const daysConRef = ref([] as any[])
const kls =
  meetingType.value == 'day' ? useResponseClassName(computed(() => daysConRef.value[0])) : []

/********************************************************************************** Projects */

const sortedUsersReq = selectedProjectUsersReq
const sortedUsers = computed({
  get: () => sortedUsersReq.result || [],
  set: (v) => {
    sortedUsersReq.result = v
  },
})

/********************************************************************************** Week Group */

// 列表的时间跨度类型
const groupByType = computed(() => {
  return {
    day: 'week',
    week: 'month',
    month: 'year',
  }[meetingType.value] as 'week' | 'month' | 'year'
})

// 列表的时间跨度计时
const groupByTime = computed(() => {
  const day = 24 * 60 * 60 * 1000
  return {
    week: day * 7,
    month: day * 30,
    year: day * 365,
  }[groupByType.value] as number
})

const isMeetingDay = (t: string | Dayjs) => {
  const validFn: Record<string, (x: string | Dayjs) => boolean> = {
    day: () => true,
    week: (x) => {
      const weekGen = generateDay(dayjs(x).startOf('week'), 'next', dayjs(x).endOf('week'))
      const lastWorkDayInWeek = [...weekGen]
        .reverse()
        .find((d) => isWorkday(d.format('YYYY-MM-DD')))

      // console.log('compare', dayStr(x), dayStr(lastWorkDayInWeek), dayjs(lastWorkDayInWeek).isSame(dayjs(x), 'day'))
      // console.log(dayStr(dayjs(x).startOf('week')), dayStr(dayjs(x).endOf('week')))

      return dayjs(lastWorkDayInWeek).isSame(dayjs(x), 'day')
    },
    // 月会视图暂以周会分组逻辑复用
    month: () => false,
  }
  return validFn[meetingType.value]?.(t) || false
}

const standups = useStandups()

const standupGroupTask = useAsync(async () => {
  if (!groupByTime.value) {
    return []
  }

  // * for debug - empty standups
  // const standups = [] as any[]

  // * for debug - single standup
  // const standups = [standups_[0]]

  if (!standups.value?.length) {
    return [] as GroupOfStandups
  }

  const sortedStandups = standups.value.sort(
    (a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf(),
  )
  const firstStandup = sortedStandups[0]!
  // const lastStandup = sortedStandups[sortedStandups.length - 1];
  // console.log('[debug] sortedStandups', sortedStandups, firstStandup);

  // 从第一次会议开始计算时间周期
  const unCeilGroupCount =
    (dayjs().valueOf() - dayjs(firstStandup.meetingDate).startOf(groupByType.value).valueOf()) /
    groupByTime.value
  const groupCount = Math.max(1, Math.ceil(unCeilGroupCount))

  // console.log('[debug] groupCount', groupCount, unCeilGroupCount);

  const groups: GroupOfStandups = Array(groupCount)
    .fill(0)
    .map((_, offset) => {
      const startDayOfGroup = dayjs(firstStandup.meetingDate).add(offset, groupByType.value)
      // console.info('[info] startDay', startDayOfGroup.startOf(groupByType.value).format('YYYY/MM/DD'))
      return {
        offsetCount: offset + 1,
        startDay: startDayOfGroup.startOf(groupByType.value).format('YYYY/MM/DD'),
        endDay: startDayOfGroup.endOf(groupByType.value).format('YYYY/MM/DD'),
        standups: [] as Standups,
      }
    })
  // console.log('[debug]', groupByType.value, groups, unCeilGroupCount, dayjs().format('YYYY-MM-DD HH:mm:ss'), dayjs(lastStandup.meetingDate).format('YYYY-MM-DD HH:mm:ss'));

  // 将站会插入 group.standups 数组
  standups.value.map((standup) => {
    const group = groups.find(
      (item) =>
        dayjs(standup.meetingDate).startOf(groupByType.value).format('YYYY/MM/DD') ===
        item.startDay,
    )
    if (group) {
      const nStandup = {
        ...standup,
        meetingDate: dayjs(standup.meetingDate).format('YYYY-MM-DD'),
      }
      group.standups.push(nStandup)
    }
  })

  // 给 group.standups 数组填充空数据
  groups.map((item) => {
    const genDay = generateDay(item.startDay, 'next', dayjs(item.endDay).add(1, 'day'))
    // console.log('item.startDay', item.startDay, item.endDay)
    for (const t of genDay) {
      const targetDay = dayjs(t).format('YYYY-MM-DD')
      // console.info('[info] targetDay in padding', targetDay)
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

      // 需求要求暂时不过滤非工作日
      const isFilterWorkday = false
      const filterWorkday = () => (isFilterWorkday ? isWorkday(targetDay) : true)

      if (filterWorkday()) {
        if (!find) {
          item.standups.push({
            id: targetDay,
            meetingDate: targetDay,
            startTime: '-',
            endTime: '-',
            state: 'UNKNOWN',
          } as Standup)
        }
      } else {
        removeDayFromGroup()
      }
    }
  })

  /* reverse */
  const enableGroupReverse = true
  if (enableGroupReverse) {
    groups.reverse()
  }
  groups.map((item) =>
    item.standups.sort((a, b) => dayjs(a.meetingDate).valueOf() - dayjs(b.meetingDate).valueOf()),
  )

  return groups
})

const isInited = ref(false)
const reload = async () => {
  isInited.value = false
  if (!standupGroupTask.isLoading || !sortedUsersReq.isLoading) {
    // console.info("[info] reload", standups.value);
    await sortedUsersReq.exec()
    await refresh()
    // console.info("[info] reload done", standups.value);
    await standupGroupTask.exec()
    isInited.value = true
  }
  groupRefsMan.refs.map((x) => (x.ref as any)?.update?.())
}
onMounted(async () => {
  await reload()
})

const todayStandup = computed(() => {
  const target = standups.value.find((standup) => dayjs(standup.meetingDate).isSame(dayjs(), 'day'))
  return target
})

const fixedDisplayGroupCount = true
const displayGroupCount = computed(() => {
  if (fixedDisplayGroupCount) {
    return 1
  }
  const slices = standupGroupTask.result?.slice?.(0, 1)
  const firstGroup = slices?.[0]
  if (!firstGroup) {
    return 0
  }
  const firstGroupStandups = firstGroup.standups || []
  const firstGroupHasValidStandups = Boolean(
    firstGroupStandups.find((standup) => standup.state !== 'UNKNOWN'),
  )
  const groupHasValidStandupsIndex = standupGroupTask.result?.findIndex((group) =>
    Boolean((group.standups || []).find((standup) => standup.state !== 'UNKNOWN')),
  )
  return firstGroupHasValidStandups
    ? 1
    : groupHasValidStandupsIndex === -1
      ? (standupGroupTask.result?.length ?? 0)
      : groupHasValidStandupsIndex
})
const displayStandupGroups = computed(
  () =>
    standupGroupTask.result?.slice?.(0, displayGroupCount.value)?.filter((x) => !!x) ||
    ([] as GroupOfStandups),
)
const lastValidStandup = computed(() => {
  const lastGroup = displayStandupGroups.value[displayStandupGroups.value.length - 1]
  if (!lastGroup) return null
  const lastOne = lastGroup.standups?.findLast((x) => ['IN_PROGRESS', 'ENDED'].includes(x.state))
  // console.log(lastOne?.id || '')
  return lastOne
})

const groupRefsMan = useRefs<{ ref: HTMLElement; group: GroupOfStandup }>()
const groupRefs = computed(() => groupRefsMan.refs.map((x) => x.ref))

const toggleFoldContainer = (group: GroupOfStandup) =>
  (groupRefsMan.get(group.startDay)?.ref as any)?.toggle?.()

const standupRefsMan = useRefs<{ ref: HTMLElement; standup: Standup }>()
const standupRefs = computed(() => standupRefsMan.refs.map((x) => x.ref))

const startNewStandupBtnRef = ref<HTMLElement>()
const continueStandupBtnRef = ref<HTMLElement>()
const fullScreenBtnRef = ref<HTMLElement>()

const focusTargets = computed(() => [
  groupRefs.value,
  [startNewStandupBtnRef.value, continueStandupBtnRef.value],
  [fullScreenBtnRef],
])

const focus = useFocus(focusTargets)
focus.useSubFocus(groupRefs, standupRefs)

/********************************************************************************** Others Interaction */

const isTodayStandupExist = computed(() => {
  return todayStandup.value && dayjs(todayStandup.value?.meetingDate).isSame(dayjs(), 'day')
})
const isTodayStandupDone = computed(() => {
  return isTodayStandupExist.value && ['ENDED'].includes(todayStandup.value!.state)
})
const isTodayStandupInProgress = computed(() => {
  return isTodayStandupExist.value && ['IN_PROGRESS'].includes(todayStandup.value!.state)
})

const selectParticipantsDialogVisible = ref(false)
const selectParticipantsDialogRef = ref<InstanceType<typeof SelectParticipantsDialog>>()
const getSelectedParticipants = async (selected?: User['id'][], notSelected?: User['id'][]) => {
  const selection = await selectParticipantsDialogRef.value?.getPrompt(selected, notSelected)
  if (!selection) {
    return false
  }
  if (selection?.action === 'cancel') {
    return false
  }
  // console.log('[debug] selection', selection)
  const participants = selection?.unSelected || ([] as User[])
  return participants
}

const resetParticipantsReq = useAsync(async () => {
  if (!todayStandup.value?.id) {
    return ElMessage.error('未找到今日会议')
  }
  const detail = (await apiGetStandupDetail({ id: todayStandup.value.id })).data || {}
  const participants = await getSelectedParticipants([], detail.participants)
  if (!participants) {
    return
  }
  try {
    await apiUpdateStandupParticipants({
      id: todayStandup.value.id,
      participants: participants.map((x) => String(x.id)),
    })
    return ElMessage.success('设置成功')
  } catch (error) {
    return ElMessage.error('设置失败')
  }
})

const handleContinueOrStarNewStandup = useAsync(async () => {
  const isContinue = todayStandup.value && isTodayStandupInProgress.value
  if (isContinue) {
    return goDashboardPage(todayStandup.value)
  }

  const participants = await getSelectedParticipants()
  if (!participants || participants.length === 0) {
    return
  }

  const req = await apiStartStandup({
    startTime: timeStr(),
    type: meetingType.value,
  })
  console.log('res', req)

  const target = req.data
  if (req.success && target?.id) {
    // start 接口只回 id；先刷新列表数据再跳转，dashboard 才能查到新会议详情
    await refresh()
    await standupGroupTask.exec()
    await apiUpdateStandupParticipants({
      id: target.id,
      participants: participants.map((x) => String(x.id)),
    })
    await apiGetStandupDetail({ id: target.id })

    nextTick(() => {
      // 新开的会议必为 IN_PROGRESS，直接按 id 跳（原版走 goDashboardPage 依赖
      // state 字段，target 仅含 id 时流程静默中断）
      const page = meetingType.value === 'week' ? 'weekly' : 'daily'
      router.push(`/standup/dashboard/${page}?standupID=${target.id}`)
    })
  } else {
    ElMessage.error('创建失败')
  }
})

const goDashboardPage = (standup: Standup) => {
  if (standup.state === 'IN_PROGRESS' || standup.state === 'ENDED') {
    const page =
      meetingType.value === 'day' ? 'daily' : meetingType.value === 'week' ? 'weekly' : 'monthly'
    router.push(`/standup/dashboard/${page}?standupID=${standup.id}`)
  }
}
</script>

<style lang="less" scoped>
.standup-list-page {
  display: grid;
  grid-template-rows: 30px minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr) 271px;
  grid-template-areas:
    'time time'
    'left project-members';
  padding: 18px 24px;
  box-sizing: border-box;
}

.left-scroll-area :deep(& > .el-scrollbar__wrap > .el-scrollbar__view) {
  grid-area: left;
  display: grid;
  grid-template-rows: 78px auto 78px minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'h1'
    'current-standup-group'
    'h2'
    'history-standups';
}
.header-section {
  grid-area: time;
}
.list-section-title.is-first {
  grid-area: h1;
}
.list-section-title.is-second {
  grid-area: h2;
}
.list-section {
  grid-area: current-standup-group;
}
.history-section {
  grid-area: history-standups;
}
.project-members-section {
  grid-area: project-members;
  margin-top: 78px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .buttons-con {
    :deep(.el-button) {
      width: 76px;
      height: 36px;
      line-height: 36px;
      border-radius: 2px;
    }
  }
}

.list-section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #262626;
}

.list-section {
  position: relative;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);

  .list-con {
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
    padding: 0 2em 0 0 !important;
    min-height: 130px;
    width: 100%;

    .empty-group-tip {
      font-size: 16px;
      color: #666;
    }

    .group-con,
    :deep(.group-con) {
      display: flex;
      flex-direction: column;
      min-width: 500px;
      border-radius: 4px;
      transition: 0.2s;
      cursor: pointer;

      &.is-fold {
        background-color: #f5f5f5;

        .days-con {
          display: none;
        }
        .icon-close {
          display: none;
        }
      }
      &.is-unfold {
        background-color: #eff2fb;
        cursor: revert;

        .group-header {
          cursor: pointer;
        }
        .icon-open {
          display: none;
        }
      }

      .group-header {
        display: grid;
        grid-template: 24px / auto auto 1fr auto;
        box-sizing: border-box;
        padding: 8px 12px;
        align-items: center;
        gap: 12px;
        width: 100%;

        .icon {
          font-size: 18px;
        }
        .group-con-title {
          font-size: 18px;
          font-weight: bold;
          color: #262626;
        }
        .group-range {
          display: flex;
          align-items: center;
          color: #999;

          .sep {
            margin: 0 0.2em;
            font-size: 18px;
          }
        }
        .icon-collapse {
          font-size: 12px;
        }
      }
      .days-con {
        --count: 7;
        --gap-offset: 0px;
        display: grid;
        grid-template-columns: repeat(var(--count, 5), 1fr);
        gap: calc(20px - var(--gap-offset, 0px));
        box-sizing: border-box;
        padding: 8px 20px 14px;
        width: 100%;
        max-width: 100%;

        &:has(> .standup-card:nth-child(4)) {
          --count: 4;
        }
        &:has(> .standup-card:nth-child(5)) {
          --count: 5;
        }
        &:has(> .standup-card:nth-child(6)) {
          --count: 6;
        }
        &:has(> .standup-card:nth-child(7)) {
          --count: 7;
        }

        &.is-sm {
          --count: 6;
          --gap-offset: 2px;
        }
        &.is-xs {
          --count: 5;
          --gap-offset: 4px;
        }
        &.is-x2s {
          --count: 4;
          --gap-offset: 6px;
        }
        &.is-x3s {
          --count: 3;
          --gap-offset: 8px;
        }
        &.is-x4s {
          --count: 2;
          --gap-offset: 10px;
        }
        &.is-x5s {
          --count: 1;
          --gap-offset: 12px;
        }

        .empty-tip {
          padding-left: 25px;
          color: #777;
        }
      }
    }
  }
}

.history-section {
  display: grid;
  grid-template: minmax(min-content, max-content) / minmax(min-content, max-content);
  position: relative;
  min-height: 130px;

  .history-con {
    padding-right: 2em;
    padding-bottom: 1em;
  }
}

.project-members-section {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0px;
    height: 85%;
    border-left: solid 1px #d9d9d9;
  }

  .member-section-title {
    padding: 0 24px 0 32px;
    color: #b4b4b4;
    font-size: 14px;
  }
  .project-members-con {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0 24px 24px 32px;

    .member {
      display: flex;
      align-items: center;
      padding: 12px;
      position: relative;
      margin-left: -12px;
      gap: 12px;

      &:first-child {
        margin-top: 12px;
      }

      &:hover {
        :deep(.drag-handler) {
          opacity: 1;
        }
      }

      :deep(.drag-handler) {
        position: absolute;
        left: -0.6em;
        opacity: 0;
        transition: 0.2s;
        padding: 3px;
        cursor: pointer;
        cursor: grab;
        user-select: none;
      }

      .avatar {
        box-sizing: border-box;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: solid 1.5px transparent;
        // background: #d9d9d9;
        overflow: hidden;
        cursor: pointer;
        cursor: grab;

        &:hover {
          border: solid 1.5px bisque;
        }

        img {
          width: 100%;
          height: 100%;
          border: none;
        }
      }
      .name-con {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
          text-underline-offset: 5px;
          text-decoration-thickness: 1.5px;
          text-decoration-color: bisque;
        }

        .name {
          color: #333;
        }
        .username {
          margin-left: 4px;
        }
        .username,
        .id {
          color: #999;
        }
      }
    }
  }
}
.manual-sync {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
</style>
