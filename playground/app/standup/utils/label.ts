import { camelCase } from 'lodash-es'
import { dayjs, isEmpty, secondToManStringCN } from './'
import { getStage } from './task'
import type { FormattedIssue } from './task'
import { useAsync } from '../hooks/use-async'
import { fallback, isEmptyOrFallback } from './'
import { apiLabelListAll } from '../apis'
import { useMemoize } from '@vueuse/core'
import { getUser } from './user'

import type { Label, LabelEvent } from '../apis'
import type { Stage } from '../apis'
import type { User } from '../apis'

const labelRequest = useAsync(apiLabelListAll).exec()

export const getLabel = useMemoize(async (n: Label['id']) => {
  if (!n) {
    return null
  }
  const labels = (await labelRequest)?.data || []
  const find = labels.find((x: Label) => +x.id === +n)
  if (!find) {
    console.log('[WARN] label not find：', n)
  }
  return find
})

export const getLabels = useMemoize(async (xs: Label['id'][]) => {
  if (!xs?.length) {
    return []
  }
  const res = await Promise.all(xs.map(async (x) => (await getLabel(x)) || null))
  return res.filter((x) => !!x) as Label[]
})

export const getLabelFormatted = async (n: Label['id']) => {
  const find = await getLabel(n)
  return {
    ...find,
    name: fallback.label(find?.name),
    description: fallback(find?.description),
    color: fallback(find?.color, 'white'),
  }
}

/******************************************************************** 任务阶段计算 */

// 和 Issue Stage 相关的标签
export const StageLabels = [
  {
    id: 1,
    label: 'stage: accepted',
    name: 'accepted',
    stepValue: 0,
    activeStep: 0,
  },
  {
    id: 2,
    label: 'stage: planed',
    name: 'planed',
    stepValue: 0,
    activeStep: 1,
  },
  {
    id: 3,
    label: 'stage: func-designing',
    name: 'func-designing',
    stepValue: 1,
    activeStep: 1,
  },
  {
    id: 4,
    label: 'stage: func-designed',
    name: 'func-designed',
    stepValue: 1,
    activeStep: 2,
  },
  {
    id: 5,
    label: 'stage: ui-designing',
    name: 'ui-designing',
    stepValue: 2,
    activeStep: 2,
  },
  {
    id: 6,
    label: 'stage: ui-designed',
    name: 'ui-designed',
    stepValue: 2,
    activeStep: 3,
  },
  { id: 7, label: 'stage: wip', name: 'wip', stepValue: 3, activeStep: 3 },
  {
    id: 8,
    label: 'stage: in-review',
    name: 'in-review',
    stepValue: 3,
    activeStep: 3,
  },
  {
    id: 9,
    label: 'stage: review-np',
    name: 'review-np',
    stepValue: 3,
    activeStep: 3,
  },
  // review-np 与其他 np 类标签共享 stepValue（评审未通过回到开发中）
  {
    id: 10,
    label: 'stage: solved',
    name: 'solved',
    stepValue: 3,
    activeStep: 4,
  },
  {
    id: 11,
    label: 'stage: testing',
    name: 'testing',
    stepValue: 4,
    activeStep: 4,
  },
  { id: 12, label: 'stage: np', name: 'np', stepValue: 3, activeStep: 3 },
  {
    id: 13,
    label: 'stage: passed',
    name: 'passed',
    stepValue: 4,
    activeStep: 5,
  },
  {
    id: 14,
    label: 'stage: ui-checking',
    name: 'ui-checking',
    stepValue: 5,
    activeStep: 5,
  },
  {
    id: 15,
    label: 'stage: ui-np',
    name: 'ui-np',
    stepValue: 3,
    activeStep: 3,
  },
  {
    id: 16,
    label: 'stage: ui-passed',
    name: 'ui-passed',
    stepValue: 5,
    activeStep: 6,
  },
  {
    id: 17,
    label: 'stage: pm-checking',
    name: 'pm-checking',
    stepValue: 6,
    activeStep: 6,
  },
  {
    id: 18,
    label: 'stage: pm-np',
    name: 'pm-np',
    stepValue: 3,
    activeStep: 3,
  },
  {
    id: 19,
    label: 'stage: pm-passed',
    name: 'pm-passed',
    stepValue: 6,
    activeStep: 6,
  },
] as const

