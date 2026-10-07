<template>
  <SFItemsSlider
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="content"
    class="w-full snap-x snap-mandatory"
    :with-arrows="contentElement.show_navigation_arrows ?? true"
  >
    <div
      v-for="(item, index) in contentElement.content ?? []"
      :key="(item._meta?.deliveryId ?? index) as PropertyKey"
      class="flex min-w-full snap-start snap-always place-content-center items-center"
      tabindex="-1"
    >
      <AmplienceComponent :content-element="item" />
    </div>
    <template
      v-if="contentElement.show_pagination_indicators ?? true"
      #thumbnails="{ activeSlide, scrollImageIntoView }"
    >
      <div class="absolute bottom-3 z-10 flex w-full justify-center gap-2">
        <button
          v-for="(item, index) in contentElement.content ?? []"
          :key="(item._meta?.deliveryId ?? index) as PropertyKey"
          class="size-3.5 rounded-full bg-primary"
          :class="{
            'opacity-10': activeSlide !== index,
          }"
          :aria-label="
            $t('slider.dots', {
              index: index + 1,
              total: (contentElement.content ?? []).length,
            })
          "
          @click="scrollImageIntoView(index, 'smooth')"
        />
      </div>
    </template>
  </SFItemsSlider>
</template>

<script setup lang="ts">
import type { SliderComponent } from '../types/gen'
import AmplienceComponent from './AmplienceComponent.vue'
import SFItemsSlider from '~~/modules/ui/runtime/components/sliders/SFItemsSlider.vue'

const { contentElement } = defineProps<{ contentElement: SliderComponent }>()
</script>
