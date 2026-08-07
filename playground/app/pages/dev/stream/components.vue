<template>
  <!-- /dev/stream/components：@lionad/cx-stream 组件级流式管线验收。
       布局语言与 /dev/stream/pages 一致：增量/终态升格为舞台双视图，
       播放控制与选项收进悬浮控制器；组件级物料非整页，舞台内居中自然尺寸。
       管线观测面板（原始流/打字机/切分/三态细节）折叠进调试抽屉。 -->
  <main class="page-stage">
    <!-- 主舞台：增量/终态双视图，v-show 切换保持各自 DOM 状态 -->
    <section class="stage">
      <div v-show="view === 'incremental'" class="stage-view" data-testid="panel-incremental">
        <div class="stage-center">
          <CxRender v-if="stageNode" :components="[stageNode]" />
          <div v-else class="stage-empty">
            <p>播放后组件骨架将在此逐行生长</p>
          </div>
        </div>
      </div>
      <div v-show="view === 'final'" class="stage-view" data-testid="panel-final">
        <div class="stage-center stage-center--stack">
          <template v-if="finalNodes.length">
            <CxRender v-for="node in finalNodes" :key="node.id" :components="[node]" />
          </template>
          <div v-else class="stage-empty"><p>Spec 闭合后渲染完整组件</p></div>
        </div>
      </div>
    </section>

    <!-- 左上悬浮：页面标识与验收页导航 -->
    <header class="dock dock--info">
      <h1 class="dock-title">cx stream · 流式结构化渲染（组件级）</h1>
      <DevPagesNav />
    </header>

    <!-- 底部悬浮控制器：组件数量 · 播放控制 · 视图切换 · 调试抽屉 -->
    <section class="dock dock--controls" data-testid="stream-controls">
      <div class="controls-row">
        <span class="controls-label">组件</span>
        <button
          v-for="n in MAX_COMPONENTS"
          :key="n"
          class="tab"
          :class="{ 'tab--active': n === componentCount }"
          :data-testid="`count-tab-${n}`"
          @click="componentCount = n"
        >
          {{ n }}
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
        <!-- 终态渲染作为控制器视图切换存在，有闭合 Spec 才解锁 -->
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
            :disabled="finalNodes.length === 0"
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
      <!-- 调试抽屉：管线各阶段观测面板，默认收起不抢舞台 -->
      <div v-if="debugOpen" class="debug-pane" data-testid="debug-pane">
        <section class="debug-section">
          <h4>三态检测</h4>
          <ul class="kv">
            <li>specs：{{ detection.specs.length }}（{{ finalNodes.length }} / {{ totalSpecs }} 已接管）</li>
            <li>pendingSources：{{ detection.pendingSources?.length ?? 0 }}</li>
            <li>增量帧：{{ mainArrayOf(stageNode)?.length ?? 0 }} 项</li>
          </ul>
          <pre class="raw raw--small">{{ detection.content ?? '—' }}</pre>
        </section>
        <section class="debug-section">
          <h4>打字机预览（pending 阶段）</h4>
          <p v-if="pendingSource" class="typewriter" data-testid="typewriter-text">
            {{ displayText }}<span class="cursor">▍</span>
          </p>
          <p v-else class="muted">仅 pending 阶段展示</p>
        </section>
        <section class="debug-section">
          <h4>原始流</h4>
          <pre class="raw" data-testid="panel-raw">{{ streamText }}<span class="cursor">▍</span></pre>
        </section>
        <section class="debug-section">
          <h4>流式切分（{{ chunks.length }}）</h4>
          <ol class="chunks" data-testid="panel-chunks">
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
        </section>
      </div>
    </section>
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
  useLastFrame,
  usePendingTypewriter,
  useStreamChunks,
  useStreamReplay,
} from '@lionad/cx-stream'
import { toRenderableComponents } from '@lionad/cx-render'
import { createVtuTriggerRegistry, mainArrayOf } from '@lionad/cx-comps-vtu'
import { cropScenarioChunks, MAX_COMPONENTS } from '~/dev/stream-scenario'

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
const partialNode = computed(
  () => toRenderableComponents(partialSpec.value, 'stream-components')?.[0] ?? null,
)
// 增量视图停留最后一帧：success 后 extractor 出 null，不清空生长到最后的形态
const { frame: stageNode, clear: clearLastFrame } = useLastFrame(partialNode)

// --- 终态渲染：已闭合的 Spec 逐个接管（多围栏下随闭合递增） ---
// gate 用 specs 而非 status：detector 的 success 只表示「当前流文本围栏全闭合」，
// 多围栏剧本播放中围栏间隙会闪现 success、下一围栏开始又回落 pending——
// 绑定 status 会让已接管的终态物料随间隙闪退；specs 只含已闭合围栏，天然递增
const finalNodes = computed(() =>
  detection.value.specs
    .map((spec) => toRenderableComponents(spec, 'stream-components')?.[0] ?? null)
    .filter((node): node is NonNullable<typeof node> => node !== null),
)
// 围栏总数来自当前裁剪剧本的静态检出，用于进度展示（不随回放变化）
const totalSpecs = computed(() => detector.extractSpecs(scenarioScript.value).specs.length)

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

// --- 舞台视图：增量 | 终态；终态视图 success 才解锁 ---
const view = ref<'incremental' | 'final'>('incremental')
const debugOpen = ref(false)

function reset() {
  resetReplay()
  resetExtractor()
  clearLastFrame()
}
// 剧本切换（组件数量调整）：引擎自动停表归零，extractor 缓存同步清除、视图归位增量——
// 与引擎内部 watch 同源按注册序执行，归零在前、清缓存在后，与原单体实现顺序一致
watch(scenarioChunks, () => {
  resetExtractor()
  clearLastFrame()
  view.value = 'incremental'
})
</script>

<!-- 舞台/悬浮控制器/抽屉样式与 /dev/stream/pages 共享，见 stream-lab.css -->
<style scoped src="~/dev/stream-lab.css"></style>

<style scoped>
/* 组件物料非整页：舞台内居中、自然尺寸展示 */
.stage-center {
  max-width: 760px;
  margin: 0 auto;
  padding: 96px 32px 120px;
  min-height: 100%;
}
.stage-center--stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.controls-label {
  font-size: 12px;
  color: #6b7280;
}
.debug-section h4 {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin: 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
