/**
 * A Vue directive to control native HTML `<dialog>` elements with Vue transition support.
 *
 * This directive manages dialog visibility using the native `HTMLDialogElement` API methods:
 * - `show()` - Opens dialog (non-modal, allows interaction with page)
 * - `showModal()` - Opens dialog as modal (blocks interaction with page)
 * - `close()` - Closes the dialog
 *
 * The directive integrates seamlessly with Vue's `<Transition>` component, properly
 * coordinating transition lifecycle hooks with dialog state changes.
 *
 * **Modifiers:**
 * - `.modal` - Opens the dialog as a modal using `showModal()` instead of `show()`
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement | HTMLDialogElement API}
 * @see {@link https://vuejs.org/guide/built-ins/transition.html | Vue Transition Component}
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const isDialogOpen = ref(false)
 * </script>
 *
 * <template>
 *   <!-- Modal dialog (blocks background interaction) -->
 *   <Transition name="fade">
 *     <dialog v-dialog.modal="isDialogOpen">
 *       <h2>Modal Dialog</h2>
 *       <p>This is a modal dialog with backdrop.</p>
 *       <button @click="isDialogOpen = false">Close</button>
 *     </dialog>
 *   </Transition>
 *
 *   <!-- Non-modal dialog (allows background interaction) -->
 *   <Transition name="slide">
 *     <dialog v-dialog="isDialogOpen">
 *       <p>Non-modal dialog content</p>
 *     </dialog>
 *   </Transition>
 *
 *   <button @click="isDialogOpen = true">Open Dialog</button>
 * </template>
 * ```
 */

import type { ObjectDirective } from 'vue'

function toggleDialog(
  el: HTMLDialogElement,
  value: unknown,
  modal?: boolean,
): void {
  if (!value) {
    el.close()
    return
  }

  if (modal) {
    el.showModal()
    return
  }

  el.show()
}

export const vDialog: ObjectDirective<HTMLDialogElement> = {
  beforeMount(el, { value }, { transition }) {
    if (transition && value) {
      transition.beforeEnter(el)
    }
  },

  mounted(el, { value, modifiers }, { transition }) {
    if (transition && value) {
      transition.enter(el)
    }

    toggleDialog(el, value, modifiers.modal)
  },

  updated(el, { value, oldValue, modifiers }, { transition }) {
    if (!value === !oldValue) {
      return
    }

    if (transition) {
      if (value) {
        transition.beforeEnter(el)
        toggleDialog(el, true, modifiers.modal)
        transition.enter(el)
      } else {
        transition.leave(el, () => {
          toggleDialog(el, false, modifiers.modal)
        })
      }
    } else {
      toggleDialog(el, value, modifiers.modal)
    }
  },

  beforeUnmount(el, { modifiers }) {
    toggleDialog(el, false, modifiers.modal)
  },
}
