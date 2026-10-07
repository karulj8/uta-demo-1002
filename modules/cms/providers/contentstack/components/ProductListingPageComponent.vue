<template>
  <div
    v-if="contentToRender?.length"
    :class="{ 'mt-6': contentType === 'seo' }"
  >
    <ContentstackComponent
      v-for="blok in contentToRender"
      :key="blok?.uid"
      :content-element="blok"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMS'
import type { ProductlistingpageComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'

const { categoryId, contentType } = defineProps<{
  categoryId: number
  contentType: 'seo' | 'teaser'
}>()

const slug = computed(() => `c/c-${categoryId}`)

const { data: content } = await useCMSBySlug<ProductlistingpageComponent>(
  `product-listing-page-${categoryId}`,
  slug,
  'productlistingpage-component',
)

const contentToRender = computed(() => {
  return contentType === 'seo'
    ? content.value?.seo_content
    : content.value?.teaser_content
})
</script>
