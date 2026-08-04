<template>
  <!-- /dev/stream：@lionad/cx-stream 流式结构化渲染管线验收。
       模拟 LLM 流式输出（一根不断生长的字符串），演示四组能力：
       三态检测（none/pending/success）、增量渲染、打字机预览、多策略切分。 -->
  <main class="page-dev-stream page">
    <header class="page-header">
      <h1 class="title">cx stream · 流式结构化渲染</h1>
      <p class="subtitle">/dev/stream/components · 从不完整 LLM JSON 增量提取可渲染组件树的管线验收</p>
      <DevPagesNav />
    </header>

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
      <label class="speed">
        组件
        <input
          v-model.number="componentCount"
          type="range"
          min="1"
          :max="MAX_COMPONENTS"
          step="1"
          data-testid="stream-component-count"
        />
        <span class="speed-val">{{ componentCount }}</span>
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
          <li>content（占位符预览）：</li>
        </ul>
        <pre class="raw raw--small">{{ detection.content ?? '—' }}</pre>
      </article>

      <!-- 面板 3：打字机预览（任一围栏 pending 阶段） -->
      <article class="card" data-testid="panel-typewriter">
        <header class="card-head"><span class="card-name">打字机预览</span></header>
        <p v-if="pendingSource" class="typewriter" data-testid="typewriter-text">
          {{ displayText }}<span class="cursor">▍</span>
        </p>
        <p v-else class="muted">仅 pending 阶段展示</p>
      </article>

      <!-- 面板 4：增量渲染（pending 阶段行逐步增长） -->
      <article class="card" data-testid="panel-incremental">
        <header class="card-head">
          <span class="card-name">增量渲染</span>
          <span v-if="partialNode" class="badge badge--pending">
            {{ mainArrayOf(partialNode)?.length ?? 0 }} 项
          </span>
        </header>
        <div class="preview">
          <CxRender v-if="partialNode" :components="[partialNode]" />
          <!-- success 后增量管线已让位给终态渲染，空态文案须与状态一致，避免误以为仍在等待 -->
          <span v-else-if="status === 'success'" class="muted">增量阶段已结束，已交由终态渲染</span>
          <span v-else class="muted">等待首个完整行…</span>
        </div>
      </article>

      <!-- 面板 5：终态渲染（success 后随围栏闭合逐个接管） -->
      <article class="card" data-testid="panel-final">
        <header class="card-head">
          <span class="card-name">终态渲染</span>
          <span v-if="finalNodes.length" class="badge badge--success">
            {{ finalNodes.length }} / {{ totalSpecs }} specs
          </span>
        </header>
        <div class="preview">
          <template v-if="finalNodes.length">
            <CxRender v-for="node in finalNodes" :key="node.id" :components="[node]" />
          </template>
          <span v-else class="muted">Spec 闭合后渲染完整组件</span>
        </div>
      </article>

      <!-- 面板 6：多策略切分（useStreamChunks） -->
      <article class="card" data-testid="panel-chunks">
        <header class="card-head">
          <span class="card-name">流式切分</span>
          <span class="count">{{ chunks.length }}</span>
        </header>
        <ol class="chunks">
          <li
            v-for="(c, i) in chunks"
            :key="i"
            class="chunk"
            :class="{ 'chunk--open': !c.isComplete }"
          >
            <span class="chunk-flag">{{ c.isComplete ? '完整' : '生长中' }}</span>
            <code class="chunk-body"
              >{{ c.content.slice(0, 60) }}{{ c.content.length > 60 ? '…' : '' }}</code
            >
          </li>
        </ol>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  createSpecDetector,
  cxHumanTextConfig,
  cxSpecDetectorConfig,
  matchCxTrigger,
  useIncrementalTree,
  usePendingTypewriter,
  useStreamChunks,
  type CxStreamNode,
} from '@lionad/cx-stream'
import { createVtuTriggerRegistry, mainArrayOf } from '@lionad/cx-comps-vtu'
import { toRenderNode } from '~/dev/material-utils'
import { cropScenarioChunks, MAX_COMPONENTS } from '~/dev/stream-scenario'
import { useStreamReplay } from '~/dev/use-stream-replay'

