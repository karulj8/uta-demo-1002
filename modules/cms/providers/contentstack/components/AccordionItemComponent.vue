<template>
  <SFAccordionEntry
    :id="contentElement.uid!"
    v-live-preview="contentElement"
    :title="contentElement.display_title"
  >
    <template v-for="(content, index) in contentElement.content">
      <ContentstackComponent
        v-if="content"
        :key="content.uid"
        v-live-preview:[`content__${index}`].loop="contentElement"
        :content-element="content"
      />
    </template>
  </SFAccordionEntry>
</template>

<script setup lang="ts">
import { vLivePreview } from '../directives/livePreview'
import type { AccordionItemComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'
import SFAccordionEntry from '~~/modules/ui/runtime/components/accordion/SFAccordionEntry.vue'

const { contentElement } = defineProps<{
  contentElement: AccordionItemComponent
}>()
</script>
