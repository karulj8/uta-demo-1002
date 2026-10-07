<template>
  <div v-live-preview="contentElement">
    <div v-if="contentElement.display_title" class="text-xl font-semibold">
      {{ contentElement.display_title }}
    </div>
    <template v-for="(content, index) in contentElement.content">
      <ContentstackComponent
        v-if="content"
        :key="content.uid"
        v-live-preview:[`content__${index}`].loop="contentElement"
        :content-element="content"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { vLivePreview } from '../directives/livePreview'
import type { AccordionComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'

const { contentElement } = defineProps<{
  contentElement: AccordionComponent
}>()
</script>
