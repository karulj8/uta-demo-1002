<template>
  <div
    v-if="contentToRender?.length"
    v-editable="content?.data.story"
    :class="{ 'mt-6': contentType === 'seo' }"
  >
    <StoryblokComponent
      v-for="blok in contentToRender"
      :key="blok._uid"
      :content-element="blok"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMS'
import { useStoryblokEditor } from '../composables/useStoryblokEditor'
import type { ProductListingPageComponent } from '../types'
import StoryblokComponent from './StoryblokComponent.vue'

const { categoryId, contentType } = defineProps<{
  categoryId: number
  contentType: 'seo' | 'teaser'
}>()

const slug = computed(() => `c/c-${categoryId}`)

const { data: content } = await useCMSBySlug<ProductListingPageComponent>(
  `product-listing-page-${categoryId}`,
  slug,
)

const contentToRender = computed(() => {
  return contentType === 'seo'
    ? content.value?.data?.story?.content?.seoContent
    : content.value?.data?.story?.content?.teaserContent
})

useStoryblokEditor<ProductListingPageComponent>(content)
</script>
