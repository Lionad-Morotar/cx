<template>
  <div :class="ns.b()" ref="compRef">
    <UButton
      ref="prevUserButtonRef"
      variant="link"
      color="primary"
      :disabled="isDisabledPrevUser"
      @click="selectPrevUser"
      >上一位</UButton
    >
    <UIcon
      ref="prevStandupButtonRef"
      name="i-lucide-chevron-left"
      class="prev-standup-icon"
      :class="{ ['is-disabled']: !prevStandup }"
      title="上一次会议"
      @click="goPrevStandup"
    />
    <UPopover :popper="{ placement: 'bottom' }" class="time-count-popover">
      <cx-time-count
        ref="timeSelectRef"
        data-focus-id="calendar-select"
        class="time-count"
        weekday
        :run="isCurStandupInProgress"
        :time="isCurStandupInProgress ? () => dayjs() : standup.meetingDate"
        :format="isCurStandupInProgress ? 'YYYY/MM/DD HH:mm:ss' : 'YYYY/MM/DD'"
      />
      <template #content>
        <div class="standup-by-year-popover">
          <cx-view-standup-github-grid :monthCount="6" />
        </div>
      </template>
    </UPopover>
    <UIcon
      ref="nextStandupButtonRef"
      name="i-lucide-chevron-right"
      class="next-standup-icon"
      :class="{ ['is-disabled']: !nextStandup }"
      title="下一次会议"
      @click="goNextStandup"
    />
    <template v-if="isCurStandupInProgress && isDisabledNextUser">
      <UButton
        ref="stopStandupButtonRef"
        variant="link"
        color="success"
        :loading="stopStandupReq.isLoading"
        @click="stopStandupReq.exec"
        >结束会议</UButton
      >
    </template>
    <template v-else>
      <UButton
        ref="nextUserButtonRef"
        variant="link"
        color="primary"
        :disabled="isDisabledNextUser"
        @click="selectNextUser"
        >下一位</UButton
      >
    </template>
  </div>
</template>

<script lang="ts" setup>
/* NPM Depends */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
/* Project Depends */
import { standupBus as cx } from '../../../utils/standup-bus'
import { useAsync } from '../../../hooks/use-async'
import { useCxNamespace } from '../../../utils/namespace'
/* Components */
import { CxViewStandupGithubGrid, CxTimeCount } from '../..'
/* States */
import { useStandupType, useStandups, useStandupDetail } from '../../../states/standups'
/* Utils */
import { dayjs } from '../../../utils'
/* APIs */
import { apiStopStandup } from '../../../apis'
/* Config */
/* Assets (CSS、Images) */
/* Types */
import type { Standup } from '../../../apis'

defineOptions({ name: 'CxDailyStandupHeaderInfo' })

const router = useRouter()
const toast = useToast()
const standupID = useRouteQuery<string>('standupID')

const ns = useCxNamespace('daily-standup-header-info')

const cxUserSelectRef = ref<any>()
cx.on('pass:instance:CxUserSelectRef', (instance) => {
  cxUserSelectRef.value = instance
})

/* -------------------------------------------------------------------------- */
/*                                   states                                   */
/* -------------------------------------------------------------------------- */

const compRef = ref()
const timeSelectRef = ref(null)

const userSelectRef = ref()
onMounted(() => {
  // no cx-render render done callback yet
  setTimeout(() => {
    userSelectRef.value = cxUserSelectRef.value?.exposed || {}
  }, 500)
})
const isDisabledPrevUser = computed(() => userSelectRef.value?.isFirstPresent?.())
const isDisabledNextUser = computed(() => userSelectRef.value?.isLastPresent?.())
const selectPrevUser = () => userSelectRef.value?.selectPrev?.()
const selectNextUser = () => userSelectRef.value?.selectNext?.()

const standups = useStandups()
const standup = useStandupDetail()
const meetingType = useStandupType()
const isCurStandupInProgress = computed(() => standup.value.state === 'IN_PROGRESS')

const prevStandup = computed(() => {
  const data = standups.value || []
  const idx = data.findIndex((x) => String(x.id) === String(standupID.value))
  return data[idx - 1] || null
})

const nextStandup = computed(() => {
  const data = standups.value || []
  const idx = data.findIndex((x) => String(x.id) === String(standupID.value))
  return data[idx + 1] || null
})

const goPrevStandup = () => goStandup(prevStandup.value)
const goNextStandup = () => goStandup(nextStandup.value)
const goStandup = (x: Standup | null) => {
  if (x?.id) {
    standupID.value = x.id
    console.info('[info] checkout id', x.id)
  } else {
    console.info('[ERR] no id found')
  }
}

/* -------------------------------------------------------------------------- */
/*                                 interaction                                */
/* -------------------------------------------------------------------------- */

const stopStandupReq = useAsync(async () => {
  const res = await apiStopStandup({
    type: meetingType.value,
  })
  if (res.success) {
    toast.add({ title: '会议已结束', color: 'success' })
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.go(-1)
  }
})

/* -------------------------------------------------------------------------- */
/*                                   exposed                                  */
/* -------------------------------------------------------------------------- */

const resetReq = useAsync(async () => {
  await Promise.all([])
})
const reloadReq = useAsync(async () => {
  await resetReq.exec()
  await Promise.all([])
})
onMounted(reloadReq.exec)

defineExpose({
  reload: reloadReq.exec,
  isLoading: computed(() => reloadReq.isLoading),
})
</script>

<style>
.cx-daily-standup-header-info {
  display: grid;
  grid-template-columns: 160px 30px 330px 30px 160px;
  place-items: center;
  place-content: center;
  width: 100%;
  height: 100%;
  font-size: 18px;

  .time-count {
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    .weekday {
      font-size: 18px;
    }
  }

  .el-button,
  button {
    align-self: end;

    &.is-disabled {
      color: #d9d9d9;
    }

    & > span {
      font-size: 18px;
    }
  }

  .prev-standup-icon,
  .next-standup-icon {
    padding: 3px;
    cursor: pointer;
    border-radius: var(--el-border-radius-base);

    &.is-disabled {
      color: #d9d9d9;
    }
  }

  .today-tag {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    width: 44px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;

    .el-tag__content {
      font-size: 12px;
    }
  }
}

/* 年度站会网格 popover：el-popover teleport 到 body，需全局样式；
   原胖容器 standard-dashboard-page 承载，胖容器删除后迁入此物料 */
.standup-by-year-popover {
  margin: 0 24px;
  width: auto !important;
}
</style>
