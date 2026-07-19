// 列表项的数据
export type Content = {
  id: string
  content: string
  checked?: boolean
  // mention 应该存放在 content 里面，但是为了方便，
  // 以及以后本来就需要增加一个单独维护的 mention 条目，
  // 就直接设计放在 content 外面，默认 mention 插入 content 的头部
  mention?: Mention[]
}
export type Mention = {
  // @的类型，可以是任务列表的任务、或项目用户、或没有链接文本
  type: 'issue' | 'user' | 'text'
  id: string
  text: string
}
