<template>
  <SFButton
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="label"
    :variant="variant"
    :to="to"
    :target="target"
  >
    {{ contentElement.label ?? '' }}
  </SFButton>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonComponent } from '../types/gen'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'
import { isExternalLink } from '~/utils'
import { useRouteHelpers } from '~/composables'

const { contentElement } = defineProps<{ contentElement: ButtonComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

const variant = computed(() => {
  switch (contentElement.variant) {
    case 'secondary':
      return 'secondary'
    case 'outline':
    case 'raw':
      return 'tertiary'
    case 'accent':
      return 'accent'
    case 'primary':
    default:
      return 'primary'
  }
})

const to = computed(() => {
  const url = contentElement.link
  if (!url) {
    return ''
  }

  if (isExternalLink(url)) {
    return url
  }

  return getLocalizedRoute(url)
})

const target = computed(() => {
  return isExternalLink(contentElement.link ?? '') ? '_blank' : '_self'
})
</script>
