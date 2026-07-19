export const getAllMetrics = () => [
  {
    key: 'total-issue-count',
    name: '总任务数',
    icon: 'total-issue-count-2',
    value: 0,
  },
  {
    key: 'done-count',
    name: '完成任务数',
    icon: 'done-count',
    value: 0,
  },
  {
    key: 'effort-point',
    name: '总点数',
    icon: 'effort-point',
    value: 0,
  },
  {
    key: 'new-issue-count',
    name: '新任务数',
    icon: 'new-issue-count',
    value: 0,
  },
  {
    key: 'in-design',
    name: '设计中',
    icon: 'in-design',
    value: 0,
  },
  {
    key: 'in-dev',
    name: '开发中',
    icon: 'in-dev',
    value: 0,
  },
  {
    key: 'in-test',
    name: '测试中',
    icon: 'in-test-2',
    value: 0,
  },
  {
    key: 'in-due-date',
    name: '延期中',
    /* cspell:disable-next-line */
    icon: 'due-date-count',
    value: 0,
  },
  {
    key: 'check-count',
    name: '待验收',
    icon: 'check-count',
    value: 0,
  },
  {
    key: 'np-count',
    name: '未通过',
    icon: 'np-count',
    value: 0,
  },
  {
    key: 'pending-count',
    name: '挂起',
    icon: 'pending-count',
    value: 0,
  },
  {
    key: 'average-spend-time',
    name: '平均耗时',
    icon: 'average-spend-time',
    value: '0',
    meter: () => 'm',
  },
  {
    key: 'average-wait-time',
    name: '平均等待时间',
    icon: 'average-wait-time',
    value: '0',
    meter: () => 'm',
  },
]
