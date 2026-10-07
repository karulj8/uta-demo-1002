import { readonly } from 'vue'
import { useState } from '#app/composables/state'

/**
 * Manages the open/closed state of a slide-in component.
 * State is persisted across the application using Nuxt's `useState`, allowing
 * multiple components to share the same slide-in state.
 *
 * @param name - Unique identifier for the slide-in (used to namespace the state)
 * @param isInitiallyOpened - Whether the slide-in should start open (defaults to `false`)
 * @returns Object containing readonly `isOpen` state and methods to control it
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { isOpen, toggle, close } = useSlideIn('cart')
 *
 * // Can be called from anywhere with same name to control the same slide-in
 * const { isOpen: cartOpen } = useSlideIn('cart')
 * </script>
 *
 * <template>
 *   <SFSlideIn :is-open="isOpen" @close="close">
 *     <!-- Slide-in content -->
 *   </SFSlideIn>
 *   <button @click="toggle">Toggle Cart</button>
 * </template>
 * ```
 */
export function useSlideIn(name: string, isInitiallyOpened = false) {
  const isOpen = useState(`${name}-slide-in`, () => isInitiallyOpened)

  /**
   * Toggles the slide-in between open and closed states.
   */
  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  /**
   * Closes the slide-in by setting state to `false`.
   */
  const close = () => {
    isOpen.value = false
  }

  return {
    /** Readonly reactive state indicating whether the slide-in is currently open */
    isOpen: readonly(isOpen),
    toggle,
    close,
  }
}
