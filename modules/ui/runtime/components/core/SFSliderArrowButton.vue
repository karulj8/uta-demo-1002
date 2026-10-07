<template>
  <button
    class="group/arrowButton flex items-center justify-center bg-white p-2 shadow-hover transition-transform duration-300 disabled:hover:translate-x-0"
    :data-testid="`slider-arrow-button-${direction}`"
    :class="{
      '-left-2 hover:translate-x-1': isLeft && translateOnHover,
      '-right-2 hover:-translate-x-1': !isLeft && translateOnHover,
      'rounded-r-full': isLeft !== invertedRadius,
      'rounded-l-full': isLeft === invertedRadius,
    }"
    :disabled="disabled"
  >
    <component
      :is="icon"
      class="size-3 fill-secondary group-hover/arrowButton:fill-primary group-disabled/arrowButton:group-hover/arrowButton:fill-secondary"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconNavigationLeft, IconNavigationRight } from '#components'

const { direction, invertedRadius = false } = defineProps<{
  /**
   * Disables the button when navigation is not possible (e.g., at the start or end of a slider).
   * @default false
   */
  disabled: boolean
  /**
   * Determines the arrow direction. Use "left" for previous navigation and "right" for next navigation..
   */
  direction: 'left' | 'right'
  /**
   * Applies an inverted border radius style. Useful for buttons that need to align with specific container shapes.
   */
  invertedRadius?: boolean
  /**
   * Enables a translation effect on hover. Adds a subtle movement to improve user interaction feedback.
   */
  translateOnHover?: boolean
}>()

const isLeft = computed(() => direction === 'left')
const icon = computed(() =>
  isLeft.value ? IconNavigationLeft : IconNavigationRight,
)
</script>
