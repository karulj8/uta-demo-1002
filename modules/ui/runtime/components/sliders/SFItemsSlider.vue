<template>
  <div
    class="relative"
    :class="{ 'overflow-y-scroll scrollbar-hide': mode === 'vertical' }"
  >
    <slot name="header" />
    <div
      v-if="showSkipLinks"
      class="absolute left-0 top-0 -z-10 mt-12 opacity-0 focus-within:opacity-100"
    >
      <slot
        name="skip-link-last"
        v-bind="{
          focusLast,
          setFocusState,
          text: $t('slider.jump_to_end_of_slider'),
        }"
      >
        <SFButton
          class="pointer-events-none"
          variant="secondary"
          @focus="setFocusState(true)"
          @blur="setFocusState(false)"
          @click="focusLast()"
        >
          {{ $t('slider.jump_to_end_of_slider') }}
        </SFButton>
      </slot>
    </div>
    <div
      ref="sliderRef"
      data-testid="items-slider-scrollable"
      class="z-10 flex size-full shrink-0 snap-mandatory scrollbar-hide"
      :class="{
        'snap-y flex-col overflow-x-hidden overflow-y-scroll':
          mode === 'vertical',
        'snap-x overflow-x-auto overflow-y-hidden': mode === 'horizontal',
        'overflow-hidden': !scrollable,
        'pt-14': skipLinkFocused,
      }"
      :tabindex="sliderTabindex"
      @scroll.passive="onScroll"
    >
      <slot />
    </div>
    <div
      v-if="showSkipLinks"
      class="absolute right-0 top-0 -z-10 mt-12 opacity-0 focus-within:opacity-100"
    >
      <slot
        name="skip-link-first"
        v-bind="{
          focusFirst,
          setFocusState,
          text: $t('slider.jump_to_start_of_slider'),
        }"
      >
        <SFButton
          variant="secondary"
          @focus="setFocusState(true)"
          @blur="setFocusState(false)"
          @click="focusFirst()"
        >
          {{ $t('slider.jump_to_start_of_slider') }}
        </SFButton>
      </slot>
    </div>
    <component :is="divOrTransition" :duration="150">
      <div v-if="withArrows">
        <slot
          name="arrows"
          v-bind="{ prev, isPrevEnabled, next, isNextEnabled, isScrollable }"
        >
          <slot name="prev-button" v-bind="{ prev, isPrevEnabled }">
            <button
              class="absolute z-10 rounded-full bg-primary p-1 text-white disabled:opacity-10"
              :class="{
                'disabled:hidden': hideDisabledArrows,
                'left-2 top-[40%]': mode === 'horizontal',
                'left-1/2 top-2 -translate-x-1/2 rotate-90':
                  mode === 'vertical',
              }"
              :disabled="!isPrevEnabled"
              :aria-label="$t('slider.got_to_previous_item')"
              @click="prev()"
            >
              <IconNavigationLeft class="size-6 p-0.5" />
            </button>
          </slot>
          <slot name="next-button" v-bind="{ next, isNextEnabled }">
            <button
              class="absolute z-10 rounded-full bg-primary p-1 text-white disabled:opacity-10"
              :class="{
                'disabled:hidden': hideDisabledArrows,
                'right-2 top-[40%]': mode === 'horizontal',
                'bottom-2 left-1/2 -translate-x-1/2 rotate-90':
                  mode === 'vertical',
              }"
              :disabled="!isNextEnabled"
              :aria-label="$t('slider.got_to_next_item')"
              @click="next()"
            >
              <IconNavigationRight class="size-6 p-0.5" />
            </button>
          </slot>
        </slot>
      </div>
    </component>
    <slot
      name="thumbnails"
      :scroll-image-into-view="scrollImageIntoView"
      :active-slide="activeSlide"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, type Ref, watch } from 'vue'
import { useMounted } from '@vueuse/core'
import { useItemsSlider } from '#storefront-ui'
import { SFFadeInTransition, SFButton } from '#storefront-ui/components'
import { IconNavigationLeft, IconNavigationRight } from '#components'

const MIN_ITEM_SIZE_FOR_SKIP_LINKS = 4

const {
  withArrows = false,
  hideDisabledArrows = false,
  mode = 'horizontal',
  scrollable = true,
  withSkipLinks = false,
} = defineProps<{
  /** When true, displays navigation arrows for scrolling. */
  withArrows?: boolean
  /** When true, hides arrows when they are disabled (at start/end). */
  hideDisabledArrows?: boolean
  /** Scroll direction - horizontal or vertical. */
  mode?: 'horizontal' | 'vertical'
  /** Tab index for keyboard navigation. */
  sliderTabindex?: number
  /** Whether to allow items scroll. */
  scrollable?: boolean
  /** Whether to show skip links. */
  withSkipLinks?: boolean
}>()

const sliderRef = ref<HTMLElement>()
const skipLinkFocused = ref(false)
const isMounted = useMounted()

const {
  next,
  prev,
  isNextEnabled,
  isPrevEnabled,
  onScroll,
  scrollImageIntoView,
  activeSlide,
  isScrollable,
  itemSize,
} = useItemsSlider(sliderRef as Ref<HTMLElement>, mode)

const focusFirst = () => {
  const firstElement = sliderRef.value?.firstElementChild?.firstElementChild
  if (firstElement instanceof HTMLElement) {
    firstElement?.focus()
  }
}

const focusLast = () => {
  const lastElement = sliderRef.value?.lastElementChild?.lastElementChild
  if (lastElement instanceof HTMLElement) {
    lastElement?.focus()
  }
}

const showSkipLinks = computed(() => {
  return withSkipLinks && itemSize.value > MIN_ITEM_SIZE_FOR_SKIP_LINKS
})

const setFocusState = (state: boolean) => {
  skipLinkFocused.value = state
}

const divOrTransition = computed(() => {
  return !isMounted.value ? 'div' : SFFadeInTransition
})

nextTick(() => onScroll())

defineExpose({
  scrollImageIntoView,
})

const emit = defineEmits<{
  'update:activeSlide': [newActiveSlide: number]
}>()

defineSlots<{
  /** Default slot for slider items */
  default: () => unknown
  /** Header content displayed above the slider */
  header: () => unknown
  /** Custom navigation arrows container with slider state */
  arrows: (props: {
    prev: (offset?: number) => void
    isPrevEnabled: boolean
    next: (offset?: number) => void
    isNextEnabled: boolean
    isScrollable: boolean | undefined
  }) => unknown
  /** Custom previous button with navigation state */
  'prev-button': (props: {
    prev: (offset?: number) => void
    isPrevEnabled: boolean
  }) => unknown
  /** Custom next button with navigation state */
  'next-button': (props: {
    next: (offset?: number) => void
    isNextEnabled: boolean
  }) => unknown
  /** Thumbnail navigation with scroll and active slide state */
  thumbnails: (props: {
    scrollImageIntoView: (
      index: number,
      scrollBehavior?: ScrollBehavior,
    ) => void
    activeSlide: number
  }) => unknown
  /** Skip link last */
  'skip-link-last': (props: {
    focusLast: () => void
    setFocusState: (state: boolean) => void
    text: string
  }) => unknown
  /** Skip link first */
  'skip-link-first': (props: {
    focusFirst: () => void
    setFocusState: (state: boolean) => void
    text: string
  }) => unknown
}>()

watch(activeSlide, (newActiveSlide) => {
  emit('update:activeSlide', newActiveSlide)
})
</script>
