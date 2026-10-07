<template>
  <div v-live-preview="contentElement" :class="spacing" class="w-full">
    <hr v-if="contentElement.show_line" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import type { DividerComponent } from '../types/gen/contentstack'

const { contentElement } = defineProps<{ contentElement: DividerComponent }>()

const spacing = computed(() => {
  switch (contentElement.height) {
    case 'medium':
      return 'py-5 lg:py-9'
    case 'large':
      return 'py-9 lg:py-12'
    case 'small':
    default:
      return 'py-3 lg:py-5'
  }
})
</script>
