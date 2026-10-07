import { computed, onMounted, ref, type Ref } from 'vue'
import {
  useMounted,
  useMutationObserver,
  useResizeObserver,
  useThrottleFn,
} from '@vueuse/core'

/**
 * Manages slider/carousel functionality for horizontal or vertical item lists.
 * Handles scroll state, navigation, active slide tracking, resize observation,
 * and scroll boundary detection.
 *
 * Features:
 * - Smooth scroll navigation with `next()` and `prev()` methods
 * - Automatic boundary detection (arrival states)
 * - Active slide tracking
 * - Resize observer for responsive behavior
 * - Throttled scroll event handling for performance
 * - Support for both horizontal and vertical scrolling
 *
 * @param sliderRef - Reference to the slider container element
 * @param mode - Scroll direction: `'horizontal'` or `'vertical'`
 * @returns Object containing slider state and navigation methods
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const sliderRef = ref<HTMLElement>()
 * const {
 *   next,
 *   prev,
 *   onScroll,
 *   isNextEnabled,
 *   isPrevEnabled,
 *   activeSlide,
 *   isScrollable,
 *   itemSize,
 * } = useItemsSlider(sliderRef, 'horizontal')
 * </script>
 *
 * <template>
 *   <div class="relative">
 *     <div
 *       ref="sliderRef"
 *       class="flex overflow-x-auto snap-x"
 *       @scroll="onScroll"
 *     >
 *       <div
 *         v-for="(item, index) in items"
 *         :key="item.id"
 *         class="snap-start"
 *       >
 *         {{ item }}
 *       </div>
 *     </div>
 *
 *     <button
 *       @click="prev"
 *       :disabled="!isPrevEnabled"
 *       class="absolute left-0"
 *     >
 *       Previous
 *     </button>
 *     <button
 *       @click="next"
 *       :disabled="!isNextEnabled"
 *       class="absolute right-0"
 *     >
 *       Next
 *     </button>
 *
 *     <!-- Active slide indicator -->
 *     <div>Slide {{ activeSlide + 1 }} of {{ itemSize }}</div>
 *   </div>
 * </template>
 * ```
 */
