<template>
  <define-single-calendar-template
    v-slot="{ value, range, viewType, sourceViewType, enableSelect }"
    name="DefineSingleCalendarTemplate"
  >
    <el-calendar
      ref="comp"
      :model-value="value"
      :class="[ns.b(), ns.is(id), ns.is(viewType), ns.is(sourceViewType)]"
      :range="range"
    >
      <template #header>
        <div :class="ns.e('header')">
          <span :class="ns.e('title')">{{
            getFormattedCalendarHeader(value, sourceViewType)
          }}</span>
        </div>
      </template>
      <template #date-cell="{ data }">
        <div
          :class="[
            ns.e('data-cell'),
            ns.is(viewType),
            ns.is(Time(data.day).format('YYYY-MM-DD')),
            ns.is(`weekday-${Number(Time(data.day).weekday()) + 1}`),
            ns.is('disabled', checkIsDisabled(data.day)),
          ]"
          @click="(e) => onDataCellSelect(e, enableSelect, data)"
        >
          <slot name="date-cell-start" v-bind="data" />

          <!-- 单元格内容 -->
          <template v-if="viewType === 'compact'">
            <p
              :class="[
                data.isSelected ? 'is-selected' : '',
                Time(data.date).isSame(Time(), 'day') ? 'is-today' : '',
              ]"
            />
            <div :class="ns.e('date-label')">
              {{ getFormattedCalendarCell(data.date) }}
            </div>
            <slot name="data-cell-content" v-bind="data" />
          </template>
          <template v-else-if="viewType === 'month'">
            <div :class="ns.e('date-label')">
              {{ getFormattedCalendarCell(data.date) }}
            </div>
            <slot name="data-cell-content" v-bind="data" />
          </template>
          <template v-else-if="viewType === 'week'">
            <div :class="ns.e('date-label')">
              {{ getFormattedCalendarCell(data.date) }}
            </div>
            <slot name="data-cell-content" v-bind="data" />
          </template>
          <template v-else-if="viewType === 'day'">
            <slot name="data-cell-content" v-bind="data">
              <span />
            </slot>
          </template>

          <slot name="date-cell-end" v-bind="data" />
        </div>
      </template>
    </el-calendar>
  </define-single-calendar-template>

  <template v-if="!isYearView">
    <reuse-single-calendar-template
      name="reuse-single-calendar-template"
      v-bind="{
        value,
        range,
        viewType,
        sourceViewType: viewType,
        enableSelect: props.enableSelect,
      }"
    />
  </template>
  <div v-else :class="'cx-calendar-year-grid'">
    <reuse-single-calendar-template
      v-for="x in 12"
      :key="getYearRange(x).join('-')"
      name="reuse-single-calendar-template"
      v-bind="{
        value: getCalendarBindValue(x),
        range: getYearRange(x),
        viewType: 'compact',
        sourceViewType: 'year',
        enableSelect: false,
      }"
    />
  </div>

  <teleport v-if="$table" :to="$table">
    <!-- table teleport mark -->
    <slot v-if="showDomExtend" name="content" />
  </teleport>
  <teleport v-if="$bodyContent" :to="$bodyContent">
    <!-- body-content teleport mark -->
    <slot v-if="showDomExtend" name="body-content" />
  </teleport>
</template>

<script setup lang="ts">
import { isBoolean } from 'lodash-es'

import { useVModel, createReusableTemplate } from '@vueuse/core'

import { useSlots, ref, computed, unref, watch, useTemplateRef, onMounted } from 'vue'

import { ElCalendar } from '../../vendor'
import { Time, useCxBEM } from '@lionad/cx-vue'
import { createCxID } from '@lionad/cx-definition'
// 让 Dayjs.weekday() 类型可见：Time 已 extend weekday 插件，此处仅补类型增强
import 'dayjs/plugin/weekday'

import type { Dayjs } from 'dayjs'
import type { MaybeRef } from 'vue'

const [DefineSingleCalendarTemplate, ReuseSingleCalendarTemplate] = createReusableTemplate()

type ViewType = 'day' | 'week' | 'month' | 'year' | 'compact'
type ViewTypeMeter = Omit<ViewType, 'compact'>

