<template>
  <component
    :is="contentElement?.text_type || 'p'"
    v-live-preview.content="contentElement"
    :class="classes"
    class="text-wrap"
  >
    {{ contentElement?.content }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import type { TextComponent as TextComponentType } from '../types/gen/contentstack'

const { contentElement } = defineProps<{
  contentElement: TextComponentType
}>()
const classes = computed(() => {
  switch (contentElement.text_type) {
    case 'h1':
      return 'text-3xl font-semibold'
    case 'h2':
      return 'text-2xl font-semibold'
    case 'h3':
      return 'text-xl font-semibold'
    case 'h4':
      return 'text-lg font-semibold'
    default:
      return ''
  }
})
</script>
