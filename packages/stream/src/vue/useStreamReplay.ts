import { computed, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'

/**
 * 流式回放引擎：定时器按「字符/秒」推进，进度对齐到 chunk（SSE delta）边界。
 * 引擎只管推进与暂停，不感知剧本内容——消费方各自持有剧本源（Ref<string[]>）。
 * options.speed 为初始生成速度（消费方滑杆可后续改写 speed ref）；
 * finish() 直接推进到剧本末尾（大剧本验收/演示跳过逐帧等待，管线终态兜底直出完整帧）。
 */
export function useStreamReplay(
  chunks: Ref<string[]>,
  options: { speed?: number } = {},
) {
  /** 字符串契约的完整剧本：detector / 增量管线等字符串消费者统一消费这一根 */
  const script = computed(() => chunks.value.join(''))

  // chunk 起始偏移前缀和：字符进度换算 chunk 进度的索引
  const chunkStarts = computed(() => {
    const starts: number[] = []
    let acc = 0
    for (const c of chunks.value) {
      starts.push(acc)
      acc += c.length
    }
    return starts
  })

  const TICK_MS = 50
  const charOffset = ref(0)
  const playing = ref(false)
  /** 生成速度（字符/秒） */
  const speed = ref(options.speed ?? 120)
  let timer: ReturnType<typeof setInterval> | null = null

  // 进度以 chunk 为单位对齐：管线（检测/增量/打字机）只在 delta 边界处重算，
  // 避免按字符步进把每帧重算放大回字符数级。
  // 零点显式归零——`starts[0]=0 <= charOffset=0` 会把首 chunk 误计为已送达，
  // 未播放/归零时 streamText 不应含任何内容
  const progress = computed(() => {
    if (charOffset.value <= 0) return 0
    const starts = chunkStarts.value
    let n = 0
    while (n < starts.length && starts[n]! <= charOffset.value) n++
    return n
  })

  const streamText = computed(() =>
    chunks.value.slice(0, progress.value).join(''),
  )

  function togglePlay() {
    if (playing.value) {
      pause()
    } else {
      playing.value = true
      // 已到结尾再播放则从头开始
      if (charOffset.value >= script.value.length) charOffset.value = 0
      timer = setInterval(() => {
        charOffset.value += (speed.value * TICK_MS) / 1000
        if (charOffset.value >= script.value.length) {
          charOffset.value = script.value.length
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

  function reset() {
    pause()
    charOffset.value = 0
  }

  /** 直接推进到剧本末尾：大剧本跳过逐帧等待（管线终态兜底直出完整帧） */
  function finish() {
    pause()
    charOffset.value = script.value.length
  }

  // 剧本切换自动停表归零：旧进度落到新剧本的错误区间会让管线消费错位文本
  watch(chunks, reset)

  return { playing, speed, progress, streamText, togglePlay, reset, finish }
}