export const allStepCount = 6

// 小阶段结束时需要高亮下一个阶段，所以 activeStep 和 stepValue 不一致
export const getTaskActiveStep = (task: FormattedIssue) =>
  StageLabels.find((x) => (task.issueLabels || []).find((y) => +x.id === +y.id))?.activeStep

export const getTaskSpendTime = (x: FormattedIssue) => {
  const progressStep = allStepCount
  const times = Array(progressStep + 1)
    .fill(0)
    .map((_, i) => getTaskStepsSpendSeconds(i, x))
  const total = times.reduce((a, b) => a + b, 0)
  return +total
}

export const getTaskSpendTimeSteps = (x: FormattedIssue) => {
  const progressStep = allStepCount
  const times = Array(progressStep + 1)
    .fill(0)
    .map((_, i) => getTaskStepsSpendSeconds(i, x))
  return times
}

export const getTaskWaitTime = (x: FormattedIssue) => {
  // 兼容错误的数据（planAt）
  const planedTime = !isEmpty(x.planedAt)
    ? dayjs(x.planedAt)
    : !isEmpty((x as any).planAt)
      ? dayjs((x as any).planAt)
      : dayjs()
  const passedTime = !isEmpty(x.pmPassedAt) ? dayjs(x.pmPassedAt) : dayjs()

  const totalTimeWithWait = passedTime.diff(planedTime, 'second')
  const totalTimeWithoutWait = getTaskSpendTime(x)
  const waitTime = totalTimeWithWait - totalTimeWithoutWait

  // * for debug
  if (window._debugID && x.webUrl?.includes(String(window._debugID))) {
    console.info(
      '[debug] getTaskWaitTime',
      planedTime.format('YYYY/MM/DD HH:mm:ss'),
      passedTime.format('YYYY/MM/DD HH:mm:ss'),
      secondToManStringCN(totalTimeWithWait),
      secondToManStringCN(totalTimeWithoutWait),
      secondToManStringCN(waitTime),
      getTaskSpendTimeSteps(x),
    )
  }

  return Math.max(waitTime, 0)
}

export const getTaskStepsSpendSeconds = (step: number, task: FormattedIssue) => {
  const stages = StageLabels.filter((x) => x.stepValue === step + 1)

  // 需要兼容老数据（如 funcDesigningAt -> funcDesignAt）
  const stageTimes = stages.map((x) => {
    const name1 = camelCase(x.name + 'At')
    const name2 = camelCase(x.name + 'At').replace(/ing/g, '')
    const time1 = task[name1 as keyof FormattedIssue] as string
    const time2 = task[name2 as keyof FormattedIssue] as string
    return [time1, time2].find((x) => !isEmpty(x))!
  })
  const validStageTimes = stageTimes.filter((x) => !isEmpty(x))

  // * for debug
  if (window._debugID && task.webUrl?.includes(String(window._debugID))) {
    console.info('[debug] getTaskStepsSpendSeconds', step, stages, stageTimes)
  }

  let firstTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  let lastTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
  if (validStageTimes.length >= 2) {
    ;[firstTime, lastTime] = [validStageTimes[0]!, validStageTimes[validStageTimes.length - 1]!]
  }
  if (validStageTimes.length === 1) {
    // 没有第一个阶段的开始标签，不计算该子阶段的时间
    if (!stageTimes[0]) {
      return 0
    } else {
      firstTime = validStageTimes[0]!
    }
  }
  if (validStageTimes.length === 0) {
    return 0
  }

  const diff = dayjs(lastTime).valueOf() - dayjs(firstTime).valueOf()
  const ms = isNaN(diff) ? 0 : diff
  return ms / 1000
}

export const isTaskIn = (task: FormattedIssue, targets: (typeof StageLabels)[number]['name'][]) =>
  targets.find((name) => {
    const targetStage = StageLabels.find((s) => s.name === name)
    return task.issueStage === targetStage?.label
  })

type StageLabel = (typeof StageLabels)[number]['name']
