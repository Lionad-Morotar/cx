// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { ref, onMounted, watchEffect } from 'vue'
import type { Ref } from 'vue'
import { popperGenerator, popperOffsets, applyStyles, computeStyles, eventListeners, flip, offset, preventOverflow, arrow as arrowModifier } from '@popperjs/core'
import type { VirtualElement, Instance } from '@popperjs/core'
import { unrefElement } from '@vueuse/core'
import type { MaybeElement } from '@vueuse/core'
import type { PopperOptions } from '../types/popper'

export const createPopper = popperGenerator({
  defaultModifiers: [popperOffsets, computeStyles, applyStyles, eventListeners, offset, flip, preventOverflow, arrowModifier]
})

export function usePopper({
  locked = false,
  overflowPadding = 8,
  offsetDistance = 8,
  offsetSkid = 0,
  gpuAcceleration = true,
  adaptive = true,
  scroll = true,
  resize = true,
  arrow = false,
  placement,
  strategy
}: PopperOptions, virtualReference?: Ref<Element | VirtualElement>) {
  const reference = ref<MaybeElement>(null)
  const popper = ref<MaybeElement>(null)
  const instance = ref<Instance | null>(null)

  onMounted(() => {
    watchEffect((onInvalidate) => {
      if (!popper.value) {
        return
      }
      if (!reference.value && !virtualReference?.value) {
        return
      }

      const popperEl = unrefElement(popper)
      const referenceEl = virtualReference?.value || unrefElement(reference)

      // if (!(referenceEl instanceof HTMLElement)) { return }
      if (!(popperEl instanceof HTMLElement)) {
        return
      }
      if (!referenceEl) {
        return
      }

      const config: Record<string, any> = {
        modifiers: [
          {
            name: 'flip',
            enabled: !locked
          },
          {
            name: 'preventOverflow',
            options: {
              padding: overflowPadding
            }
          },
          {
            name: 'offset',
            options: {
              offset: [offsetSkid, offsetDistance]
            }
          },
          {
            name: 'computeStyles',
            options: {
              adaptive,
              gpuAcceleration
            }
          },
          {
            name: 'eventListeners',
            options: {
              scroll,
              resize
            }
          },
          {
            name: 'arrow',
            enabled: arrow
          }
        ]
      }

      if (placement) {
        config.placement = placement
      }
      if (strategy) {
        config.strategy = strategy
      }

      instance.value = createPopper(referenceEl, popperEl, config)

      onInvalidate(instance.value.destroy)
    })
  })

  return [reference, popper, instance] as const
}
