<script lang="ts">
import { renderSlot, defineComponent, useSlots, h } from 'vue'
import { CxPageMain } from '../..'
import { useStandupType } from '../../../states/standups'

const definedSlots = [
  'page-header',
  'page-header-right',
  'page-content-left',
  'page-content-main',
  'page-content-right',
]

export default defineComponent({
  setup() {
    const runtimeSlots = useSlots()

    useStandupType('day')

    return () =>
      h(
        CxPageMain,
        {
          class: 'daily-standup-dashboard-page',
        },
        definedSlots.map((c) => {
          return h('div', { class: [c, 'standup-slot'] }, [
            renderSlot(runtimeSlots, `${c}-start`),
            renderSlot(runtimeSlots, c),
            renderSlot(runtimeSlots, `${c}-end`),
          ])
        }),
      )
  },
})
</script>

<style>
/* -------------------------------------------------------------------------- */
/*                               page structure                               */
/* -------------------------------------------------------------------------- */
.daily-standup-dashboard-page {
  --shrink--inline: 0px;

  position: relative;
  display: grid;
  grid-template-rows: 70px minmax(0, 1fr);
  grid-template-columns: auto minmax(min-content, max-content) minmax(0, 1fr) auto;
  grid-template-areas:
    'header header header header'
    'left main main right';

  .page-header {
    grid-area: header;
  }
  .page-header-right {
    position: absolute;
    top: 16px;
    right: 16px;
  }
  .page-content-left {
    grid-area: left;
  }

  .page-content-main {
    grid-area: main;
  }

  .page-content-right {
    grid-area: right;
  }
}

/* -------------------------------------------------------------------------- */
/*                                normal styles                               */
/* -------------------------------------------------------------------------- */
.daily-standup-dashboard-page {
  box-sizing: border-box;
  padding: 0 20px 34px 20px;
}

/* 区域级补充样式：原胖容器 standard-dashboard-page 承载的全局样式，
   胖容器 schema 化删除后迁入此 layout 物料（与上方 grid 模板互补），保证视觉零回归 */
.daily-standup-dashboard-page {
  .page-header {
    user-select: none;
  }
  .page-content-left {
    box-sizing: border-box;
    height: 94%;
  }
  .page-content-right {
    .user-select {
      width: 94px;
    }
  }
}

/* 代办看板"切换编辑类型"按钮：原胖容器全局样式，被 daily-main-content 引用 */
.switch-edit-type {
  border: solid 1px var(--color, currentColor);
  border-radius: 150%;
  padding: 4px;
  transform: scale(0.6);
  opacity: 0;
}
</style>
