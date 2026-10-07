<template>
  <SFLink v-live-preview="contentElement" :to="to" :target="target">
    <ContentstackComponent
      v-for="(element, index) in contentElement.content"
      :key="element.uid"
      v-live-preview:[`content__${index}`].loop="contentElement"
      :content-element="element"
    />
  </SFLink>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import type { LinkComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'
import SFLink from '~~/modules/ui/runtime/components/links/SFLink.vue'
import { isExternalLink } from '~/utils'
import { useRouteHelpers } from '~/composables'

const { contentElement } = defineProps<{ contentElement: LinkComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

const to = computed(() => {
  const url = contentElement.url
  if (!url) {
    return ''
  }

  if (isExternalLink(url)) {
    return url
  }

  return getLocalizedRoute(url)
})

const target = computed(() => {
  return contentElement?.open_in_new_tab ? '_blank' : '_self'
})
</script>
