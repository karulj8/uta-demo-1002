<template>
  <div v-editable="contentElement">
    <StoryblokRichText :document="document" :components="components" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { StoryblokRichText } from '@storyblok/vue'
import type { SbRichTextInput } from '@storyblok/richtext'
import type { RichTextComponent } from '../types'
import { createRichTextRenderers } from './richTextRenderers'
import { useRouteHelpers } from '~/composables'

const { contentElement } = defineProps<{ contentElement: RichTextComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

// The generated `StoryblokRichtext` type is a loose `{ type: string; ... }`
// shape, while `@storyblok/vue` renders a discriminated `SbRichTextInput`.
// The cast bridges the two; the runtime document is identical.
const document = computed(
  () => contentElement.content as unknown as SbRichTextInput,
)

const components = computed(() => createRichTextRenderers(getLocalizedRoute))
</script>
