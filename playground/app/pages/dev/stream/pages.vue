<template>
  <!-- /dev/stream/pages：页面级 schema 流式渲染验收。
       布局语义：增量渲染是主角——页面物料全尺寸铺满舞台逐节点生长；
       播放控制与选项收进底部悬浮控制器；终态渲染不是并排面板，
       而是控制器上「增量 | 终态」的视图切换（success 才解锁）。 -->
  <main class="page-dev-stream-pages">
    <!-- 主舞台：增量/终态双视图，v-show 切换保持两棵树各自 DOM 状态 -->
    <section class="stage">
      <div v-show="view === 'incremental'" class="stage-view" data-testid="panel-incremental">
        <CxRender v-if="partialNode" :components="[partialNode]" />
        <div v-else class="stage-empty">
          <p v-if="status === 'success'">增量阶段已结束，切换到终态查看完整页面</p>
          <p v-else>播放后页面骨架将在此逐节点生长</p>
        </div>
      </div>
      <div v-show="view === 'final'" class="stage-view" data-testid="panel-final">
        <CxRender v-if="finalNode" :components="[finalNode]" />
        <div v-else class="stage-empty"><p>Spec 闭合后渲染完整页面</p></div>
      </div>
    </section>

    <!-- 左上悬浮：页面标识与验收页导航 -->
    <header class="dock dock--info">
      <h1 class="dock-title">cx stream · 页面级流式渲染</h1>
      <DevPagesNav />
    </header>

    <!-- 底部悬浮控制器：剧本选择 · 播放控制 · 视图切换 · 调试抽屉 -->
    <section class="dock dock--controls" data-testid="stream-controls">
      <div class="controls-row" data-testid="page-selector">
        <button
          v-for="s in PAGE_SCENARIOS"
          :key="s.id"
          class="tab"
          :class="{ 'tab--active': s.id === selectedId }"
          :data-testid="`page-tab-${s.id}`"
          @click="selectedId = s.id"
        >
          {{ s.label }}
        </button>
        <span class="badge" :class="`badge--${status}`" data-testid="detector-status">{{
          status
        }}</span>
        <span class="progress">{{ progress }} / {{ scenarioChunks.length }} chunks</span>
      </div>
      <div class="controls-row">
        <button class="btn" data-testid="stream-play" @click="togglePlay">
          {{ playing ? '暂停' : '播放' }}
        </button>
        <button class="btn" data-testid="stream-reset" @click="reset">重置</button>
        <label class="speed">
          速度
          <input
            v-model.number="speed"
            type="range"
            min="1"
            max="600"
            step="1"
            data-testid="stream-speed"
          />
          <span class="speed-val">{{ speed }}</span>
        </label>
        <!-- 终态渲染作为控制器视图切换存在，success 前禁用 -->
        <div class="view-switch" data-testid="view-switch">
          <button
            :class="{ 'view-switch--active': view === 'incremental' }"
            data-testid="view-incremental"
            @click="view = 'incremental'"
          >
            增量
          </button>
          <button
            :class="{ 'view-switch--active': view === 'final' }"
            :disabled="status !== 'success'"
            data-testid="view-final"
            @click="view = 'final'"
          >
            终态
          </button>
        </div>
        <button
          class="btn btn--ghost"
          :class="{ 'btn--ghost-on': debugOpen }"
          data-testid="debug-toggle"
          @click="debugOpen = !debugOpen"
        >
          调试
        </button>
      </div>
      <!-- 调试抽屉：原始流与三态检测细节，默认收起不抢舞台 -->
      <div v-if="debugOpen" class="debug-pane" data-testid="debug-pane">
        <ul class="kv">
          <li>specs：{{ detection.specs.length }}</li>
          <li>pendingSources：{{ detection.pendingSources?.length ?? 0 }}</li>
          <li>rootKey：{{ scenario.rootKey }}</li>
        </ul>
        <pre class="raw raw--small">{{ detection.content ?? '—' }}</pre>
        <pre class="raw" data-testid="panel-raw">{{ streamText }}<span class="cursor">▍</span></pre>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  createSpecDetector,
  cxSpecDetectorConfig,
  matchCxTrigger,
  useIncrementalTree,
  type CxStreamNode,
} from '@lionad/cx-stream'
import { toRenderNode } from '~/dev/material-utils'
import { createPageTriggerRegistry, PAGE_SCENARIOS } from '~/dev/stream-pages-scenario'
import { useStreamReplay } from '~/dev/use-stream-replay'

