import { Tooltip } from 'bootstrap'
import type { Directive } from 'vue'

type TooltipBinding =
  | string
  | (Partial<Tooltip.Options> & { title: string })

function normalize(
  value: TooltipBinding | undefined
): (Partial<Tooltip.Options> & { title: string }) | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value.trim() ? { title: value } : null
  }

  if (!value.title || !String(value.title).trim()) {
    return null
  }

  return value
}

export const vTooltip: Directive<HTMLElement, TooltipBinding> = {
  mounted(el, binding) {
    const config = normalize(binding.value)
    if (!config) return

    new Tooltip(el, {
      trigger: 'hover',
      container: 'body',
      ...config
    })
  },

  updated(el, binding) {
    const instance = Tooltip.getInstance(el)

    const newTitle = getTitle(binding.value)
    const oldTitle = getTitle(binding.oldValue)

    if (!newTitle) {
      instance?.dispose()
      return
    }

    if (!instance) {
      new Tooltip(el, {
        trigger: 'hover',
        container: 'body',
        ...(typeof binding.value === 'object'
          ? binding.value
          : { title: newTitle })
      })
      return
    }

    if (newTitle !== oldTitle) {
      instance.setContent({ '.tooltip-inner': newTitle })
    }
  },

  unmounted(el) {
    Tooltip.getInstance(el)?.dispose()
  }
}

function getTitle(value: TooltipBinding | null): string | null {
  if (!value) return null

  if (typeof value === 'string') {
    return value.trim() || null
  }

  return value.title?.toString().trim() || null
}
