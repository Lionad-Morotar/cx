<template>
  <!-- 整页结构由 standup-list.schema.ts 描述，经 CxRender 渲染 -->
  <CxRender :components="standupListSchema" />
</template>

<script lang="ts" setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import { standupListSchema } from '../schemas/standup-list.schema'
import { useStandupType } from '../states/standups'

import type { MeetingType } from '../apis'

/**
 * 视图瘦身为数据接入层：
 * - 页面结构全部来自 schema（静态骨架），动态数据由各容器物料自行消费 store；
 * - 这里只负责把 route.query.type 同步为全局会议类型，供各物料读取。
 */
const route = useRoute()
const meetingType = computed(() => {
  const type = route?.query?.type
  return (type === 'week' || type === 'month' ? type : 'day') as MeetingType
})
watchEffect(() => {
  useStandupType(meetingType.value)
})
</script>
