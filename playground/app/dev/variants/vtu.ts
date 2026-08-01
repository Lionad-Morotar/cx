import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-vtu 物料手写 variants：vtu 工具组件数据形态差异大，
// 选 code-block（语言对照）/ stats-display（指标组对照）/ chart 等多形态样板。
// article 为全属性展示样板：组件模板有视觉呈现的 13 个属性（type/content/
// title/description/author/coverImage/tags/rate/createdAt/source/readingTime/
// wordCount/maxHeight/headerPattern）逐组对照；schema 已声明但模板未渲染的
// updatedAt/role/receipt/locale 不放（无视觉差异）。

// 长文折叠样板的正文：八段确保撑出 maxHeight 限高，触发展开/收起交互
const longContent = [
  '## 流式渲染的体感问题',
  '',
  '大段正文在 LLM 流式输出期间，用户面对的是一个长时间空白的卡片。',
  '属性级切分把「完成」的定义从整段 JSON 闭合提前到单个属性闭合：',
  '标题闭合即见标题，标签逐项揭示，正文以骨架示意生长。',
  '',
  '## 截断帧的纯净性',
  '',
  '截断点永远落在闭合事件处，帧内每个值都是完整传输的真实前缀——',
  '不依赖修复器补全半个字符串，也就不会出现一闪而过的错误半值。',
  '',
  '## 骨架与节流',
  '',
  '正文这类长字段以骨架占位而非固定帧出半值；短属性扎堆闭合时按窗口合并出帧。',
  '末尾等不到窗口的属性由围栏闭合后的终态兜底，任何字段都不会丢失。',
  '',
  '> 折叠区之外的内容经展开按钮揭示。',
].join('\n')

export const vtuVariants: VariantRegistry = {
  'cx-vtu-article': [
    {
      // 全要素：header 五项 + 封面 + footer 三项 + 花纹 dots 一次铺满
      label: '完整信息卡 · 花纹 dots',
      data: {
        type: 'md',
        title: 'Schema 驱动的组件渲染',
        description: '从低代码组件定义到运行时渲染的完整链路',
        author: { name: 'Lionad', avatarUrl: 'https://picsum.photos/seed/cx-author/64/64' },
        coverImage: 'https://picsum.photos/seed/cx-article/640/320',
        tags: ['vue', 'low-code', 'streaming'],
        rate: 4.5,
        createdAt: '2026-07-28T09:30:00+08:00',
        source: 'https://github.com/Lionad-Morotar/cx',
        readingTime: 6,
        wordCount: 2380,
        headerPattern: 'dots',
        content:
          '## 概述\n\n物料把工具调用结果渲染为**自包含**组件。\n\n- 属性闭合即切分点\n- 截断帧不经修复器伪造\n\n> 流式期间正文以骨架占位。',
      },
    },
    {
      // type 对照：html 正文经 v-html 直渲
      label: 'HTML 正文',
      data: {
        type: 'html',
        title: '发布说明',
        tags: ['release'],
        content:
          '<p>本版本包含 <strong>流式增量渲染</strong> 与以下改进：</p><ul><li>标量主体形态切分</li><li>正文骨架占位</li></ul>',
      },
    },
    {
      // maxHeight 限高 + expand-button 交互；footer 时长与字数同上呈现
      label: '长文折叠 · maxHeight',
      data: {
        type: 'md',
        title: '流式增量渲染笔记',
        maxHeight: '180px',
        readingTime: 12,
        wordCount: 5120,
        content: longContent,
      },
    },
    {
      // 花纹对照 + 作者无头像（首字母圆形回退）；无封面、无 footer
      label: '花纹 diagonal · 首字母头像',
      data: {
        type: 'md',
        title: '触发器 DSL 设计',
        description: '声明式流式切分的三种形态',
        author: { name: 'Morotar' },
        tags: ['dsl', 'design'],
        headerPattern: 'diagonal',
        content: '数组形态按容器边界切分，区域形态按 slot 揭示，标量主体形态按属性闭合切分。',
      },
    },
    {
      // 契约最小集：仅 type+content；initial 的 title/description/author/
      // tags/readingTime 以 undefined 覆盖，展示无 header/footer 的裸卡片守卫
      label: '极简正文（契约最小集）',
      data: {
        type: 'md',
        title: undefined,
        description: undefined,
        author: undefined,
        tags: undefined,
        readingTime: undefined,
        content: '正文即全部。',
      },
    },
  ],
  'cx-vtu-code-block': [
    { label: 'TypeScript', data: { language: 'typescript', code: 'const n: number = 42\nconsole.log(n)', filename: 'num.ts' } },
    { label: 'Python', data: { language: 'python', code: 'def greet(name: str) -> str:\n    return f"Hello, {name}"', filename: 'greet.py' } },
    { label: 'JSON', data: { language: 'json', code: '{\n  "ok": true,\n  "count": 3\n}', filename: 'data.json' } },
  ],
  'cx-vtu-stats-display': [
    {
      label: '双指标',
      data: {
        title: '概览',
        stats: [
          { key: 'users', label: '用户', value: 1200, format: { kind: 'number' } },
          { key: 'sessions', label: '会话', value: 340, format: { kind: 'number' } },
        ],
      },
    },
    {
      label: '带环比',
      data: {
        title: '营收',
        stats: [
          {
            key: 'revenue',
            label: '营收',
            value: 12800,
            format: { kind: 'currency', currency: 'CNY' },
            diff: { value: 12.5 },
          },
        ],
      },
    },
  ],
  'cx-vtu-terminal': [
    { label: '安装成功', data: { command: 'pnpm install', exitCode: 0, stdout: 'added 42 packages in 2s', stderr: '' } },
    { label: '构建失败', data: { command: 'pnpm build', exitCode: 1, stdout: '', stderr: '✗ build failed: missing dep' } },
  ],
}
