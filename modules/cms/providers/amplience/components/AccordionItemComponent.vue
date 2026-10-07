<template>
  <SFAccordionEntry
    :id="
      contentElement._meta?.deliveryId ??
      `accordion-item-${contentElement.title ?? ''}`
    "
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="title"
    :title="contentElement.title ?? ''"
  >
    <template v-for="(content, index) in contentElement.content ?? []">
      <AmplienceComponent
        v-if="content"
        :key="(content._meta?.deliveryId ?? index) as PropertyKey"
        :content-element="content"
      />
    </template>
  </SFAccordionEntry>
</template>

<script setup lang="ts">
import type { AccordionItemComponent } from '../types/gen'
import AmplienceComponent from './AmplienceComponent.vue'
import SFAccordionEntry from '~~/modules/ui/runtime/components/accordion/SFAccordionEntry.vue'

const { contentElement } = defineProps<{
  contentElement: AccordionItemComponent
}>()
</script>
