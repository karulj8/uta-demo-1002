/**
 * A Vue directive to control elements using the native Popover API with Vue transition support.
 *
 * This directive manages popover visibility using the native Popover API methods:
 * - `showPopover()` - Shows the popover
 * - `hidePopover()` - Hides the popover
 *
 * The directive automatically sets `popover="manual"` on the element for programmatic control,
 * and integrates seamlessly with Vue's `<Transition>` component for animated appearances.
 *
 * **Note:** The Popover API is a modern web standard. Check browser compatibility before use.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Popover_API | Popover API Documentation}
 * @see {@link https://vuejs.org/guide/built-ins/transition.html | Vue Transition Component}
 * @see {@link https://caniuse.com/mdn-api_htmlelement_popover | Browser Compatibility}
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const isPopoverOpen = ref(false)
 * const triggerRef = ref<HTMLElement>()
 * </script>
 *
 * <template>
 *   <button
 *     ref="triggerRef"
 *     @click="isPopoverOpen = !isPopoverOpen"
 *   >
 *     Toggle Menu
 *   </button>
 *
 *   <Transition name="fade">
 *     <div
 *       v-popover="isPopoverOpen"
 *       class="absolute top-full mt-2"
 *     >
 *       <ul class="menu">
 *         <li>Menu Item 1</li>
 *         <li>Menu Item 2</li>
 *         <li>Menu Item 3</li>
 *       </ul>
 *     </div>
 *   </Transition>
 * </template>
 * ```
 */

import type { ObjectDirective } from 'vue'

function togglePopover(el: HTMLElement, value: unknown): void {
  if (!value) {
    el.hidePopover()
    return
  }

  el.showPopover()
}

export const vPopover: ObjectDirective<HTMLElement> = {
  created(el) {
    el.setAttribute('popover', 'manual')
  },
  // Custom directives are ignored during SSR, so we need to return the props manually using the `getSSRProps` hook. This prevent hydration issues.
  // See: https://vuejs.org/guide/scaling-up/ssr.html#custom-directives
  getSSRProps() {
    return {
      popover: 'manual',
    }
  },
  beforeMount(el, { value }, { transition }) {
    if (transition && value) {
      transition.beforeEnter(el)
    }
  },

  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el)
    }

    togglePopover(el, value)
  },

  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue) {
      return
    }

    if (transition) {
      if (value) {
        transition.beforeEnter(el)
        togglePopover(el, true)
        transition.enter(el)
      } else {
        transition.leave(el, () => {
          togglePopover(el, false)
        })
      }
    } else {
      togglePopover(el, value)
    }
  },

  beforeUnmount(el) {
    togglePopover(el, false)
  },
}
