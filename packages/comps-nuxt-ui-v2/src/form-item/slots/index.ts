import z from 'zod'

export const binds = {
  error: {
    name: '错误',
    description: '表单项校验产生的错误信息',
    schema: z.string(),
  },
  label: {
    name: '标题',
    description: '表单项的标题',
    schema: z.string(),
  },
  name: {
    name: '名称',
    description: '表单项绑定的数据的字段名',
    schema: z.string(),
  },
  hint: {
    name: '提示',
    description: '表单项右上角的提示信息',
    schema: z.string(),
  },
  description: {
    name: '描述',
    description: '表单项标题下的描述信息',
    schema: z.string(),
  },
  help: {
    name: '帮助',
    description: '表单项下方的帮助信息',
    schema: z.string(),
  },
}