const ns = useCxBEM('calendar')
const slots = useSlots()
const emits = defineEmits(['update:modelValue', 'click-day'])
const props = withDefaults(
  defineProps<{
    modelValue: Dayjs
    viewType: ViewType
    customContent?: boolean
    checkDisabled?: (val: string | Dayjs) => boolean
    headerDateFormat?: string
    headerDateFormatCustom?: string
    cellDateFormat?: string
    cellDateFormatCustom?: string
    enableSelect?: boolean
    validSelect?: ((val: string | Dayjs) => boolean) | boolean
  }>(),
  {
    viewType: 'compact',
    customContent: false,
    checkDisabled: () => false,
    headerDateFormat: 'auto',
    headerDateFormatCustom: '',
    cellDateFormat: 'auto',
    cellDateFormatCustom: '',
    enableSelect: false,
    validSelect: true,
  },
)
const id = createCxID()
const value = props.modelValue == null ? ref(Time()) : useVModel(props, 'modelValue', emits)
const viewType = computed(() => props.viewType)

// 格式化为 'YYYY-MM-DD'（原为全局 dayStr；其第二参数 'cn' 为历史死参数，已移除）
const getDayStr = (value: MaybeRef<string | Dayjs>) => Time(unref(value)).format('YYYY-MM-DD')

const getFormattedCalendarHeader = (value: MaybeRef<string | Dayjs>, viewType: ViewType) => {
  const date = unref(value)
  if (props.headerDateFormat !== 'auto') {
    const format =
      props.headerDateFormat === 'custom' ? props.headerDateFormatCustom : props.headerDateFormat
    return Time(date).format(format)
  }
  switch (unref(viewType)) {
    case 'compact':
    case 'day':
      return getDayStr(date)
    case 'week':
      return `${getDayStr(Time(date).startOf('week'))}-${getDayStr(Time(date).endOf('week'))}`
    case 'month':
      return `${getDayStr(Time(date).startOf('month'))}-${getDayStr(Time(date).endOf('month'))}`
    case 'year':
      return Time(date).format('YYYY年MM月')
    default:
      return date
  }
}
const getFormattedCalendarCell = (value: MaybeRef<string | Dayjs | Date>) => {
  if (props.cellDateFormat !== 'auto') {
    const format =
      props.cellDateFormat === 'custom' ? props.cellDateFormatCustom : props.cellDateFormat
    return Time(unref(value)).format(format)
  }
  return Time(unref(value)).format('DD')
}

watch(value, (n) => {
  compRef.value?.pickDay(n)
})

const checkIsDisabled = (day: string) => {
  const ret = props.checkDisabled(day)
  // console.log("[debug] ret checkIsDisabled", ret);
  return ret
}

const range = computed(() => {
  const date = unref(value)
  switch (unref(viewType)) {
    case 'week':
      return [
        Time(date).startOf('week').format('YYYY-MM-DD'),
        Time(date).endOf('week').format('YYYY-MM-DD'),
      ]
    default:
      return undefined
  }
})
const getCalendarBindValue = (x: number) => {
  const startOfYear = Time(unref(value)).startOf('year')
  const offset = x - 1
  const retRange = startOfYear.add(offset, 'month').format('YYYY-MM')
  // console.log('[info] retRange - month', retRange)
  return retRange
}
const getYearRange = (x: number) => {
  const startOfYear = Time(unref(value)).startOf('year')
  const offset = x - 1
  const startDay = startOfYear.add(offset, 'month').startOf('month').startOf('week')
  const endDay = startOfYear.add(offset, 'month').endOf('month').endOf('week')
  const retRange = [
    new Date(Time(startDay).format('YYYY-MM-DD')),
    new Date(Time(endDay).format('YYYY-MM-DD')),
  ]
  // console.log('[info] retRange', x, retRange)
  return retRange
}

const compRef = useTemplateRef('comp')

const _select = (val: Dayjs | string) => {
  if (!val) {
    return false
  }
  if (!props.enableSelect) {
    return false
  }
  const validSelect = isBoolean(props.validSelect)
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (x: any) => props.validSelect
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
      props.validSelect || ((x: any) => true)
  const isValid = (props.validSelect as any)(val)
  console.log('[debug] isValid', isValid, validSelect)
  if (isValid) {
    value.value = Time(val)
  }
}
const onDataCellSelect = (e: MouseEvent, enableSelect: boolean, data: any) => {
  emits('click-day', e, data.day)
  if (enableSelect) {
    _select(data.date)
  }
}

