import CxVtuTerminal from './terminal'
import CxVtuCodeBlock from './code-block'
import CxVtuCodeDiff from './code-diff'
import CxVtuArticle from './article'
import CxVtuChart from './chart'
import CxVtuDataTable from './data-table'
import CxVtuStatsDisplay from './stats-display'
import CxVtuWeatherWidget from './weather-widget'
import CxVtuAudio from './audio'
import CxVtuImage from './image'
import CxVtuImageGallery from './image-gallery'
import CxVtuItemCarousel from './item-carousel'
import CxVtuVideo from './video'
import CxVtuApprovalCard from './approval-card'
import CxVtuCitation from './citation'
import CxVtuContactCard from './contact-card'
import CxVtuInstagramPost from './instagram-post'
import CxVtuLinkedInPost from './linkedin-post'
import CxVtuLinkPreview from './link-preview'
import CxVtuMessageDraft from './message-draft'
import CxVtuXPost from './x-post'
import CxVtuOptionList from './option-list'
import CxVtuParameterSlider from './parameter-slider'
import CxVtuPreferencesPanel from './preferences-panel'
import CxVtuGeoMap from './geo-map'
import CxVtuPlan from './plan'
import CxVtuProgressTracker from './progress-tracker'
import CxVtuQuestionFlow from './question-flow'
import CxVtuOrderSummary from './order-summary'

import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxVtuTerminal } from './terminal'
export { default as CxVtuCodeBlock } from './code-block'
export { default as CxVtuCodeDiff } from './code-diff'
export { default as CxVtuArticle } from './article'
export { default as CxVtuChart } from './chart'
export { default as CxVtuDataTable } from './data-table'
export { default as CxVtuStatsDisplay } from './stats-display'
export { default as CxVtuWeatherWidget } from './weather-widget'
export { default as CxVtuAudio } from './audio'
export { default as CxVtuImage } from './image'
export { default as CxVtuImageGallery } from './image-gallery'
export { default as CxVtuItemCarousel } from './item-carousel'
export { default as CxVtuVideo } from './video'
export { default as CxVtuApprovalCard } from './approval-card'
export { default as CxVtuCitation } from './citation'
export { default as CxVtuContactCard } from './contact-card'
export { default as CxVtuInstagramPost } from './instagram-post'
export { default as CxVtuLinkedInPost } from './linkedin-post'
export { default as CxVtuLinkPreview } from './link-preview'
export { default as CxVtuMessageDraft } from './message-draft'
export { default as CxVtuXPost } from './x-post'
export { default as CxVtuOptionList } from './option-list'
export { default as CxVtuParameterSlider } from './parameter-slider'
export { default as CxVtuPreferencesPanel } from './preferences-panel'
export { default as CxVtuGeoMap } from './geo-map'
export { default as CxVtuPlan } from './plan'
export { default as CxVtuProgressTracker } from './progress-tracker'
export { default as CxVtuQuestionFlow } from './question-flow'
export { default as CxVtuOrderSummary } from './order-summary'

/** vtu 物料数组：tool-ui-vue 全部 29 个工具组件的包装层 */
export const CxVtu = [
  CxVtuTerminal,
  CxVtuCodeBlock,
  CxVtuCodeDiff,
  CxVtuArticle,
  CxVtuChart,
  CxVtuDataTable,
  CxVtuStatsDisplay,
  CxVtuWeatherWidget,
  CxVtuAudio,
  CxVtuImage,
  CxVtuImageGallery,
  CxVtuItemCarousel,
  CxVtuVideo,
  CxVtuApprovalCard,
  CxVtuCitation,
  CxVtuContactCard,
  CxVtuInstagramPost,
  CxVtuLinkedInPost,
  CxVtuLinkPreview,
  CxVtuMessageDraft,
  CxVtuXPost,
  CxVtuOptionList,
  CxVtuParameterSlider,
  CxVtuPreferencesPanel,
  CxVtuGeoMap,
  CxVtuPlan,
  CxVtuProgressTracker,
  CxVtuQuestionFlow,
  CxVtuOrderSummary,
]

/** vtu 物料 bundle：tool-ui-vue 工具组件自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxVtuBundle: CxMaterialBundle = {
  name: 'vtu',
  materials: [...CxVtu],
}

// --- 流式增量渲染预设 ---
export * from './stream-triggers'

// --- 卡片事件语义层(物料×事件分流与回写文本,SDK 默认) ---
export * from './event-semantics'
