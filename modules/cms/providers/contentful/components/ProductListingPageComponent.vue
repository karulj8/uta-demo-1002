<template>
  <div
    v-if="contentToRender?.length"
    :data-contentful-entry-id="content?.sys?.id"
    :data-contentful-field-id="
      contentType === 'seo' ? 'seoContent' : 'teaserContent'
    "
    :class="{ 'mt-6': contentType === 'seo' }"
  >
    <ContentfulComponent
      v-for="blok in contentToRender"
      :key="blok?.sys.id"
      :content-element="blok"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMS'
import { useContentfulEditor } from '../composables/useContentfulEditor'
import type { TypeProductListingPageComponentSkeleton } from '../types'
import ContentfulComponent from './ContentfulComponent.vue'

const { categoryId, contentType } = defineProps<{
  categoryId: number
  contentType: 'seo' | 'teaser'
}>()

const slug = computed(() => `c/c-${categoryId}`)

const { data: content } =
  await useCMSBySlug<TypeProductListingPageComponentSkeleton>(
    `product-listing-page-${categoryId}`,
    {
      content_type: 'productListingPageComponent',
      'fields.slug[match]': slug.value,
    },
  )

const contentToRender = computed(() => {
  return contentType === 'seo'
    ? content.value?.fields?.seoContent
    : content.value?.fields?.teaserContent
})
useContentfulEditor<TypeProductListingPageComponentSkeleton>(content)
</script>
