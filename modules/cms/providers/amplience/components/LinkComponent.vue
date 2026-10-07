<template>
  <SFLink
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="link"
    :to="to"
    :target="target"
  >
    <AmplienceComponent
      v-for="(element, index) in contentElement.content ?? []"
      :key="(element._meta?.deliveryId ?? index) as PropertyKey"
      :content-element="element"
    />
  </SFLink>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { LinkComponent } from '../types/gen'
import AmplienceComponent from './AmplienceComponent.vue'
import SFLink from '~~/modules/ui/runtime/components/links/SFLink.vue'
import { isExternalLink } from '~/utils'
import { useRouteHelpers } from '~/composables'

const { contentElement } = defineProps<{ contentElement: LinkComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

const isExternal = computed(() => {
  if (contentElement.url_type === 'external') {
    return true
  }
  if (contentElement.url_type === 'internal') {
    return false
  }

  return isExternalLink(contentElement.link ?? '')
})

const to = computed(() => {
  const url = contentElement.link
  if (!url) {
    return ''
  }

  if (isExternal.value) {
    return url
  }

  return getLocalizedRoute(url)
})

const target = computed(() => {
  if (contentElement.open_in_new_tab) {
    return '_blank'
  }

  return isExternal.value ? '_blank' : '_self'
})
</script>
