<template>
  <!-- 整页结构由 daily-standup-dashboard.schema.ts 描述，经 CxRender 渲染 -->
  <CxRender :components="dailyStandupDashboardSchema" />
</template>

<script lang="ts" setup>
import { useRouteQuery } from '@vueuse/router'

import { dailyStandupDashboardSchema } from '../schemas/daily-standup-dashboard.schema'
import { cxAlert as alert } from '../utils/alert'

/**
 * 视图瘦身为数据接入层：
 * - 页面结构全部来自 schema（静态骨架），动态数据由各内容物料自行消费 store；
 * - 这里只负责 standupID 缺失校验（原 standard-dashboard-page 胖容器的职责）。
 */
const standupID = useRouteQuery<string>('standupID')
if (!standupID.value) {
  alert({
    title: 'ERROR PAGE !',
    content: 'no standup-id provided',
    showClose: false,
  })
}
</script>
