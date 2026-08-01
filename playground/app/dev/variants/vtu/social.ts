import type { VariantRegistry } from '../../variants-utils'

// Social 分类 variants：approval-card / citation / contact-card /
// instagram-post / linkedin-post / link-preview / message-draft / x-post。
// 目标：让每件物料模板有视觉呈现的属性在组间得到对照展示。

export const socialVariants: VariantRegistry = {
  'cx-vtu-x-post': [
    {
      // 完整形态：作者认证标 + 媒体 + 链接预览 + 引用帖 + 全互动状态
      label: '完整贴文 · 媒体引用互动',
      data: {
        post: {
          id: 'x-full',
          author: { name: 'Lionad', handle: '@lionad', avatarUrl: 'https://picsum.photos/seed/x-lionad/80', verified: true },
          text: 'Schema 驱动的渲染管线把 LLM 输出直接映射为可交互组件。#低代码 #Vue',
          media: { type: 'image', url: 'https://picsum.photos/seed/x-media/640/360', alt: '配图', aspectRatio: '16:9' },
          linkPreview: { url: 'https://github.com/Lionad-Morotar/cx', title: 'cx', description: 'Schema 驱动的 Vue 组件渲染系统', imageUrl: 'https://picsum.photos/seed/x-preview/480/270', domain: 'github.com' },
          quotedPost: { id: 'x-quote', author: { name: 'Morotar', handle: '@morotar', avatarUrl: 'https://picsum.photos/seed/x-morotar/80' }, text: '流式增量渲染的截断帧必须落在闭合事件处。' },
          stats: { likes: 128, isLiked: true, isReposted: false, isBookmarked: true },
          createdAt: '2026-08-01T18:30:00+08:00',
        },
      },
    },
    {
      // 纯文本最小集：未认证作者、无媒体、仅计数
      label: '纯文本 · 未互动',
      data: {
        post: {
          id: 'x-text',
          author: { name: '匿名用户', handle: '@anon', avatarUrl: 'https://picsum.photos/seed/x-anon/80', verified: false },
          text: '一段没有配图、没有引用、也没有被点赞的纯文本贴文，用于对照完整形态的复杂度。',
          stats: { likes: 3, isLiked: false },
        },
      },
    },
  ],
  'cx-vtu-instagram-post': [
    {
      // 单图 + 已点赞 + 创建时间
      label: '单图 · 已点赞',
      data: {
        post: {
          id: 'ig-single',
          author: { name: 'cx.design', handle: 'cx.design', avatarUrl: 'https://picsum.photos/seed/ig-design/80' },
          text: '单张 16:9 样图展示 #designsystem',
          media: [{ type: 'image', url: 'https://picsum.photos/seed/ig-single/640/360', alt: '样图' }],
          stats: { likes: 256, isLiked: true },
          createdAt: '2026-08-01T12:00:00+08:00',
        },
      },
    },
    {
      // 四宫格决定网格布局 + 未点赞
      label: '四宫格 · 未点赞',
      data: {
        post: {
          id: 'ig-grid',
          author: { name: 'cx.lab', handle: 'cx.lab', avatarUrl: 'https://picsum.photos/seed/ig-lab/80', verified: true },
          text: '四张配图触发 Instagram 网格布局。',
          media: [
            { type: 'image', url: 'https://picsum.photos/seed/ig-1/320/320', alt: '1' },
            { type: 'image', url: 'https://picsum.photos/seed/ig-2/320/320', alt: '2' },
            { type: 'image', url: 'https://picsum.photos/seed/ig-3/320/320', alt: '3' },
            { type: 'image', url: 'https://picsum.photos/seed/ig-4/320/320', alt: '4' },
          ],
          stats: { likes: 1024, isLiked: false },
        },
      },
    },
  ],
  'cx-vtu-linkedin-post': [
    {
      // 长文 + 作者头衔 + 链接预览 + 统计
      label: '长文 · 链接预览',
      data: {
        post: {
          id: 'li-article',
          author: { name: '林纳德', handle: 'lionad-morotar', avatarUrl: 'https://picsum.photos/seed/li-lionad/80', headline: '前端工程师 @ cx' },
          text: '把 LLM 输出直接渲染为 Vue 组件，需要解决流式闭合、标量主体与模板插槽三者的协同。',
          linkPreview: { url: 'https://juejin.cn/post/cx', title: 'Schema 驱动渲染实践', description: '从 JSON 到运行时组件的完整链路', imageUrl: 'https://picsum.photos/seed/li-preview/480/270', domain: 'juejin.cn' },
          stats: { likes: 64, isLiked: true },
          createdAt: '2026-07-30T09:00:00+08:00',
        },
      },
    },
    {
      // 媒体动态：无 handle、无链接预览
      label: '媒体动态 · 无头衔',
      data: {
        post: {
          id: 'li-media',
          author: { name: '产品团队', avatarUrl: 'https://picsum.photos/seed/li-pm/80' },
          text: '新功能上线：支持 LinkedIn 风格的媒体动态展示。',
          media: { type: 'image', url: 'https://picsum.photos/seed/li-media/640/360', alt: '上线配图' },
        },
      },
    },
  ],
  'cx-vtu-message-draft': [
    {
      // 邮件分支：收件人/抄送/密送/发件人全铺
      label: '邮件草稿 · 全字段',
      data: {
        channel: 'email',
        subject: '关于下周同步会的议程',
        body: '各位好，\n\n请查收本周同步会议题，并提前在文档中补充各自进度。',
        from: 'lionad@example.com',
        to: ['team@example.com', 'pm@example.com'],
        cc: ['boss@example.com'],
        bcc: ['archive@example.com'],
      },
    },
    {
      // Slack 分支：公开频道 + 成员数
      label: 'Slack 草稿 · 频道',
      data: {
        channel: 'slack',
        body: '@channel 今天 15:00 的 demo 请提前五分钟上线。',
        target: { type: 'channel', name: 'cx-dev', memberCount: 128 },
      },
    },
  ],
  'cx-vtu-citation': [
    {
      // 文章类型：全字段铺满，图标为 article
      label: '文章引用 · 全字段',
      data: {
        href: 'https://example.com/article',
        title: 'Schema 驱动组件渲染的设计原则',
        snippet: '从低代码定义到运行时渲染，需要保证数据闭合点与视觉呈现一一对应。',
        domain: 'example.com',
        favicon: 'https://picsum.photos/seed/cite-favicon/32/32',
        author: 'Lionad',
        publishedAt: '2026-07-28T10:00:00+08:00',
        type: 'article',
      },
    },
    {
      // API 类型：无作者与日期，图标为 api
      label: 'API 文档 · 精简',
      data: {
        href: 'https://api.example.com/docs',
        title: 'VTU Components API',
        snippet: 'RESTful 接口规范与响应示例。',
        domain: 'api.example.com',
        type: 'api',
      },
    },
  ],
  'cx-vtu-contact-card': [
    {
      // 邮箱：可复制 + 描述
      label: '邮箱 · 可复制',
      data: { kind: 'email', value: 'hi@lionad.dev', label: '工作邮箱', description: '工作日 9-18 点回复', copyable: true },
    },
    {
      // 电话：可跳转 + 不可复制
      label: '电话 · 可跳转',
      data: { kind: 'phone', value: '+86 185 7915 7140', label: '客服热线', href: 'tel:+8618579157140', copyable: false },
    },
  ],
  'cx-vtu-link-preview': [
    {
      // 16:9 封面 + cover 裁剪
      label: '16:9 · cover',
      data: {
        href: 'https://example.com/page',
        title: '封面大图预览',
        description: '使用 16:9 比例与 cover 填充的链接卡片。',
        image: 'https://picsum.photos/seed/lp-wide/640/360',
        domain: 'example.com',
        favicon: 'https://picsum.photos/seed/lp-favicon/32/32',
        ratio: '16:9',
        fit: 'cover',
      },
    },
    {
      // 1:1 缩略 + contain 完整显示
      label: '1:1 · contain',
      data: {
        href: 'https://example.com/square',
        title: '方形缩略预览',
        description: '使用 1:1 比例与 contain 完整显示的链接卡片。',
        image: 'https://picsum.photos/seed/lp-square/400/400',
        domain: 'example.com',
        ratio: '1:1',
        fit: 'contain',
      },
    },
  ],
  'cx-vtu-approval-card': [
    {
      // 默认变体 + 元数据 + 自定义按钮文案
      label: '默认 · 带元数据',
      data: {
        title: '确认发布到生产环境？',
        description: '此操作将把 v1.2.0 发布到生产集群，请再次确认。',
        icon: 'i-tabler-rocket',
        variant: 'default',
        confirmLabel: '确认发布',
        cancelLabel: '取消',
        metadata: [
          { key: '环境', value: 'production' },
          { key: '版本', value: 'v1.2.0' },
        ],
      },
    },
    {
      // 破坏性变体：不同文案、无元数据
      label: '破坏性 · 确认删除',
      data: {
        title: '删除该条消息？',
        description: '删除后无法恢复，相关引用将失效。',
        icon: 'i-tabler-trash',
        variant: 'destructive',
        confirmLabel: '删除',
        cancelLabel: '再想想',
      },
    },
  ],
}
