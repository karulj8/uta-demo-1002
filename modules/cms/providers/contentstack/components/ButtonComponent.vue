<template>
  <SFButton
    v-live-preview:text="contentElement"
    :variant="variant"
    :to="to"
    :target="target"
  >
    {{ contentElement.text }}
  </SFButton>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import type { ButtonComponent } from '../types/gen/contentstack'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'
import { isExternalLink } from '~/utils'
import { useRouteHelpers } from '~/composables'

const { contentElement } = defineProps<{ contentElement: ButtonComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

const variant = computed(() => {
  switch (contentElement.style) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'outline':
      return 'tertiary'
    case 'accent':
      return 'accent'
    default:
      return 'primary'
  }
})

const to = computed(() => {
  const url = contentElement?.url
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
