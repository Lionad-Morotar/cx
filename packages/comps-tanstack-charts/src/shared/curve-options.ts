/**
 * curve select 的 options 在 line/area 两个预设间共享：
 * 抽常量防双侧漂移——选项值集须与翻译层 CURVE_FACTORIES 枚举保持一致，
 * 一致性由 presets 测试的「curve select 值集与翻译层曲线枚举一致」锁定。
 */
export const CURVE_SELECT_OPTIONS = [
  { label: '单调平滑', value: 'monotoneX' },
  { label: '直线', value: 'linear' },
  { label: '阶梯', value: 'step' },
  { label: '先横后纵', value: 'stepAfter' },
  { label: '先纵后横', value: 'stepBefore' },
  { label: 'B 样条', value: 'basis' },
  { label: '自然样条', value: 'natural' },
]