export function useItemsSlider(
  sliderRef: Ref<HTMLElement>,
  mode: 'horizontal' | 'vertical',
) {
  /**
   * This is because scrollTop/scrollLeft are non-rounded
   * numbers, while scrollHeight/scrollWidth and clientHeight/clientWidth are rounded.
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_an_element_has_been_totally_scrolled
   */
  const ARRIVED_STATE_THRESHOLD_PIXELS = 1

  const arrivedRight = ref(false)
  const arrivedLeft = ref(true)
  const x = ref(0)

  const arrivedBottom = ref(false)
  const arrivedTop = ref(true)
  const y = ref(0)

  const activeSlide = ref(0)

  const calculateActiveSlide = () => {
    if (mode === 'horizontal') {
      activeSlide.value = Math.abs(
        Math.round(
          (x.value - ARRIVED_STATE_THRESHOLD_PIXELS) / getSlideWidth(),
        ),
      )
    } else {
      activeSlide.value = Math.abs(
        Math.round(
          (y.value - ARRIVED_STATE_THRESHOLD_PIXELS) / getSlideHeight(),
        ),
      )
    }
  }

  // Note: Throttle onScroll callback to prevent layout thrashing. https://kellegous.com/j/2013/01/26/layout-performance/
  const onScroll = useThrottleFn(
    () => {
      if (import.meta.server || !sliderRef.value) {
        return
      }

      // Horizontal
      const scrollLeft = sliderRef.value?.scrollLeft
      arrivedRight.value =
        scrollLeft + sliderRef.value?.clientWidth >=
        sliderRef.value?.scrollWidth - ARRIVED_STATE_THRESHOLD_PIXELS
      arrivedLeft.value = scrollLeft <= 0
      x.value = scrollLeft

      // Vertical
      const scrollTop = sliderRef.value?.scrollTop
      arrivedBottom.value =
        scrollTop + sliderRef.value?.clientHeight >=
        sliderRef.value?.scrollHeight - ARRIVED_STATE_THRESHOLD_PIXELS
      arrivedTop.value = scrollTop <= 0
      y.value = scrollTop

      calculateActiveSlide()
    },
    100,
    true,
  )

  const getSlideWidth = () => {
    const slideCount = sliderRef.value.children.length
    return sliderRef.value.scrollWidth / slideCount
  }

  const getSlideHeight = () => {
    const slideCount = sliderRef.value.children.length
    return sliderRef.value.scrollHeight / slideCount
  }

  /**
   * Scrolls to the next slide with smooth animation.
   * Does nothing if already at the last slide.
   *
   * @param offset - Additional pixel offset to apply to the scroll position (defaults to `0`)
   */
  const next = (offset = 0) => {
    if (!isNextEnabled.value) {
      return
    }
    if (mode === 'horizontal') {
      sliderRef.value.scrollTo({
        top: 0,
        left: x.value + getSlideWidth() + offset,
        behavior: 'smooth',
      })
    } else {
      sliderRef.value.scrollTo({
        top: y.value + getSlideHeight() + offset,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Scrolls to the previous slide with smooth animation.
   * Does nothing if already at the first slide.
   *
   * @param offset - Additional pixel offset to apply to the scroll position (defaults to `0`)
   */
  const prev = (offset = 0) => {
    if (!isPrevEnabled.value) {
      return
    }
    if (mode === 'horizontal') {
      sliderRef.value.scrollTo({
        top: 0,
        left: x.value - getSlideWidth() + offset,
        behavior: 'smooth',
      })
    } else {
      sliderRef.value.scrollTo({
        top: y.value - getSlideHeight() + offset,
        left: 0,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Scrolls a specific item into view by its index.
   *
   * @param index - Zero-based index of the item to scroll to
   * @param scrollBehavior - Scroll behavior: `'auto'` (instant) or `'smooth'` (animated)
   */
  const scrollImageIntoView = (
    index: number,
    scrollBehavior: ScrollBehavior = 'auto',
  ) => {
    if (!sliderRef.value) {
      return
    }
    if (mode === 'horizontal') {
      sliderRef.value.scrollTo({
        left: sliderRef.value.offsetWidth * index,
        behavior: scrollBehavior,
      })
    } else {
      sliderRef.value.scrollTo({
        top: sliderRef.value.offsetHeight * index,
        behavior: scrollBehavior,
      })
    }
  }

  const mounted = useMounted()

  const isNextEnabled = computed(() =>
    mounted.value && mode === 'horizontal'
      ? !arrivedRight.value
      : !arrivedBottom.value,
  )

  const isPrevEnabled = computed(() =>
    mounted.value && mode === 'horizontal'
      ? !arrivedLeft.value
      : !arrivedTop.value,
  )
  const scrollWidth = ref(0)
  const clientWidth = ref(0)
  const scrollHeight = ref(0)
  const clientHeight = ref(0)

  useResizeObserver(sliderRef, () => {
    scrollWidth.value = sliderRef.value.scrollWidth
    clientWidth.value = sliderRef.value.clientWidth
    scrollHeight.value = sliderRef.value.scrollHeight
    clientHeight.value = sliderRef.value.clientHeight
    onScroll()
  })
  const isScrollable = computed(() => {
    if (!sliderRef.value) {
      return
    }

    return mode === 'horizontal'
      ? scrollWidth.value > clientWidth.value
      : scrollHeight.value > clientHeight.value
  })

  const itemSize = ref(0)
  // When the children of the `sliderRef` changes, it does not trigger the reactivity system, thus watch/computed are not enough.
  // We can use a mutation observer to watch for changes in the children of the slider and then update the `itemSize`.
  useMutationObserver(
    sliderRef,
    () => {
      itemSize.value = sliderRef.value?.children.length || 0
    },
    { childList: true },
  )

  onMounted(() => {
    itemSize.value = sliderRef.value?.children.length || 0
  })

  return {
    sliderRef,
    onScroll,
    next,
    prev,
    isNextEnabled,
    isPrevEnabled,
    scrollImageIntoView,
    activeSlide,
    isScrollable,
    itemSize,
  }
}
