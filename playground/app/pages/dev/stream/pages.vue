<template>
  <!-- /dev/stream/pages：页面级 schema 流式渲染验收。
       布局语义：增量渲染是主角——页面物料全尺寸铺满舞台逐节点生长；
       播放控制与选项收进底部悬浮控制器；终态渲染不是并排面板，
       而是控制器上「增量 | 终态」的视图切换（success 才解锁）。 -->
  <main class="page-stage">
    <!-- 主舞台：增量/终态双视图，v-show 切换保持两棵树各自 DOM 状态 -->
    <section class="stage">
      <div v-show="view === 'incremental'" class="stage-view" data-testid="panel-incremental">
        <CxRender v-if="stageNode" :components="[stageNode]" />
        <div v-else class="stage-empty">
          <p>播放后页面骨架将在此逐节点生长</p>
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
import { useLastFrame } from '~/dev/use-last-frame'
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
// 增量视图停留最后一帧：success 后 extractor 出 null，不清空生长到最后的形态
const { frame: stageNode, clear: clearLastFrame } = useLastFrame(partialNode)

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
  clearLastFrame()
}
// 剧本切换（页面选择器）：引擎自动停表归零，extractor 缓存同步清除、视图归位增量——
// 与引擎内部 watch 同源按注册序执行，归零在前、清缓存在后
watch(scenarioChunks, () => {
  resetExtractor()
  clearLastFrame()
  view.value = 'incremental'
})
</script>

<!-- 舞台/悬浮控制器/抽屉样式与 /dev/stream/components 共享，见 stream-lab.css -->
<style scoped src="~/dev/stream-lab.css"></style>
