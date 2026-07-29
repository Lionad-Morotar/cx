# el-calendar vendor

从 [element-plus@2.14.3](https://github.com/element-plus/element-plus/tree/2.14.3/packages/comps/calendar/src) 内化的 calendar 组件，使 `cx-calendar` 彻底脱离 element-plus 依赖。

## 为什么 vendor

`cx-calendar` 重度依赖 el-calendar 的 DOM 类名（`.el-calendar-table` / `.el-calendar-day` / `.el-calendar-table__row` 等，340+ 行 SCSS 覆盖）、`#date-cell` slot 的 `data` 结构、`pickDay` 实例方法。重写成本高、回归风险大；vendor 后 DOM 结构与 API 逐字不变，SCSS 与上层模板零改动，仅把对 element-plus 的依赖换成本地实现。

## 目录

```
vendor/
├── el-calendar/     # 原样 vendor 的 el-calendar 业务文件（仅 import 路径本地化）
│   ├── calendar.vue / calendar.ts        # 主组件 + props/emits
│   ├── use-calendar.ts                   # pickDay/selectDate/date 核心逻辑
│   ├── date-table.vue / date-table.ts / use-date-table.ts  # 日期表格
│   ├── select-controller.vue / .ts       # 选择器版控制器（cx-calendar 用 #header slot，永不渲染）
│   └── instance.ts                       # 类型占位
├── shims/           # el-plus 内部模块的最小本地桥接
│   ├── hooks.ts        # useNamespace(namespace 固定 'el') + useLocale(固定 zh-cn)
│   ├── utils.ts        # buildProps/definePropType/isArray/isDate/isObject/isString/isFunction/debugWarn
│   ├── constants.ts    # INPUT_EVENT/UPDATE_MODEL_EVENT/WEEK_DAYS
│   ├── time-picker.ts  # DEFAULT_FORMATS_DATE/rangeArr
│   ├── locale.ts       # zh-cn datepicker 词条
│   ├── button.ts       # ElButton/ElButtonGroup 占位（永不渲染）
│   └── select.ts       # ElSelect 占位（select-controller 用，永不渲染）
└── index.ts         # 出口：导出 ElCalendar
```

## 改动约束

- `el-calendar/` 下文件逻辑与上游一致，仅把 `@element-plus/*` 改为 `../shims/*`，`vue`/`dayjs` 保持原样。
- DOM 类名、`#date-cell` 的 `data`（`{ isSelected, type, day, date }`）、`pickDay` 实例方法三者不可变 —— 它们是 `index.vue` 与 SCSS 的契约。
- 本目录不参与 lint/fmt（见根 `vite.config.ts` 的 ignore）。

## 升级

如需同步上游修复，按 `2.14.3` tag 重新下载 `packages/comps/calendar/src` 覆盖 `el-calendar/`，并重新本地化 import 路径；shims 视新依赖按需补齐。
