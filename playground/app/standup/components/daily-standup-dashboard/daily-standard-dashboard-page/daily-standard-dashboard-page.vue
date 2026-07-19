<template>
  <cx-daily-standard-dashboard-page-layout>
    <template #page-header>
      <cx-daily-standup-header-info />
    </template>

    <template #page-header-right>
      <cx-daily-page-actions />
    </template>

    <template #page-content-left>
      <cx-daily-standup-filter />
    </template>

    <template #page-content-main>
      <cx-daily-main-content />
    </template>

    <template #page-content-right>
      <cx-user-select :enable-keyboard-control="true" />
    </template>

    <template v-for="(_, name) in $slots" v-slot:[name]="data">
      <slot :name="name as string" v-bind="data" />
    </template>
  </cx-daily-standard-dashboard-page-layout>
</template>

<script lang="ts" setup>
import { cxAlert as alert } from '../../../utils/alert'
import { useRouteQuery } from '@vueuse/router'
import { CxUserSelect } from '../..'
import {
  CxDailyPageActions,
  CxDailyStandardDashboardPageLayout,
  CxDailyMainContent,
  CxDailyStandupHeaderInfo,
  CxDailyStandupFilter,
} from '..'

/* -------------------------------------------------------------------------- */
/*                                     env                                    */
/* -------------------------------------------------------------------------- */

const standupID = useRouteQuery<string>('standupID')
if (!standupID.value) {
  alert({
    title: 'ERROR PAGE !',
    content: 'no standup-id provided',
    showClose: false,
  })
}

/* -------------------------------------------------------------------------- */
/*                                   preload                                  */
/* -------------------------------------------------------------------------- */

defineOptions({
  name: 'daily-standup-dashboard-page',
  async preload() {
    // const standup = slot?.props?.standup
    // if (standup?.id) {
    //   useStandupDetail(standup.id)
    //   const absent = useStandupAbsentUsers(standup.id)
    //   const users = await useProjectUsers.exec()
    //   const firstUser = users.find(u => !(absent.value || []).find(au => au.id === u.id))
    //   if (firstUser) {
    //     console.log('asdf')
    //     const res = await apiGetStandupRelatedIssues({
    //       date: dayjs(standup.meetingDate).format('YYYY-MM-DD') + ' 00:00:00',
    //       assigneeUserName: firstUser.username,
    //       allUser: true,
    //       type: 'day',
    //       initData: standup.state === 'IN_PROGRESS' ? true : false,
    //     })
    //     if (res.success) {
    //       // trigger memoize in formatIssue
    //       await Promise.all((res.data || []).map(formatIssue))
    //     }
    //   }
    // }
  },
})
</script>

<style lang="scss">
.daily-standup-dashboard-page {
  .page-header {
    user-select: none;
  }
  .page-content-left {
    box-sizing: border-box;
    height: 94%;
  }
  .page-content-right {
    .user-select {
      width: 94px;
    }
  }
}
</style>

<style>
.standup-by-year-popover {
  margin: 0 24px;
  width: auto !important;
}

.issue-fade-enter-active,
.issue-fade-leave-active {
  transition: all 0.15s ease-in;
}

.issue-fade-enter-from,
.issue-fade-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.switch-edit-type {
  border: solid 1px var(--color, currentColor);
  border-radius: 150%;
  padding: 4px;
  transform: scale(0.6);
  opacity: 0;
}
</style>