defineOptions({ name: 'PageDevStreamPages' })

// --- 剧本源：页面选择器决定当前剧本，默认站会列表 ---
const selectedId = ref(PAGE_SCENARIOS[0]!.id)
const scenario = computed(() => PAGE_SCENARIOS.find((s) => s.id === selectedId.value)!)
const scenarioChunks = computed(() => scenario.value.chunks)

// --- 回放引擎（与 /dev/stream/components 共用 composable）---
// 引擎内部已 watch 剧本切换自动停表归零；extractor 缓存属消费侧状态由页面同步清除
const { playing, speed, progress, streamText, togglePlay, reset: resetReplay } =
  useStreamReplay(scenarioChunks)

// --- 三态检测 ---
const detector = createSpecDetector(cxSpecDetectorConfig)
const detection = computed(() => detector.extractSpecs(streamText.value))
const status = computed(() => detection.value.status)
const pendingSource = computed(() => detection.value.pendingSources?.[0] ?? '')

// --- 增量渲染：页面级嵌套树按文档序逐节点生长（scalar 闭合事件分支 + 修剪契约）---
const { partialSpec, reset: resetExtractor } = useIncrementalTree(
  computed(() => pendingSource.value),
  { registry: createPageTriggerRegistry(), matchTrigger: matchCxTrigger },
)
const partialNode = computed(() => toCxNode(partialSpec.value))

// --- 终态渲染：success 后渲染完整页面树 ---
const finalNode = computed(() =>
  status.value === 'success' ? toCxNode(detection.value.specs[0] ?? null) : null,
)

// --- 舞台视图：增量 | 终态；终态视图 success 才解锁 ---
const view = ref<'incremental' | 'final'>('incremental')
const debugOpen = ref(false)

// CxSpec（单根或数组）→ CxRender 可消费节点；空/缺省一律 null（数组根取首元素）
function toCxNode(spec: CxStreamNode | CxStreamNode[] | null) {
  const node = Array.isArray(spec) ? spec[0] : spec
  return node ? toRenderNode(node) : null
}

function reset() {
  resetReplay()
  resetExtractor()
}
// 剧本切换（页面选择器）：引擎自动停表归零，extractor 缓存同步清除、视图归位增量——
// 与引擎内部 watch 同源按注册序执行，归零在前、清缓存在后
watch(scenarioChunks, () => {
  resetExtractor()
  view.value = 'incremental'
})
</script>

<!-- 按钮/徽标/调试抽屉内 pre 等基础样式与 /dev/stream/components 共享 -->
<style scoped src="~/dev/stream-lab.css"></style>

<style scoped>
/* 舞台铺满视口：页面物料以真实尺寸生长，滚动交给物料自身高度 */
.page-dev-stream-pages {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f1f5f9;
}
.stage {
  position: absolute;
  inset: 0;
}
.stage-view {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.stage-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}

/* 悬浮层：玻璃拟态浮于舞台之上，不占用布局空间 */
.dock {
  position: absolute;
  z-index: 10;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  padding: 10px 14px;
}
.dock--info {
  top: 16px;
  left: 16px;
}
.dock-title {
  font-size: 13px;
  font-weight: 600;
}
.dock--controls {
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 600px;
  max-width: calc(100% - 32px);
}
.controls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.controls-row .progress {
  margin-left: auto;
}

/* 剧本 tab：透明边框占位，active 仅换色避免切换跳动 */
.tab {
  font-size: 12px;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}
.tab:hover {
  color: #374151;
}
.tab--active {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

/* 视图切换 segmented：终态段 success 前禁用 */
.view-switch {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}
.view-switch button {
  font-size: 12px;
  padding: 5px 14px;
  background: #fff;
  border: none;
  color: #6b7280;
  cursor: pointer;
}
.view-switch button + button {
  border-left: 1px solid #e5e7eb;
}
.view-switch--active {
  background: #2563eb !important;
  color: #fff !important;
}
.view-switch button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--ghost {
  border-color: transparent;
  color: #6b7280;
}
.btn--ghost-on {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.debug-pane {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.debug-pane .raw {
  max-height: 160px;
}
</style>
