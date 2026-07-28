import type { CxComponentStyle, CxComponentMetaProps, CxEvent, CxMetaBase } from '../index'

// 资产包（业务意义上的，配合编辑器使用）
export type CxComponentBundle = {
  name: string
  icon: string
  components: {
    name: string
    description: string
    key: string
    icon: string
    disabled: boolean
  }[]
}
export type CxComponentBundles = CxComponentBundle[]

/**
 * @example 'component/<uuid>/props/<prop.key>'
 */
export type CxDataBind = string

export interface CxComponentData extends Record<string, any> {
  // 运行时组件名称（组件昵称）
  _cx_name?: string
  // 运行时组件事件数据
  _cx_events?: CxEvent[]
  // 运行时组件样式
  _cx_style?: CxComponentStyle
  // 数据绑定
  _cx_data_config?: {
    binds: Record<string, CxDataBind>
  }
}

// 组件（运行时数据结构）
export type CxComponentRuntime = MakeNet<{
  id: string
  name: string
  // 对应Vue组件的名称
  key: string
  // 组件 key 的别名，用于将旧组件迁移到新组件
  aliasKeys?: string[]
  // 模块的数据（绑定到右侧表单，同时用于自身展示）
  data: CxComponentData
  // 模块的动态表单的配置信息
  props: CxComponentMetaProps
  // 模块事件触发
  emits: Record<string, unknown>
  // 模块事件接收
  exposes: Record<string, unknown>
  // 组件元信息
  _cx_meta?: CxMetaBase
  // 组件的父组件ID，要获取父组件实例可以使用 cx.utils.getParent，
  // 但是目前没有实现对多个父组件的支持，所以也就第一个父元素有用
  parents: string[]
  // 组件排序，其实 components 里的数据结构是数组，有序的，
  // 但要保存到数据库的话必然需要排序字段，算是用于辅助结构化数据的运行时数据,
  // 实际内容是 decimal
  sortn?: string
}>

// 辅助递归
type MakeNet<Recur> = Recur & {
  // 模块插槽
  slots?:
    | Record<
        string,
        {
          name: string
          description?: string
        }
      >
    | ((comp: Recur) => Record<string, any>)
    | null
  // 子模块数据，
  // 有些模块如文本、详情模块没有子模块数据，
  // 其它如标签页模块有子模块数据，
  // 可以是插槽名到子组件的映射，或者是自动排列的二维数组
  components?: Record<string, Recur[]> | null
}

// 组件宽松运行时数据结构，便于 h 函数调用，
// 以后会兼容字符串类型，id 直接由 cx-render-component 内部自动生成，
// 这样调用最简单
export type CxComponentLoose = MakeNet<
  Partial<CxComponentRuntime> & {
    id: string
    key: string
  }
>

// 组件的持久化数据结构，
// props 在运行时动态挂载，所以不需要保存
export type CxComponentStructured = Pick<
  CxComponentRuntime,
  'id' | 'name' | 'data' | 'key' | 'parents' | 'sortn'
>
