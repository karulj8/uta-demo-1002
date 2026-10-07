<template>
  <div
    v-if="contentToRender?.length"
    :class="{ 'mt-6': contentType === 'seo' }"
  >
    <AmplienceComponent
      v-for="(element, index) in contentToRender"
      :key="(element._meta?.deliveryId ?? index) as PropertyKey"
      :content-element="element"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMSBySlug'
import type { ProductListingPageComponent } from '../types/gen'
import AmplienceComponent from './AmplienceComponent.vue'

const { categoryId, contentType } = defineProps<{
  categoryId: number
  contentType: 'seo' | 'teaser'
}>()

const { data: content } = await useCMSBySlug<ProductListingPageComponent>(
  `product-listing-page-${categoryId}`,
  `c/c-${categoryId}`,
)

const contentToRender = computed(() => {
  if (!content.value) {
    return undefined
  }

  return contentType === 'seo'
    ? content.value.seo_content
    : content.value.teaser_content
})
</script>
