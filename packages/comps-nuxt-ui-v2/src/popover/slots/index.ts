import z from 'zod'

export const binds = {
  open: {
    name: '打开',
    description: '打开面板',
    schema: z.instanceof(Function),
  },
  close: {
    name: '关闭',
    description: '关闭面板',
    schema: z.instanceof(Function),
  },
}
