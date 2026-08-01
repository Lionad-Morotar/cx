import type { VariantRegistry } from '../../variants-utils'

// Media 分类 variants：audio / image / image-gallery / item-carousel / video。
// 单媒体卡对照变体（variant/fit/ratio/autoPlay）与元信息完整度；
// 数组型媒体对照项数、标题显隐与嵌套字段（caption/subtitle/actions）差异。

export const mediaVariants: VariantRegistry = {
  'cx-vtu-audio': [
    {
      // 完整变体：标题、描述、variant=full 同时呈现
      label: '完整播放器 · 有描述',
      data: {
        assetId: 'audio-full',
        src: 'https://example.com/audio/full.mp3',
        title: '林间白噪音',
        description: '60 分钟循环自然环境音，用于专注与放松。',
        variant: 'full',
      },
    },
    {
      // 紧凑变体：宽度收缩后控制条与信息排布
      label: '紧凑播放器 · 仅标题',
      data: {
        assetId: 'audio-compact',
        src: 'https://example.com/audio/compact.mp3',
        title: '短播客片段',
        variant: 'compact',
      },
    },
    {
      // 无标题描述：验证最小信息_fallback
      label: '无元信息 · 仅资源',
      data: {
        assetId: 'audio-bare',
        src: 'https://example.com/audio/bare.mp3',
        variant: 'full',
      },
    },
  ],
  'cx-vtu-image': [
    {
      // 默认比例与封面填充 + 标题
      label: '16:9 · 封面 · 有标题',
      data: {
        assetId: 'image-16-9',
        src: 'https://picsum.photos/seed/cx-image/640/360',
        alt: '示例风景图',
        title: '山川湖海',
        ratio: '16:9',
        fit: 'cover',
      },
    },
    {
      // fit 对照：contain 完整包含，展示黑边/留白差异
      label: '16:9 · 完整包含',
      data: {
        assetId: 'image-contain',
        src: 'https://picsum.photos/seed/cx-contain/640/360',
        alt: '完整包含示例',
        title: '完整包含模式',
        ratio: '16:9',
        fit: 'contain',
      },
    },
    {
      // ratio 对照：1:1 方形
      label: '1:1 · 封面',
      data: {
        assetId: 'image-square',
        src: 'https://picsum.photos/seed/cx-square/400/400',
        alt: '方形示例',
        title: '方形构图',
        ratio: '1:1',
        fit: 'cover',
      },
    },
    {
      // 无标题：验证纯图片形态的最小高度与 alt 回退
      label: '无标题 · 仅图片',
      data: {
        assetId: 'image-no-title',
        src: 'https://picsum.photos/seed/cx-notitle/640/360',
        alt: '无标题示例',
        ratio: '16:9',
        fit: 'cover',
      },
    },
  ],
  'cx-vtu-video': [
    {
      // 默认：poster + title + 16:9 + 手动播放（autoPlay 显式 false）
      label: '16:9 · 封面 · 手动播放',
      data: {
        assetId: 'video-default',
        src: 'https://example.com/video/demo.mp4',
        poster: 'https://picsum.photos/seed/cx-video/640/360',
        title: '产品演示视频',
        ratio: '16:9',
        autoPlay: false,
      },
    },
    {
      // 自动播放开关态对照
      label: '16:9 · 自动播放',
      data: {
        assetId: 'video-autoplay',
        src: 'https://example.com/video/autoplay.mp4',
        poster: 'https://picsum.photos/seed/cx-autoplay/640/360',
        title: '自动播放片段',
        ratio: '16:9',
        autoPlay: true,
      },
    },
    {
      // 比例对照：9:16 竖屏
      label: '9:16 · 竖屏',
      data: {
        assetId: 'video-portrait',
        src: 'https://example.com/video/portrait.mp4',
        poster: 'https://picsum.photos/seed/cx-portrait/360/640',
        title: '竖屏短视频',
        ratio: '9:16',
        autoPlay: false,
      },
    },
  ],
  'cx-vtu-image-gallery': [
    {
      // 双图网格：header 标题呈现
      label: '双图网格 · 有标题',
      data: {
        title: '作品精选',
        images: [
          { id: 'g1', src: 'https://picsum.photos/seed/g1/640/480', alt: '建筑', width: 640, height: 480 },
          { id: 'g2', src: 'https://picsum.photos/seed/g2/640/480', alt: '自然', width: 640, height: 480 },
        ],
      },
    },
    {
      // 单图最小集：验证单张不塌缩，嵌套 title/caption 展示灯箱元信息
      label: '单图 · 嵌套标题与说明',
      data: {
        images: [
          { id: 'g3', src: 'https://picsum.photos/seed/g3/800/600', alt: '单图', width: 800, height: 600, title: '独立作品', caption: '单张作品的标题与说明' },
        ],
      },
    },
    {
      // 四图：项数差异 + 混合 caption/title 嵌套字段
      label: '四图 · 混合标题与说明',
      data: {
        title: '旅行相册',
        images: [
          { id: 'g4', src: 'https://picsum.photos/seed/g4/640/480', alt: '海边', width: 640, height: 480 },
          { id: 'g5', src: 'https://picsum.photos/seed/g5/640/480', alt: '古镇', width: 640, height: 480, title: '古镇' },
          { id: 'g6', src: 'https://picsum.photos/seed/g6/640/480', alt: '森林', width: 640, height: 480, caption: '清晨的森林' },
          { id: 'g7', src: 'https://picsum.photos/seed/g7/640/480', alt: '城市', width: 640, height: 480, title: '城市夜景', caption: '霓虹灯光' },
        ],
      },
    },
  ],
  'cx-vtu-item-carousel': [
    {
      // 双条目完整字段：图 + 副标题
      label: '双条目 · 图文',
      data: {
        title: '推荐商品',
        items: [
          { id: 'i1', name: '无线耳机', subtitle: '降噪 · 36h 续航', image: 'https://picsum.photos/seed/i1/320/200' },
          { id: 'i2', name: '机械键盘', subtitle: '热插拔 · 三模', image: 'https://picsum.photos/seed/i2/320/200' },
        ],
      },
    },
    {
      // 无图条目：用 color 标签做视觉区分
      label: '双条目 · 无图 · 彩色标签',
      data: {
        title: '状态列表',
        items: [
          { id: 'i3', name: '待处理', subtitle: '3 项', color: '#f59e0b' },
          { id: 'i4', name: '已完成', subtitle: '12 项', color: '#10b981' },
        ],
      },
    },
    {
      // 带操作按钮：展示 actions 嵌套字段与按钮变体
      label: '单条目 · 带操作',
      data: {
        title: '审批项',
        items: [
          {
            id: 'i5',
            name: '请假申请',
            subtitle: '申请人：张三',
            image: 'https://picsum.photos/seed/i5/320/200',
            actions: [
              { id: 'approve', label: '同意', variant: 'default' },
              { id: 'reject', label: '驳回', variant: 'destructive' },
            ],
          },
        ],
      },
    },
  ],
}
