import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会卡片：展示单次站会的日期、时间与状态，点击跳转对应看板。
 * standup / group / idx 由 card-list 经 StandupItemKey 注入（schema 静态，数据动态）。
 */
export default define({
  name: translate('站会卡片'),
  description: translate('展示单次站会的日期、时间与状态，数据由卡片上下文注入，点击跳转看板'),
  key: 'cx-standup-card',
  component,
  async: true,
  props: {
    viewType: {
      name: translate('展示形态'),
      type: 'string',
      default: 'card',
    },
  },
})
