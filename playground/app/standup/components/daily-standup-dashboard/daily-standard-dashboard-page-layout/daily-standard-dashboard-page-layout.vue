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

<style lang="scss">
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
</style>
