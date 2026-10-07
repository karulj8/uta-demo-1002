<template>
  <div
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="content"
  >
    <div v-if="contentElement.title" class="text-xl font-semibold">
      {{ contentElement.title }}
    </div>
    <template v-for="(item, index) in contentElement.content ?? []">
      <AccordionItemComponent
        v-if="item"
        :key="(item._meta?.deliveryId ?? index) as PropertyKey"
        :content-element="item"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AccordionComponent } from '../types/gen'
import AccordionItemComponent from './AccordionItemComponent.vue'

const { contentElement } = defineProps<{
  contentElement: AccordionComponent
}>()
</script>
