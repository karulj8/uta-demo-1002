<template>
  <SFModal
    v-model:visible="visible"
    class="size-full !max-h-screen !max-w-screen !p-0"
    @close="$emit('close')"
  >
    <!-- NOTE: The tailwind class `aspect-product` is defined via the `tailwind.config.ts` and uses the `PRODUCT_IMAGE_ASPECT_RATIO` value from `config/ui.ts`. -->
    <div
      class="h-dvh overflow-hidden max-md:my-auto max-md:bg-gray-100 md:mx-auto md:aspect-product"
    >
      <SFItemsSlider
        ref="slider"
        with-arrows
        @update:active-slide="onSlideChange"
      >
        <div
          v-for="(productImage, index) in images"
          :key="productImage.hash"
          :ref="(el) => setSlide(el as HTMLDivElement | null, index)"
          :class="
            scale >= 2 && index === currentSlideIndexRef
              ? 'cursor-zoom-out'
              : 'cursor-zoom-in'
          "
          class="flex h-dvh min-w-full grow snap-start snap-always items-center justify-center overflow-hidden max-md:bg-gray-100"
          @click="toggleDoubleZoom"
        >
          <SFProductImage
            :image="productImage"
            :alt="
              $t('product_image.alt_with_image_index', {
                alt,
                index: index + 1,
                total: images.length,
              })
            "
            :data-testid="`product-image-zoom-${index}`"
            sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw"
            :style="currentSlideIndexRef === index ? productImageStyle : {}"
            class="transition-transform duration-75"
            :with-mix-blend-darken="false"
            @mousemove="updateZoomOffset"
          />
        </div>
        <template #prev-button="{ prev, isPrevEnabled }">
          <SFSliderArrowButton
            class="absolute top-1/2 -translate-y-1/2 bg-gray-300 max-md:hidden"
            :aria-label="$t('image_slider.a11ly.go_to_previous_image')"
            :disabled="!isPrevEnabled"
            direction="left"
            translate-on-hover
            @click="prev()"
          />
        </template>
        <template #next-button="{ next, isNextEnabled }">
          <SFSliderArrowButton
            class="absolute top-1/2 -translate-y-1/2 bg-gray-300 max-md:hidden"
            :aria-label="$t('image_slider.a11ly.go_to_next_image')"
            :disabled="!isNextEnabled"
            direction="right"
            translate-on-hover
            @click="next()"
          />
        </template>
        <template v-if="images.length > 1" #thumbnails>
          <div
            class="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-1"
            data-testid="image-gallery-overlay-slider-dots"
          >
            <div
              v-for="i in images.length"
              :key="i"
              :data-testid="`image-gallery-overlay-slider-dot-${i - 1}`"
              class="size-1 rounded-full bg-gray-400 transition-all duration-300"
              :class="{ 'w-3 !bg-primary': i - 1 === currentSlideIndexRef }"
            />
          </div>
        </template>
      </SFItemsSlider>
    </div>
  </SFModal>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onScopeDispose,
  ref,
  toValue,
  watch,
  type WatchStopHandle,
} from 'vue'
import { usePinch, useDrag } from '@vueuse/gesture'
import { useEventListener, useMediaQuery, useMounted } from '@vueuse/core'
import type { ProductImage as ProductImageType } from '@scayle/storefront-nuxt'
import SFProductImage from '../../SFProductImage.vue'
import { SFItemsSlider, SFModal } from '#storefront-ui/components'
import SFSliderArrowButton from '~~/modules/ui/runtime/components/core/SFSliderArrowButton.vue'

const props = defineProps<{
  alt: string
  images: ProductImageType[]
  currentSlideIndex?: number
}>()

const emit = defineEmits<{ close: []; 'update:slide': [number] }>()

const visible = defineModel<boolean>('visible', { default: false })

const slider = ref<InstanceType<typeof SFItemsSlider>>()
const slides = ref<HTMLDivElement[]>([])
const currentSlideIndexRef = computed(() => props.currentSlideIndex ?? 0)

// Vue calls this with the element on mount and with `null` on unmount. Clearing
// the slot on `null` keeps `slides` in step with the rendered images, so zoom
// gestures never bind to a detached node when the product (and its image count)
// changes while the modal stays mounted.
const setSlide = (el: HTMLDivElement | null, index: number) => {
  if (el) {
    slides.value[index] = el
  } else {
    // Keep indices aligned with v-for when slides unmount (matches V3 gallery zoom).
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- sparse slide ref array
    delete slides.value[index]
  }
}

let pinchController: ReturnType<typeof usePinch>
let dragController: ReturnType<typeof useDrag>
let stopZoomElementWatch: WatchStopHandle

// Zoom

// Shared
const zoomOffsetY = ref(0)
const zoomOffsetX = ref(0)
const scale = ref(1)

// `(pointer: coarse)` = primary input is coarse (finger). Reactively tracks
// hybrid devices (e.g. iPad when a trackpad is connected/disconnected).
// Gated by `useMounted` so the first client render matches SSR (`false`);
// `useMediaQuery` otherwise evaluates `matchMedia` synchronously in setup.
const isMounted = useMounted()
const coarsePointer = useMediaQuery('(pointer: coarse)')
const isTouchSupported = computed(() => isMounted.value && coarsePointer.value)
const MIN_ZOOM = 1

