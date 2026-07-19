import { describe, expect, it } from 'vitest'
import {
  StageLabels,
  allStepCount,
  getTaskStepsSpendSeconds,
  getTaskActiveStep,
  isTaskIn,
} from '../app/standup/utils/label'

// StageLabels 是周会 13 项指标与看板进度条的底座契约
describe('StageLabels', () => {
  it('19 个 stage 标签，id 为 1~19 顺序整数', () => {
    expect(StageLabels).toHaveLength(19)
    StageLabels.forEach((x, i) => expect(x.id).toBe(i + 1))
  })

  it('stepValue 覆盖 0~6 全阶段', () => {
    const steps = new Set(StageLabels.map((x) => x.stepValue))
    for (let i = 0; i <= allStepCount; i++) {
      expect(steps.has(i as 0)).toBe(true)
    }
  })

  it('label 命名遵循 "stage: xxx" 契约', () => {
    StageLabels.forEach((x) => expect(x.label).toMatch(/^stage: /))
  })
})

describe('getTaskStepsSpendSeconds', () => {
  it('按阶段首尾时间差累计耗时（秒）', () => {
    const task = {
      // stepValue 1 = func-designing → func-designed
      funcDesigningAt: '2026-07-01 09:00:00',
      funcDesignedAt: '2026-07-01 17:00:00',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    // step 0 对应 stepValue 1（功能设计阶段）
    expect(getTaskStepsSpendSeconds(0, task)).toBe(8 * 3600)
  })

  it('无阶段时间返回 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getTaskStepsSpendSeconds(2, {} as any)).toBe(0)
  })
})

describe('getTaskActiveStep / isTaskIn', () => {
  it('按 issueLabels 的 id 匹配 StageLabels 得 activeStep', () => {
    const task = {
      issueLabels: [{ id: 7, name: 'stage: wip' }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    expect(getTaskActiveStep(task)).toBe(3)
  })

  it('isTaskIn 按 issueStage 字段（"stage: xxx" 串）判定任务所在阶段', () => {
    const task = {
      issueStage: 'stage: wip',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    expect(isTaskIn(task, ['wip'])).toBeTruthy()
    expect(isTaskIn(task, ['solved'])).toBeFalsy()
  })
})
