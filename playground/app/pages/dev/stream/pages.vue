<template>
  <!-- /dev/stream/pages：页面级 schema 流式渲染验收。
       与 /dev/stream/components（组件级）并列：剧本源换成真实页面 schema
       （站会列表/日会看板/周会看板），验证嵌套树「按文档序逐节点生长」的增量语义。 -->
  <main class="page-dev-stream-pages page">
    <header class="page-header">
      <h1 class="title">cx stream · 页面级流式渲染</h1>
      <p class="subtitle">/dev/stream/pages · 复杂嵌套 schema 增量生长的管线验收</p>
      <DevPagesNav />
    </header>

    <!-- 页面选择器：切换即停表归零并加载对应剧本 -->
    <section class="page-tabs" data-testid="page-selector">
      <button
        v-for="s in PAGE_SCENARIOS"
        :key="s.id"
        class="btn tab"
        :class="{ 'tab--active': s.id === selectedId }"
        :data-testid="`page-tab-${s.id}`"
        @click="selectedId = s.id"
      >
        {{ s.label }}
      </button>
    </section>

    <!-- 控制条：播放/暂停 · 重置 · 速度 -->
    <section class="controls" data-testid="stream-controls">
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
        <span class="speed-val">{{ speed }} 字/秒</span>
      </label>
      <span class="progress">{{ progress }} / {{ scenarioChunks.length }} chunks</span>
    </section>

    <div class="grid">
      <!-- 面板 1：原始流（不断生长的字符串） -->
      <article class="card" data-testid="panel-raw">
        <header class="card-head"><span class="card-name">原始流</span></header>
        <pre class="raw">{{ streamText }}<span class="cursor">▍</span></pre>
      </article>

      <!-- 面板 2：三态检测漏斗 -->
      <article class="card" data-testid="panel-detector">
        <header class="card-head">
          <span class="card-name">三态检测</span>
          <span class="badge" :class="`badge--${status}`" data-testid="detector-status">{{
            status
          }}</span>
        </header>
        <ul class="kv">
          <li>specs：{{ detection.specs.length }}</li>
          <li>pendingSources：{{ detection.pendingSources?.length ?? 0 }}</li>
          <li>rootKey：{{ scenario.rootKey }}</li>
        </ul>
        <pre class="raw raw--small">{{ detection.content ?? '—' }}</pre>
      </article>

      <!-- 面板 3：增量渲染（嵌套树按文档序逐节点生长） -->
      <article class="card" data-testid="panel-incremental">
        <header class="card-head">
          <span class="card-name">增量渲染</span>
          <span v-if="partialNode" class="badge badge--pending">生长中</span>
        </header>
        <div class="preview">
          <CxRender v-if="partialNode" :components="[partialNode]" />
          <!-- success 后增量管线让位终态渲染，空态文案须与状态一致 -->
          <span v-else-if="status === 'success'" class="muted">增量阶段已结束，已交由终态渲染</span>
          <span v-else class="muted">等待首个完整节点…</span>
        </div>
      </article>

      <!-- 面板 4：终态渲染（success 后接管） -->
      <article class="card" data-testid="panel-final">
        <header class="card-head">
          <span class="card-name">终态渲染</span>
          <span v-if="finalNode" class="badge badge--success">{{ scenario.label }}</span>
        </header>
        <div class="preview">
          <CxRender v-if="finalNode" :components="[finalNode]" />
          <span v-else class="muted">Spec 闭合后渲染完整页面</span>
        </div>
      </article>
    </div>
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

// CxSpec（单根或数组）→ CxRender 可消费节点；空/缺省一律 null（数组根取首元素）
function toCxNode(spec: CxStreamNode | CxStreamNode[] | null) {
  const node = Array.isArray(spec) ? spec[0] : spec
  return node ? toRenderNode(node) : null
}

function reset() {
  resetReplay()
  resetExtractor()
}
// 剧本切换（页面选择器）：引擎自动停表归零，extractor 缓存同步清除——
// 与引擎内部 watch 同源按注册序执行，归零在前、清缓存在后
watch(scenarioChunks, resetExtractor)
</script>

<!-- 面板样式与 /dev/stream/components 共享，见 stream-lab.css -->
<style scoped src="~/dev/stream-lab.css"></style>

<style scoped>
.page-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.tab--active {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
</style>