const isYearView = computed(() => {
  return props.viewType === 'year'
})
const showDomExtend = computed(() => {
  return props.viewType !== 'year' && props.customContent
})
const $table = ref<Element | null>(null)
const $bodyContent = ref<Element | null>(null)
const reCalcDOM = () => {
  const query = `.${ns.is(id)} .el-calendar-table`
  const table = document.querySelector(query)
  if (table) {
    // console.log('[info] table', table?.parentElement)
    $table.value = table.parentElement
  }
}
const markEmpty = () => {
  // mark empty table, so that we can do some logic on css
  const $shouldMarks =
    document.querySelectorAll(`.${ns.is(id)} .el-calendar-table:has(tbody:empty)`) || []
  ;[...$shouldMarks].map(($shouldMark) => {
    if ($shouldMark) {
      $shouldMark.classList?.add?.('is-empty')
    }
  })
}
onMounted(() => {
  watch(showDomExtend, reCalcDOM, {
    immediate: true,
  })
  markEmpty()
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('calendar') {
    --el-calendar-cell-width: auto;
    --el-calendar-selected-bg-color: unset;

    display: grid;
    grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);

    @include when('content-only') {
      display: contents;

      .el-calendar__header {
        display: none;
      }
      .el-calendar__body {
        padding: 0;
      }
    }

    // *********************************** basic styles

    .el-calendar__body,
    .el-calendar-table {
      @apply box-border w-full h-full;
    }
    .el-calendar-table {
      display: grid;
      grid-template: minmax(0, 1fr) / minmax(0, 1fr);
      overflow: hidden;

      &:has(thead) {
        grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);
      }

      thead {
        display: grid;
        grid-template: auto / repeat(7, 1fr);
        max-width: 100%;
        @apply text-sm;
      }
      tbody {
        display: grid;
        grid-template: minmax(0, 1fr) / minmax(0, 1fr);
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
        @apply text-sm;
      }
      tbody:has(.el-calendar-table__row:nth-child(1)) {
        grid-template-rows: repeat(1, calc(100% / 1));
      }
      tbody:has(.el-calendar-table__row:nth-child(2)) {
        grid-template-rows: repeat(2, calc(100% / 2));
      }
      tbody:has(.el-calendar-table__row:nth-child(3)) {
        grid-template-rows: repeat(3, calc(100% / 3));
      }
      tbody:has(.el-calendar-table__row:nth-child(4)) {
        grid-template-rows: repeat(4, calc(100% / 4));
      }
      tbody:has(.el-calendar-table__row:nth-child(5)) {
        grid-template-rows: repeat(5, calc(100% / 5));
      }
      tbody:has(.el-calendar-table__row:nth-child(6)) {
        grid-template-rows: repeat(6, calc(100% / 6));
      }
      td {
        @apply flex justify-center items-center;
        @apply w-full border-0;
        height: calc(100% - 1px);
      }
      .el-calendar-day {
        @apply p-0 w-full h-full rounded-sm;
        @apply text-base whitespace-nowrap;
      }

      @include e('data-cell') {
        @apply p-0 w-full h-full;

        @include when('disabled') {
          pointer-events: none;
          color: #ccc;
        }
      }
    }
    .el-calendar-table__row {
      display: grid;
      grid-template: minmax(0, 1fr) / repeat(7, calc(100% / 7));
      @apply w-full;
    }
    @include e('date-label') {
      white-space: nowrap;
      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        Oxygen,
        Ubuntu,
        Cantarell,
        'Open Sans',
        'Helvetica Neue',
        sans-serif;
    }

    // *********************************** styles by views

    @include when('compact') {
      .el-calendar__header {
        @apply box-border py-2 px-4 h-9 leading-9;
        @apply border-b border-neutral-100 dark:border-neutral-900;

        @include e(header) {
          @apply flex justify-center items-center;

          @include e(title) {
            @apply font-medium text-base text-neutral-800 dark:text-neutral-200;
            @apply line-clamp-1 break-all max-w-full;
          }
        }
      }
      .el-calendar__body {
        display: grid;
        grid-auto-rows: max-content;
        @apply p-0 pb-1;
      }
      .el-calendar-table {
        .el-calendar-table__row,
        .el-calendar-table__row td {
          @apply h-8;
        }
        tbody:has(.el-calendar-table__row:nth-child(1)) {
          height: calc(32px * 1);
        }
        tbody:has(.el-calendar-table__row:nth-child(2)) {
          height: calc(32px * 2);
        }
        tbody:has(.el-calendar-table__row:nth-child(3)) {
          height: calc(32px * 3);
        }
        tbody:has(.el-calendar-table__row:nth-child(4)) {
          height: calc(32px * 4);
        }
        tbody:has(.el-calendar-table__row:nth-child(5)) {
          height: calc(32px * 5);
        }
        tbody:has(.el-calendar-table__row:nth-child(6)) {
          height: calc(32px * 6);
        }

        th {
          @apply pt-3 pb-2 px-0;
          @apply font-mono;
        }
        td {
          @apply border-0;

          .el-calendar-day {
            @apply relative flex justify-center items-center;
            @apply p-0 bg-transparent hover:bg-sky-50;
            @apply transition-colors;

            & > * {
              @apply flex justify-center items-center;
              @apply box-border m-0 p-2 w-full h-full rounded;
              @apply transition-opacity hover:opacity-90;
            }
          }
        }
        .is-today {
          .el-calendar-day {
            @apply font-semibold text-sky-400 dark:text-sky-600;
            @apply hover:bg-transparent;
          }
        }
        .is-selected {
          .el-calendar-day {
            @apply text-white dark:text-black;
            @apply bg-sky-400 dark:bg-sky-600;
            @apply hover:bg-sky-400 hover:dark:bg-sky-600;
          }
        }
      }

      @include e('data-cell') {
        display: contents;
        z-index: 1;

        > p {
          z-index: 1;
        }
      }
    }

    @include when('month') {
      border-color: #e2e4e8;

      .el-calendar__header {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        height: 0px;
        visibility: hidden;
      }
      .el-calendar__body {
        padding: 0;
      }
      .el-calendar-table {
        thead > th {
          box-sizing: border-box;
          height: 46px;
        }
        th + th {
          border-left: solid 1px #e2e4e8;
        }
      }
      .el-calendar-table__row {
        & + .el-calendar-table__row {
          & > td {
            border-top: none;
          }
        }
        &:last-child {
          & > td {
            border-bottom: 0;
          }
        }
        & > td {
          display: block;
          box-sizing: border-box;
          border: solid 1px #e2e4e8;

          & + td {
            border-left: none;
          }
          &:first-child {
            border-left: none;
          }
          &:last-child {
            border-right: none;
          }
        }
        .next,
        .prev {
          color: #94a3b8;
          background: #f8fafb;
        }
      }

      .el-calendar-day {
        display: grid;
        grid-template: minmax(0, 1fr) / minmax(0, 1fr);
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      @include e('data-cell') {
        display: grid;
        grid-template: auto minmax(0, 1fr) / minmax(0, 1fr);
        box-sizing: border-box;
        --gap-top: 14px;
        --gap-w: 16px;
        @apply px-2 sm:px-3 md:px-3 lg:px-4 xl:px-5;
        @apply pt-2 sm:pt-3 md:pt-3 lg:pt-4 xl:pt-4;
      }
      @include e('table-data-cell') {
        width: 100%;
      }
    }

    @include when('year') {
      &.is-compact {
        .el-calendar-table__row {
          .is-selected {
            .el-calendar-day {
              background: unset;
              color: unset;
            }
          }
        }
      }
    }

    @include when('day') {
      .el-calendar-table {
        display: none;
      }
    }

    @include when('week') {
      .el-calendar-table {
        border: solid 1px #e2e4e8;
        border-radius: 4px;

        td {
          border: none;
        }
        th {
          border: none;
          border-bottom: solid 1px #e2e4e8;
        }

        td + td,
        th + th {
          border-left: solid 1px #e2e4e8;
        }
        thead > th {
          box-sizing: border-box;
          height: 40px;
          line-height: 40px;
          padding: 0;
        }
      }
      .el-calendar-table + .el-calendar-table {
        display: none;
      }
      .el-calendar-day {
        box-sizing: border-box;
        border: none;
        @apply px-1 sm:px-2 md:px-2 lg:px-3 xl:px-3;
        @apply py-1 sm:py-2 md:py-3 lg:py-3 xl:py-4;
      }
    }
  }

  .cx-calendar-year-grid {
    display: grid;
    grid-template: repeat(3, min-content) / repeat(4, minmax(min-content, 1fr));
    height: min-content;
    min-height: 100%;
    @apply gap-1 sm:gap-2 md:gap-3 lg:gap-4 xl:gap-5;
  }
}
</style>
