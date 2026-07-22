<script lang="ts">
import { renderSlot, defineComponent, useSlots, h } from 'vue'
import { CxPageMain } from '../..'
import { useStandupType } from '../../../states/standups'

const definedSlots = [
  'page-header-center',
  'page-header-right',
  'page-main-section',
  'page-aside-section',
  'page-right-section',
]

export default defineComponent({
  setup() {
    const runtimeSlots = useSlots()

    useStandupType('week')

    return () =>
      h(
        CxPageMain,
        {
          class: 'weekly-standup-dashboard-page',
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
.weekly-standup-dashboard-page {
  --shrink--gap: 0px;
  --shrink--todo: 0px;

  position: relative;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr) calc(430px - var(--shrink--todo, 0px)) calc(
      80px - var(--shrink--gap, 0px)
    );
  grid-template-areas: 'boards todo users';
  gap: calc(36px - var(--shrink--gap, 0px));

  /* 小屏收缩由 --shrink 变量分档处理 */
  @media (max-width: 1688px) {
    --shrink--gap: 4px;
    --shrink--todo: 40px;
  }
  @media (max-width: 1440px) {
    --shrink--gap: 6px;
    --shrink--todo: 60px;
  }
  @media (max-width: 1366px) {
    --shrink--gap: 9px;
    --shrink--todo: 90px;
  }
  @media (max-width: 1280px) {
    --shrink--gap: 12px;
    --shrink--todo: 120px;
  }
  @media (max-width: 1180px) {
    --shrink--gap: 14px;
    --shrink--todo: 140px;
  }
  @media (max-width: 1024px) {
    --shrink--gap: 16px;
    --shrink--todo: 160px;
  }

  .page-header-center {
    position: absolute;
    left: 50%;
    top: 22px;
    transform: translateX(-52%);
    z-index: 9;
  }
  .page-header-right {
    position: absolute;
    top: 21px;
    right: 24px;
    z-index: 9;
  }
  .page-right-section {
    grid-area: users;
  }
  .page-aside-section {
    grid-area: todo;
  }
  .page-main-section {
    grid-area: boards;
  }
}

/* 区域级补充样式：原胖容器 standard-dashboard-page 承载的全局样式，
   胖容器 schema 化删除后迁入此 layout 物料（与上方 grid 模板互补），保证视觉零回归 */
.weekly-standup-dashboard-page {
  box-sizing: border-box;
  padding: 21px 24px 26px;

  .page-header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .page-header-right {
    user-select: none;
  }
  .page-main-section {
    display: grid;
    grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  }
  .page-aside-section {
    margin-top: 54px;
  }
  .page-right-section {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 54px;
  }
}
</style>
