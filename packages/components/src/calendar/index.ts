import { normalize } from '@lionad/cx-definition'
import component from './src/ui/index.vue'

export default normalize({
  name: '日历',
  description: '日历组件，有多种视图样式，可以显示日、周、月、年多种视图',
  icon: 'i-ant-design-calendar-outlined',
  key: 'cx-calendar',
  component,
  props: {
    // headerDateFormat: {
    //   name: ('日历头格式'),
    //   description: ('例如，2024年10月'),
    //   type: 'select',
    //   initial: 'auto',
    //   options: [
    //     {
    //       label: '默认',
    //       value: 'auto',
    //     },
    //     {
    //       label: '2024年10月24日',
    //       value: 'YYYY年MM月DD日',
    //     },
    //     {
    //       label: '2024年10月',
    //       value: 'YYYY年MM月',
    //     },
    //     {
    //       label: '10月24日',
    //       value: 'MM月DD日',
    //     },
    //     {
    //       label: '10月',
    //       value: 'MM月',
    //     },
    //     {
    //       label: '24日',
    //       value: 'DD日',
    //     },
    //     {
    //       label: '2024年',
    //       value: 'YYYY年',
    //     },
    //     {
    //       label: '自定义',
    //       value: 'custom',
    //     },
    //   ],
    // },
    // headerDateFormatCustom: {
    //   name: ('自定义头格式'),
    //   hidden: ({ data }) => data?.headerDateFormat !== 'custom',
    //   type: 'string',
    //   initial: 'YYYY/MM/DD',
    // },
    // cellDateFormat: {
    //   name: ('单元格格式'),
    //   description: ('例如，2024-10-24'),
    //   type: 'select',
    //   initial: 'auto',
    //   options: [
    //     {
    //       label: '默认',
    //       value: 'auto',
    //     },
    //     {
    //       label: '2024年10月24日',
    //       value: 'YYYY年MM月DD日',
    //     },
    //     {
    //       label: '2024年10月',
    //       value: 'YYYY年MM月',
    //     },
    //     {
    //       label: '10月24日',
    //       value: 'MM月DD日',
    //     },
    //     {
    //       label: '10月',
    //       value: 'MM月',
    //     },
    //     {
    //       label: '24日',
    //       value: 'DD日',
    //     },
    //     {
    //       label: '2024年',
    //       value: 'YYYY年',
    //     },
    //     {
    //       label: '自定义',
    //       value: 'custom',
    //     },
    //   ],
    // },
    // cellDateFormatCustom: {
    //   name: ('自定义单元格格式'),
    //   hidden: ({ data }) => data?.cellDateFormat !== 'custom',
    //   type: 'string',
    //   initial: 'DD',
    // },
    // uiCellType: {
    //   name: ('单元格样式'),
    //   description: ('日历单元格样式'),
    //   type: 'select',
    //   initial: 'circle',
    //   options: [
    //     {
    //       label: '圆形',
    //       value: 'circle',
    //     },
    //     {
    //       label: '方形填充',
    //       value: 'rectangle',
    //     },
    //   ],
    // },
    // enableSelect: {
    //   name: ('启用鼠标交互'),
    //   description: ('启用交互后，可以选择日期，以便查看其他月份'),
    //   type: 'switch',
    //   initial: false,
    // },
    // uiEnableSwitch: {
    //   name: ('显示漫游切换按钮'),
    //   description: ('启用后，在右上角显示“向前”和“向后”漫游的按钮'),
    //   hidden: ({ data }) => !data?.enableSelect,
    //   type: 'switch',
    //   initial: false,
    // },
    // viewType: {
    //   name: ('视图类型'),
    //   description: ('日周月年'),
    //   disabled: true,
    //   type: 'select',
    //   initial: 'compact',
    //   options: [
    //     // * 经典当月视图，没有插槽
    //     {
    //       label: '经典月视图',
    //       value: 'compact',
    //     },
    //     // * 因为插槽还没法在编辑器上使用，所以先注释掉以前三种配置情况
    //     // * 当日视图，几乎和卡片组件一样
    //     // {
    //     //   label: '日',
    //     //   value: 'day',
    //     // },
    //     // * 周视图，有七个插槽
    //     // {
    //     //   label: '周',
    //     //   value: 'week',
    //     // },
    //     // * 月视图，每个日期都能插入组件之类的
    //     // {
    //     //   label: '月',
    //     //   value: 'month',
    //     // },
    //   ],
    // },
  },
  // slots: {
  //   header: {
  //     name: 'header',
  //   },
  //   content: {
  //     name: 'content inside',
  //   },
  // },
})
