<template>
  <div class="issue-card" :class="kls" ref="cardRef">
    <div class="handler" />
    <div class="progress-con" :class="`is-active-${progressStep}`">
      <div
        class="progress in-requirement"
        :class="isActive(0)"
        :data-time="activeTime(0)"
        title="功能设计"
      />
      <div
        class="progress in-design"
        :class="isActive(1)"
        :data-time="activeTime(1)"
        title="界面设计"
      />
      <div
        class="progress in-development"
        :class="isActive(2)"
        :data-time="activeTime(2)"
        title="开发"
      />
      <div
        class="progress in-test"
        v-if="!isQAUnable && !isSubTask"
        :class="isActive(3)"
        :data-time="activeTime(3)"
        title="测试"
      />
      <div
        class="progress in-ui-check"
        v-if="!isUIUnable && !isSubTask"
        :class="isActive(4)"
        :data-time="activeTime(4)"
        title="设计验收"
      />
      <div
        class="progress in-pm-check"
        :class="isActive(5)"
        :data-time="activeTime(5)"
        title="产品验收"
      />
    </div>
    <div class="header">
      <div class="title">
        <div class="issue-id" @click="emits('quick-link', issue)">#{{ issue.gitlabIssueID }}</div>
        <div class="issue-title" :title="issue.name" @click="goGitlabIssuePage(issue)">
          {{ issue.name }}
        </div>
      </div>
      <div class="participants">
        <template v-for="user in getRelatedUsers(issue)" :key="user.id">
          <img class="participant" :title="user.name" :src="user.avatarUrl" />
        </template>
      </div>
    </div>
    <div class="gitlab-project-url">
      <span>{{ issue.displayWebURL }}</span>
    </div>
    <div class="labels">
      <div
        class="label"
        v-for="label in issue.issueLabels"
        v-text="label.name"
        :key="label.id"
        :data-gitlab-label-type="label.name?.split(':')?.[0] || 'normal'"
        :data-gitlab-label-text="label.name"
      />
    </div>
    <div class="lastday" v-if="isDueDateToday">
      <!-- cspell:disable-next-line -->
      <CxSvgIcon class="icon-date" icon-class="riqi" />
      <span class="label">{{ dayjs(issue.dueDate).format('YYYY-MM-DD') }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { unrefElement } from '@vueuse/core'
import { dayjs, isEmpty, secondToManString } from '../../utils'
import { getTaskActiveStep, getTaskStepsSpendSeconds } from '../../utils/label'
import { standupBus as emitter } from '../../utils/standup-bus'

import type { FormattedIssue } from '../../apis'

const emits = defineEmits(['quick-link'])
const props = defineProps<{
  dueDate?: string
  issue: FormattedIssue
}>()
const cardRef = ref()

// console.log('[debug] issue', issue.value)
const issue = computed(() => props.issue || {})
const isDueDateToday = computed(
  () =>
    !isEmpty(issue.value.dueDate) &&
    dayjs(issue.value.dueDate).isSameOrBefore(dayjs(props.dueDate)),
)
const isDueDateInTwoDays = computed(
  () =>
    !isEmpty(issue.value.dueDate) &&
    !isDueDateToday.value &&
    dayjs(issue.value.dueDate).isSameOrBefore(dayjs(props.dueDate).add(1, 'day')),
)
const showDueDateWarning = computed(() => isDueDateToday.value || isDueDateInTwoDays.value)

const isSubTask = computed(() => issue.value.issueLabels?.some((x) => x.name.includes('subtask')))
const isQAUnable = computed(() =>
  issue.value.issueLabels?.some((x) => x.name.includes('qa-unable')),
)
// 目前没有 ui-unable 标签，使用 qa-unable 代替
// 以后“流程应该是正向的”，估计也不会再增加 ui-unable 去反向终止流程
const isUIUnable = isQAUnable

const progressStep = computed(() => getTaskActiveStep(issue.value) || -1)
const isActive = (step: number) => (progressStep.value > step ? 'is-active' : 'is-disabled')
const activeTime = (step: number) => {
  const seconds = String(getTaskStepsSpendSeconds(step, issue.value) || 0)
  return +seconds === 0 ? '' : secondToManString(+seconds)
}

const kls = computed(() => [
  issue.value.state === 'closed' ? 'is-closed' : '',
  isDueDateToday.value ? 'is-due-date-today' : '',
  isDueDateInTwoDays.value ? 'is-due-date-in-two-days' : '',
  showDueDateWarning.value ? 'show-handler' : '',
  blinkTick.value ? 'anim-blink' : '',
])

const getRelatedUsers = (x: FormattedIssue) => {
  const res = new Map()
  if (x.userParticipants?.length) {
    x.userParticipants.map((y) => res.set(+y.id, y))
  }
  if (!isEmpty(x.userAssignee?.name)) {
    res.set(+x.userAssignee.id, x.userAssignee)
  }
  return [...res.values()].reverse()
}

const goGitlabIssuePage = (issue: FormattedIssue) => {
  issue.webUrl && window.open(issue.webUrl)
}

/********************************************************************************** blink  */

const blinkTick = ref(0)
const checkBlink = (gitlabID: string) => {
  if (String(gitlabID) !== String(issue.value.gitlabIssueID)) {
    return
  }

  // 多个 blink 并发时 scrollIntoView 只生效最后一个（已知限制，演示场景可接受）
  const $elm = unrefElement(cardRef.value)
  $elm?.scrollIntoViewIfNeeded({ behavior: 'smooth' })
  setTimeout(
    () => {
      $elm?.scrollIntoViewIfNeeded({ behavior: 'smooth' })
    },
    (Math.random() * 10 + 1) * 17,
  )
  // console.log('unrefElement(cardRef.value)', $elm)

  if (blinkTick.value) {
    clearTimeout(blinkTick.value)
    blinkTick.value = 0
  }
  blinkTick.value = setTimeout(() => {
    blinkTick.value = 0
  }, 1000) as unknown as number
}
emitter.on('highlight-issue-by-gitlab-id', checkBlink as any)
</script>

<style lang="less" scoped>
.issue-card {
  display: grid;
  grid-template: 20px auto auto auto / auto minmax(0, 1fr);
  grid-template-areas:
    'handler header'
    'handler gitlab-project-url'
    'handler labels'
    'handler lastday';
  gap: 4px 0;

  .handler {
    grid-area: handler;
  }
  .progress-con {
    grid-area: progress;
  }
  .header {
    grid-area: header;
  }
  .gitlab-project-url {
    grid-area: gitlab-project-url;
  }
  .labels {
    grid-area: labels;
  }
  .lastday {
    grid-area: lastday;
  }
}
.issue-card {
  position: relative;
  box-sizing: border-box;
  padding: 11px 16px 8px;
  padding-top: 26px;
  border-radius: 8px;
  border: solid 0 white;
  background: white;
  cursor: revert;

  &.anim-blink {
    animation: blink 0.7s cubic-bezier(0, 0.99, 0.97, 0.82);

    @keyframes blink {
      0% {
        background: white;
        border-radius: 4px;
        z-index: 2;
      }
      20% {
        background: #fae08f;
      }
      99% {
        background: white;
        border-radius: 4px;
      }
      100% {
        background: white;
        border-radius: 0;
      }
    }
  }

  &.is-closed {
    filter: brightness(0.9);
  }
  &.is-due-date-today {
    background: #fff2f1;
    border: solid 2px #fe0000;

    &.is-closed {
      background: white;
      border: solid 2px #f3b5b4;

      .handler {
        background: #f3b5b4;
      }
    }
  }
  &.is-due-date-in-two-days {
    background: #fef7e5;
    border: solid 2px #fbae16;
  }

  .handler {
    display: none;
    box-sizing: border-box;
    margin: 8px 0;
    margin-left: -8px;
    margin-right: 9px;
    box-sizing: border-box;
    width: 4px;
    border-radius: 2px;
    height: calc(100% - 8px - 8px);
  }
  &.show-handler {
    .handler {
      display: block;
    }
  }
  &.is-due-date-today {
    .handler {
      background: #fe0000;
    }
  }
  &.is-due-date-in-two-days {
    .handler {
      background: #fbae16;
    }
  }

  .progress-con {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    gap: 0;
    width: 100%;
    height: 16px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    background: white;
    overflow: hidden;

    .progress {
      position: relative;
      flex: 1;
      background: var(--color, #e8e8e8);
      clip-path: polygon(0% 0%, calc(100% - 5px) 0%, 100% 50%, calc(100% - 5px) 100%, 0% 100%);

      &.is-disabled {
        background: #e8e8e8;
      }
      &.is-active {
        &::after {
          content: attr(data-time);
          position: absolute;
          top: 0;
          right: 6px;
          font-size: 12px;
          line-height: 16px;
          color: white;
          text-shadow: 1px 1px rgba(0, 0, 0, 0.2);
          transform: scale(0.8);
        }

        &.in-requirement {
          --color: #fae08f;
        }
        &.in-design {
          --color: #f7cb50;
        }
        &.in-development {
          --color: #f4b63f;
        }
        &.in-test {
          --color: #f19c38;
        }
        &.in-ui-check {
          --color: #e58231;
        }
        &.in-pm-check {
          --color: #d55b26;
        }
      }
    }
    .progress + .progress {
      clip-path: polygon(
        calc(100% - 5px) 0%,
        100% 50%,
        calc(100% - 5px) 100%,
        0% 100%,
        5px 50%,
        0% 0%
      );
    }
    .progress:last-child {
      clip-path: polygon(0 0, 100% 0%, 100% 100%, 0 100%, 5px 50%);
    }
  }
  .header {
    display: flex;
    justify-content: space-between;
    gap: 1em;
    padding: 0;

    .title {
      display: flex;
      gap: 0.2em;
      font-size: 15px;
      overflow: hidden;

      .issue-id {
        flex-shrink: 0;
        font-size: 15px;
        font-weight: bold;
      }
      .issue-id,
      .issue-title {
        &:hover {
          cursor: pointer;
          text-decoration: underline;
        }
      }

      .issue-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
  .participants {
    display: flex;
    flex-wrap: nowrap;
    flex-shrink: 0;
  }
  .participant {
    width: 20px;
    height: 20px;
    border: solid 2px white;
    border-radius: 50%;
    background: #f2f2f2;
    margin-right: -5px;
  }
  .gitlab-project-url {
    font-size: 13px;
    color: #b4b4b4;
  }
  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .label {
      padding: 0 8px;
      border-radius: 8px;
      height: 16px;
      line-height: 14px;
      font-size: 12px;
      font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell,
        'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
      color: white;
      --color: #888;
      background: white;
      border: solid 1px var(--color);
      color: var(--color);

      &[data-gitlab-label-type^='stage'] {
        --color: #ed9121;
      }
      &[data-gitlab-label-type^='state'] {
        --color: #808080;
      }
      &[data-gitlab-label-text^='state: waiting-for-pre-issues'] {
        --color: #ff0000;
      }
      &[data-gitlab-label-type^='type'] {
        --color: #009966;
      }
      &[data-gitlab-label-type='ignore'] {
        --color: #36454f;
      }
      &[data-gitlab-label-type='design'] {
        --color: #88b253;
      }
      &[data-gitlab-label-type='func-design'] {
        --color: #8fbc8f;
      }
      &[data-gitlab-label-type='ui-design'] {
        --color: #3cb371;
      }
      &[data-gitlab-label-text^='priority: high'] {
        --color: #ff0000;
      }
      &[data-gitlab-label-text^='priority: medium'] {
        --color: #fc7878;
      }
      &[data-gitlab-label-text^='priority: low'] {
        --color: #fbc8c8;
        color: #333;
      }
      &[data-gitlab-label-type^='test-estimate'] {
        --color: #c39953;
      }
      &[data-gitlab-label-text^='in: backend'] {
        --color: #5a3393;
      }
      &[data-gitlab-label-text^='in: design'] {
        --color: #f70fac;
      }
      &[data-gitlab-label-text^='in: devops'] {
        --color: #cd5b45;
      }
      &[data-gitlab-label-text^='in: frontend'] {
        --color: #d1518a;
      }
      &[data-gitlab-label-text^='in: meta'] {
        --color: #009193;
      }
      &[data-gitlab-label-text^='in: requirement'] {
        --color: #00b140;
      }
      &[data-gitlab-label-text^='in: tenant'] {
        --color: #009193;
      }
      &[data-gitlab-label-type^='comp'] {
        --color: #05b09d;
      }
      &[data-gitlab-label-text^='effort-'] {
        --color: #808080;
      }
    }
  }
  .lastday {
    display: flex;
    gap: 0.4em;

    .label {
      color: #f5222d;
      font-size: 13px;
    }
  }
}
</style>
