import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '终端',
  description:
    '终端命令执行结果：展示命令、退出码、标准输出/错误与耗时，ANSI 配色、可折叠、可复制。',
  key: 'cx-vtu-terminal',
  icon: 'i-tabler-terminal-2',
  component,
  props: {
    command: {
      name: '命令',
      type: 'short',
      initial: 'pnpm install',
    },
    exitCode: {
      name: '退出码',
      type: 'number',
      initial: 0,
    },
    stdout: {
      name: '标准输出',
      type: 'textarea',
      initial: 'added 42 packages in 2s',
    },
    stderr: {
      name: '标准错误',
      type: 'textarea',
      initial: '',
    },
    durationMs: {
      name: '耗时（毫秒）',
      type: 'number',
      initial: 2150,
    },
    cwd: {
      name: '工作目录',
      type: 'short',
      initial: '~/tool-ui-vue',
    },
    truncated: {
      name: '已截断',
      type: 'switch',
      initial: false,
    },
  },
})