defineOptions({ name: 'PageDevStream' })

// --- 剧本源：组件数量决定剧本裁剪，原始流只含前 N 个组件围栏，默认单组件 ---
const componentCount = ref(1)
const scenarioChunks = computed(() => cropScenarioChunks(componentCount.value))
const scenarioScript = computed(() => scenarioChunks.value.join(''))

// --- 回放引擎（与 /dev/stream/pages 共用 composable）---
// 引擎内部已 watch 剧本切换自动停表归零；extractor 的 lastValid 缓存属消费侧状态，
// 由页面在剧本切换与 reset 时一并清除
const { playing, speed, progress, streamText, togglePlay, reset: resetReplay } =
  useStreamReplay(scenarioChunks)

// --- 三态检测 ---
const detector = createSpecDetector(cxSpecDetectorConfig)
const detection = computed(() => detector.extractSpecs(streamText.value))
const status = computed(() => detection.value.status)
// pendingSources 按文档序倒序 push（detector 为保偏移量从后往前替换占位符），
// [0] 恰是正在流式的最后一个围栏——多围栏下这个顺序不可「修正」，
// 否则增量渲染与打字机消费的当前块静默错位
const pendingSource = computed(() => detection.value.pendingSources?.[0] ?? '')

// --- 增量渲染：partialSpec 为当前可渲染的部分 Spec ---
const { partialSpec, reset: resetExtractor } = useIncrementalTree(
  computed(() => pendingSource.value),
  { registry: createVtuTriggerRegistry(), matchTrigger: matchCxTrigger },
)
const partialNode = computed(() => toCxNode(partialSpec.value))

// --- 终态渲染：success 后已闭合的 Spec 逐个接管（多围栏下随闭合递增） ---
const finalNodes = computed(() =>
  status.value === 'success'
    ? detection.value.specs
        .map((spec) => toCxNode(spec))
        .filter((node): node is NonNullable<typeof node> => node !== null)
    : [],
)
// 围栏总数来自当前裁剪剧本的静态检出，用于进度展示（不随回放变化）
const totalSpecs = computed(() => detector.extractSpecs(scenarioScript.value).specs.length)

// CxSpec（单根或数组）→ CxRender 可消费节点；空/缺省一律 null（数组根取首元素）
function toCxNode(spec: CxStreamNode | CxStreamNode[] | null) {
  const node = Array.isArray(spec) ? spec[0] : spec
  return node ? toRenderNode(node) : null
}

// --- 打字机预览 ---
const { displayText } = usePendingTypewriter(
  computed(() => pendingSource.value),
  {
    stateKey: 'stream-demo:0',
    humanText: cxHumanTextConfig,
  },
)

// --- 多策略切分：按段落空行切块 ---
// 切分器只看字符串、感知不到流是否播完：所有 delta 送达（进度满）即流结束，
// 尾块随之封底；缺这个信号时终态渲染已接管、JSON 尾块仍误显「生长中」
const streamEnded = computed(() => progress.value >= scenarioChunks.value.length)
const { chunks } = useStreamChunks(streamText, [{ marker: '\n\n', offset: 2 }], {
  ended: streamEnded,
})

function reset() {
  resetReplay()
  resetExtractor()
}
// 剧本切换（组件数量调整）：引擎自动停表归零，extractor 缓存同步清除——
// 与引擎内部 watch 同源按注册序执行，归零在前、清缓存在后，与原单体实现顺序一致
watch(scenarioChunks, resetExtractor)
</script>

<!-- 面板样式与 /dev/stream/pages 共享，见 stream-lab.css -->
<style scoped src="~/dev/stream-lab.css"></style>