// mobile zoom
const zoomElement = computed(() => slides.value?.[currentSlideIndexRef.value])
const pinchActive = ref(false)
const MAX_PINCH_ZOOM = 500
const MAX_ZOOM_MOBILE = 2
const MAX_ZOOM_DESKTOP = 1.5

const resetOffset = () => {
  zoomOffsetX.value = 0
  zoomOffsetY.value = 0
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const getMaxOffset = (currentScale: number) => {
  const image = zoomElement.value?.querySelector('picture')
  const imgWidth = image?.clientWidth || 0
  const imgHeight = image?.clientHeight || 0

  return {
    maxOffsetX: Math.max(0, (imgWidth * currentScale - imgWidth) / 4.5),
    maxOffsetY: Math.max(0, (imgHeight * currentScale - imgHeight) / 8),
  }
}

const updateZoomOffset = (event: MouseEvent) => {
  if (!event || scale.value <= 1) {
    return
  }
  if (!isTouchSupported.value) {
    zoomOffsetY.value = event.offsetY
    zoomOffsetX.value = event.offsetX
  } else {
    const { maxOffsetX, maxOffsetY } = getMaxOffset(scale.value)
    zoomOffsetX.value = clamp(zoomOffsetX.value, -maxOffsetX, maxOffsetX)
    zoomOffsetY.value = clamp(zoomOffsetY.value, -maxOffsetY, maxOffsetY)
  }
}

const productImageStyle = computed(() => {
  // translate did cause jitter on desktop, and transform-origin did cause jitter with touch
  // therefore we use different approaches here
  return isTouchSupported.value
    ? `transform: scale(${scale.value}) translate(${zoomOffsetX.value}px, ${zoomOffsetY.value}px)`
    : `transform: scale(${scale.value}); transform-origin: ${zoomOffsetX.value}px ${zoomOffsetY.value}px;`
})

const toggleDoubleZoom = (event?: MouseEvent) => {
  if (scale.value <= MIN_ZOOM) {
    scale.value = MAX_ZOOM_DESKTOP
    if (event) {
      updateZoomOffset(event)
    }
  } else {
    scale.value = MIN_ZOOM
    if (isTouchSupported.value) {
      resetOffset()
    }
  }
}

const mapNumberToRange = (
  num: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const mappedNumber =
    ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
  return clamp(mappedNumber, outMin, outMax)
}

const pinchHandler = ({
  offset: [pinchZoom],
  pinching,
}: {
  offset: [number, number]
  pinching: boolean
}) => {
  pinchActive.value = pinching
  if (!pinching) {
    return
  }
  scale.value = mapNumberToRange(
    pinchZoom,
    0,
    MAX_PINCH_ZOOM,
    MIN_ZOOM,
    MAX_ZOOM_MOBILE,
  )

  const { maxOffsetX, maxOffsetY } = getMaxOffset(scale.value)
  zoomOffsetX.value = clamp(zoomOffsetX.value, -maxOffsetX, maxOffsetX)
  zoomOffsetY.value = clamp(zoomOffsetY.value, -maxOffsetY, maxOffsetY)
}

const dragHandler = ({
  dragging,
  delta: [x, y],
}: {
  dragging: boolean
  delta: [number, number]
}) => {
  if (!dragging || pinchActive.value) {
    return
  }

  const { maxOffsetX, maxOffsetY } = getMaxOffset(scale.value)
  zoomOffsetX.value = clamp(zoomOffsetX.value + x, -maxOffsetX, maxOffsetX)
  zoomOffsetY.value = clamp(zoomOffsetY.value + y, -maxOffsetY, maxOffsetY)
}

watch(visible, (isNowVisible) => {
  if (isNowVisible) {
    nextTick(() => {
      slider.value?.scrollImageIntoView(
        toValue(currentSlideIndexRef),
        'instant',
      )
      pinchController = usePinch(pinchHandler, {
        domTarget: zoomElement,
        eventOptions: {
          passive: true,
        },
      })
      dragController = useDrag(dragHandler, {
        domTarget: zoomElement,
        eventOptions: {
          passive: true,
        },
      })
      stopZoomElementWatch = watch(zoomElement, () => {
        // when the slide changes, all event listeners need to be cleaned up and assigned to the new slide
        pinchController?.clean()
        pinchController?.bind()
        pinchController?.reset()
        dragController?.clean()
        dragController?.bind()
        dragController?.reset()

        resetOffset()
      })
    })
  } else {
    if (stopZoomElementWatch) {
      stopZoomElementWatch()
    }
    pinchController?.clean()
    pinchController?.reset()
    dragController?.clean()
    dragController?.reset()
  }
})

onScopeDispose(() => {
  if (stopZoomElementWatch) {
    stopZoomElementWatch()
  }
  pinchController?.clean()
  dragController?.clean()
})

const onSlideChange = (newIndex: number) => {
  scale.value = 1
  resetOffset()
  emit('update:slide', newIndex)
}

onMounted(() => {
  useEventListener(document, 'gesturestart', (e) => {
    e.preventDefault()
  })
  useEventListener(document, 'gesturechange', (e) => {
    e.preventDefault()
  })
})
</script>
