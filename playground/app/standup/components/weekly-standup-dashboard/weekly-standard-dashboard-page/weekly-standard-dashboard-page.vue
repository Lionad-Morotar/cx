<template>
  <cx-weekly-standard-dashboard-page-layout>
    <template #page-header-center>
      <cx-weekly-user-info-and-time />
    </template>

    <template #page-header-right>
      <cx-weekly-page-actions />
    </template>

    <template #page-main-section>
      <cx-weekly-main-content />
    </template>

    <template #page-aside-section>
      <cx-weekly-todo-card />
    </template>

    <template #page-right-section>
      <cx-user-select :enable-keyboard-control="true" />
    </template>

    <template v-for="(_, name) in $slots" v-slot:[name]="data">
      <slot :name="name as string" v-bind="data" />
    </template>
  </cx-weekly-standard-dashboard-page-layout>
</template>

<script lang="ts" setup>
import { cxAlert as alert } from '../../../utils/alert'
import { useRouteQuery } from '@vueuse/router'
import {
  CxWeeklyMainContent,
  CxWeeklyTodoCard,
  CxUserSelect,
  CxWeeklyPageActions,
  CxWeeklyStandardDashboardPageLayout,
  CxWeeklyUserInfoAndTime,
} from '../..'

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

// 插槽透传占位
defineOptions({
  name: 'weekly-standup-dashboard-page',
  // async preload (slot: any) {
  //   const standup = slot?.props?.standup
  //   if (standup) {
  //     if (standup.id) {
  //       useStandupDetail(standup.id)
  //       useStandupAbsentUsers(standup.id)
  //     }
  //     if (standup.meetingDate) {
  //       const res = await apiGetStandupRelatedIssues({
  //         date: dayjs(standup.meetingDate).format('YYYY-MM-DD') + ' 00:00:00',
  //         assigneeUserName: '',
  //         allUser: true,
  //         type: 'week',
  //         initData: standup.state === 'IN_PROGRESS' ? true : false,
  //       })
  //       if (res.success) {
  //         // trigger memoize in formatIssue
  //         await Promise.all((res.data || []).map(formatIssue))
  //       }
  //     }
  //   }
  // }
})
</script>

<style lang="scss">
.weekly-standup-dashboard-page {
  box-sizing: border-box;
  padding: 21px 24px 26px;

  .page-header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .page-header-right {
    user-select: none;
  }
  .page-main-section {
    display: grid;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  }
  .page-aside-section {
    margin-top: 54px;
  }
  .page-right-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 54px;
  }
}
</style>
