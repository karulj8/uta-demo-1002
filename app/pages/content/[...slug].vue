<template>
  <div class="xl:container max-xl:mx-5 md:pt-4">
    <PageComponent :slug="slug" data-testid="content-page">
      <template #loading>
        <SFContentPageSkeletonLoader />
      </template>
    </PageComponent>
  </div>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import PageComponent from '#storefront-cms/components/PageComponent.vue'
import SFContentPageSkeletonLoader from '~/components/SFContentPageSkeletonLoader.vue'
import { provideCMSContext } from '~~/modules/cms/utils/useCMSContext'

defineOptions({ name: 'ContentPage' })

/**
 * Catch-all segments after `/content/` (e.g. `imprint` or `['help', 'shipping']`).
 * Passed by Nuxt because `definePageMeta({ props: true })` is set below.
 */
const { slug: slugParam } = defineProps<{
  slug: string | string[]
}>()

definePageMeta({
  pageType: 'content',
  /**
   * Pass route params as page props so setup reads the target slug from props,
   * not from `useRoute()`. On client-side navigation `useRoute().params` can be
   * out of sync during setup (stale or empty), so CMS providers fetch the wrong
   * delivery key / story and show "No content found" or the previous page until
   * a hard reload. SSR is unaffected because the server always has the correct
   * route.
   */
  props: true,
  validate: (route) => {
    return !!route.params.slug && route.params.slug.length > 0
  },
})

/**
 * Builds the CMS slug from the page prop (e.g. `content/about`).
 * Prefixes the static `content` segment because the catch-all only receives the
 * dynamic parts of the path.
 */
const slug = computed(() => {
  const slugParts = ['content']
  if (typeof slugParam === 'string') {
    slugParts.push(slugParam)
  } else if (Array.isArray(slugParam)) {
    slugParts.push(...slugParam)
  }

  return slugParts.join('/')
})

// Starting at the `xl` breakpoint a content container with a `max-width` of `1280px` is used.
// By setting the `max-width` for the `xl` breakpoint, we can avoid loading images wider than the content container and thus save bandwidth and increase overall loading times.
provideCMSContext({
  maxWidths: { xl: 1280 },
})
</script>
