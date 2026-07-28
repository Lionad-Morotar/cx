import { define, translate } from '@lionad/cx-definition'
import component from './view-standup-github-grid.vue'

export default define({
  name: translate('站会小网格日历图'),
  description: translate(
    '类似 Gitlab、Github 的贡献日历网格图，可在一定范围时间内展示当日有无站会的情况，并对站会类型做了颜色上的区分',
  ),
  key: 'cx-view-standup-github-grid',
  component,
  async: true,
})
