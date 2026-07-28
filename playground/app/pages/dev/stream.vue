<template>
  <!-- /dev/stream：@lionad/cx-stream 流式结构化渲染管线验收。
       模拟 LLM 流式输出（一根不断生长的字符串），演示四组能力：
       三态检测（none/pending/success）、Route Z 增量渲染、打字机预览、多策略切分。 -->
  <main class="page">
    <header class="page-header">
      <h1 class="title">cx stream · 流式结构化渲染</h1>
      <p class="subtitle">/dev/stream · 从不完整 LLM JSON 增量提取可渲染组件树的管线验收</p>
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

      <!-- 面板 4：增量渲染（Route Z，pending 阶段行逐步增长） -->
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
import { computed, onUnmounted, ref, watch } from 'vue'
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
import {
  createDemoRegistry,
  cropScenarioChunks,
  mainArrayOf,
  MAX_COMPONENTS,
  toRenderNode,
} from '~/dev/stream-scenario'

// --- 回放引擎：定时器按「字符/秒」推进，进度对齐到 chunk（SSE delta）边界 ---
// 组件数量决定剧本裁剪：原始流只含前 N 个组件围栏，默认单组件
const componentCount = ref(1)
const scenarioChunks = computed(() => cropScenarioChunks(componentCount.value))
const scenarioScript = computed(() => scenarioChunks.value.join(''))

// chunk 起始偏移前缀和：字符进度换算 chunk 进度的索引
const chunkStarts = computed(() => {
  const starts: number[] = []
  let acc = 0
  for (const c of scenarioChunks.value) {
    starts.push(acc)
    acc += c.length
  }
  return starts
})

const TICK_MS = 50
const charOffset = ref(0)
const playing = ref(false)
const speed = ref(120) // 生成速度（字符/秒）
let timer: ReturnType<typeof setInterval> | null = null

// 进度以 chunk 为单位对齐：管线（检测/增量/打字机）只在 delta 边界处重算，
// 避免按字符步进把每帧重算放大回字符数级
const progress = computed(() => {
  const starts = chunkStarts.value
  let n = 0
  while (n < starts.length && starts[n]! <= charOffset.value) n++
  return n
})

const streamText = computed(() => scenarioChunks.value.slice(0, progress.value).join(''))

function togglePlay() {
  if (playing.value) {
    pause()
  } else {
    playing.value = true
    // 已到结尾再播放则从头开始
    if (charOffset.value >= scenarioScript.value.length) charOffset.value = 0
    timer = setInterval(() => {
      charOffset.value += (speed.value * TICK_MS) / 1000
      if (charOffset.value >= scenarioScript.value.length) {
        charOffset.value = scenarioScript.value.length
        pause()
      }
    }, TICK_MS)
  }
}
function pause() {
  playing.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
onUnmounted(pause)

// --- 三态检测 ---
const detector = createSpecDetector(cxSpecDetectorConfig)
const detection = computed(() => detector.extractSpecs(streamText.value))
const status = computed(() => detection.value.status)
// pendingSources 按文档序倒序 push（detector 为保偏移量从后往前替换占位符），
// [0] 恰是正在流式的最后一个围栏——多围栏下这个顺序不可「修正」，
// 否则增量渲染与打字机消费的当前块静默错位
const pendingSource = computed(() => detection.value.pendingSources?.[0] ?? '')

// --- 增量渲染（Route Z）：partialSpec 为当前可渲染的部分 Spec ---
const { partialSpec, reset: resetExtractor } = useIncrementalTree(
  computed(() => pendingSource.value),
  { registry: createDemoRegistry(), matchTrigger: matchCxTrigger },
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
  pause()
  charOffset.value = 0
  resetExtractor()
}

// 剧本随组件数量切换：播放中改动立即停表归零，避免旧进度落到新剧本的错误区间
watch(componentCount, reset)
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 32px 24px;
}
.page-header {
  margin-bottom: 20px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.subtitle {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}
.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.btn {
  font-size: 13px;
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.speed {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}
.speed-val {
  min-width: 20px;
  color: #2563eb;
}
.progress {
  font-size: 12px;
  color: #aaa;
  margin-left: auto;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}
.card {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-name {
  font-weight: 600;
  font-size: 14px;
}
.badge {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 4px;
}
.badge--none {
  color: #6b7280;
  background: #f3f4f6;
}
.badge--pending {
  color: #c2410c;
  background: #fff7ed;
}
.badge--success {
  color: #15803d;
  background: #f0fdf4;
}
.count {
  font-size: 12px;
  color: #aaa;
}
.raw {
  font-size: 12px;
  line-height: 1.5;
  background: #0f172a;
  color: #e2e8f0;
  padding: 10px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 240px;
  overflow: auto;
  margin: 0;
}
.raw--small {
  max-height: 120px;
  font-size: 11px;
}
.cursor {
  color: #38bdf8;
}
.kv {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px;
  padding-left: 16px;
}
.typewriter {
  font-size: 14px;
  color: #334155;
  min-height: 24px;
}
.preview {
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  padding: 10px;
  min-height: 64px;
  max-height: 320px;
  overflow: auto;
}
.muted {
  font-size: 12px;
  color: #bbb;
}
.chunks {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
}
.chunk {
  margin-bottom: 6px;
}
.chunk-flag {
  display: inline-block;
  font-size: 10px;
  color: #15803d;
  margin-right: 6px;
}
.chunk--open .chunk-flag {
  color: #c2410c;
}
.chunk-body {
  color: #6b7280;
}
</style>
