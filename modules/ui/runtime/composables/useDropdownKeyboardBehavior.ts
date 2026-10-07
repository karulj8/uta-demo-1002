import type { Ref, ShallowRef } from 'vue'
import { nextTick, ref, watch } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { tabbable } from 'tabbable'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

/**
 * Template refs required for dropdown keyboard behavior.
 */
type Refs = {
  /** Root container element of the dropdown */
  rootRef: Readonly<ShallowRef<HTMLDivElement | null>>
  /** Button element that triggers the dropdown */
  buttonRef: Readonly<ShallowRef<HTMLDivElement | null>>
  /** Container element for dropdown options */
  optionsRef: Readonly<ShallowRef<HTMLDivElement | null>>
}

/**
 * State and control methods for the dropdown.
 */
type State = {
  /** Opens the dropdown */
  open: () => void
  /** Closes the dropdown */
  close: () => void
  /** Reactive state indicating if dropdown is open */
  isOpen: Ref<boolean>
}

/**
 * Implements comprehensive keyboard navigation and accessibility for dropdown components.
 * Provides a complete keyboard interaction pattern following ARIA best practices.
 *
 * **Features:**
 * - Focus trap when dropdown is open (keeps focus within dropdown)
 * - `ArrowUp`/`ArrowDown` keys navigate between options
 * - `Escape` key closes the dropdown
 * - `Enter` key activates focus trap
 * - `Tab`/`Shift+Tab` exits and closes the dropdown
 * - Click outside closes the dropdown
 * - Prevents page scrolling when using arrow keys
 * - Proper focus restoration on close
 *
 * **Accessibility:**
 * - Compatible with screen readers
 * - Maintains proper tab order
 * - Uses `tabbable` library to find focusable elements
 * - Integrates with VueUse focus trap
 *
 * @param refs - Object containing template refs for dropdown elements
 * @param state - Object containing dropdown state and control methods
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const rootRef = shallowRef<HTMLDivElement | null>(null)
 * const buttonRef = shallowRef<HTMLDivElement | null>(null)
 * const optionsRef = shallowRef<HTMLDivElement | null>(null)
 * const isOpen = ref(false)
 *
 * const open = () => {
 *   isOpen.value = true
 * }
 *
 * const close = () => {
 *   isOpen.value = false
 * }
 *
 * useDropdownKeyboardBehavior(
 *   { rootRef, buttonRef, optionsRef },
 *   { open, close, isOpen },
 * )
 * </script>
 *
 * <template>
 *   <div ref="rootRef">
 *     <div ref="buttonRef">
 *       <button @click="open">Open Dropdown</button>
 *     </div>
 *     <div v-if="isOpen" ref="optionsRef">
 *       <button>Option 1</button>
 *       <button>Option 2</button>
 *       <button>Option 3</button>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useDropdownKeyboardBehavior(
  { rootRef, buttonRef, optionsRef }: Refs,
  { close, isOpen }: State,
) {
  const trapFocusImmediately = ref(false)

  onClickOutside(rootRef, () => {
    if (isOpen.value) {
      close()
    }
  })

  const { activate, deactivate } = useFocusTrap(optionsRef, {
    immediate: isOpen.value,
    isKeyBackward: (keyEvent) => keyEvent.code === 'ArrowUp',
    isKeyForward: (keyEvent) => keyEvent.code === 'ArrowDown',
    allowOutsideClick: true,
  })

  watch(isOpen, async (open) => {
    await nextTick()
    if (open) {
      activate()
    } else {
      deactivate({ returnFocus: trapFocusImmediately.value })
      trapFocusImmediately.value = false
    }
  })

  // Focus the element that is next or previous to the button ref
  const tabOut = (direction: 'next' | 'previous' | undefined) => {
    setTimeout(() => {
      const button = buttonRef.value?.querySelector('button')
      if (!button) {
        return
      }

      const tabbables = tabbable(document.body).filter(
        (el) => el === button || !rootRef.value?.contains(el),
      )
      const index = tabbables.indexOf(button)

      if (direction === undefined || index === -1) {
        button.focus()
      } else if (direction === 'next' && tabbables[index + 1]) {
        tabbables[index + 1]!.focus()
      } else if (direction === 'previous' && tabbables[index - 1]) {
        tabbables[index - 1]!.focus()
      }
    }, 0)
  }

  const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']

  onKeyStroke(
    ARROW_KEYS,
    (event: KeyboardEvent) => {
      // Prevent scrolling the page on arrow keys
      event.preventDefault()
    },
    { target: rootRef },
  )

  onKeyStroke(
    'Escape',
    () => {
      close()
    },
    { target: rootRef },
  )

  onKeyStroke(
    'Enter',
    () => {
      if (isOpen.value) {
        trapFocusImmediately.value = true
      }
    },
    { target: rootRef },
  )

  onKeyStroke(
    'Tab',
    (event: KeyboardEvent) => {
      if (isOpen.value) {
        event.preventDefault()
        deactivate()
        close()
        tabOut(event.shiftKey ? 'previous' : 'next')
      }
    },
    { target: rootRef },
  )
}
