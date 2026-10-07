<template>
  <TextComponent
    v-if="isTextComponent(contentElement) && contentElement.text"
    :content-element="contentElement.text"
  />
  <AccordionComponent
    v-else-if="isAccordionComponent(contentElement) && contentElement.accordion"
    :content-element="contentElement.accordion"
  />
  <ButtonComponent
    v-else-if="isButtonComponent(contentElement) && contentElement.button"
    :content-element="contentElement.button"
  />
  <DividerComponent
    v-else-if="isDividerComponent(contentElement) && contentElement.divider"
    :content-element="contentElement.divider"
  />
  <GridComponent
    v-else-if="isGridComponent(contentElement) && contentElement.grid"
    :content-element="contentElement.grid"
  />
  <ImageComponent
    v-else-if="isImageComponent(contentElement) && contentElement.image"
    :content-element="contentElement.image"
  />
  <LinkComponent
    v-else-if="isLinkComponent(contentElement) && contentElement.link"
    :content-element="contentElement.link"
  />
  <RecentlyViewedProductsComponent
    v-else-if="
      isRecentlyViewedProductsComponent(contentElement) &&
      contentElement.recentlyViewed
    "
    :content-element="contentElement.recentlyViewed"
  />
  <RichTextComponent
    v-else-if="isRichTextComponent(contentElement) && contentElement.richText"
    :content-element="contentElement.richText"
  />
  <SectionComponent
    v-else-if="isSectionComponent(contentElement) && contentElement.section"
    :content-element="contentElement.section"
  />
  <SliderComponent
    v-else-if="isSliderComponent(contentElement) && contentElement.slider"
    :content-element="contentElement.slider"
  />
  <ProductSliderComponent
    v-else-if="
      isProductSliderComponent(contentElement) && contentElement.productSlider
    "
    :content-element="contentElement.productSlider"
  />
  <SmartSortingProductsSliderComponent
    v-else-if="
      isSmartSortingProductsSliderComponent(contentElement) &&
      contentElement.smartSorting
    "
    :content-element="contentElement.smartSorting"
  />
  <VideoComponent
    v-else-if="isVideoComponent(contentElement) && contentElement.video"
    :content-element="contentElement.video"
  />
  <div v-else-if="showNotImplemented">
    The CMS content element '{{ contentElement.componentType }}' has not yet
    been implemented!
  </div>
</template>
<script setup lang="ts">
import type { AmplienceContentItem } from '../types/gen'
import {
  isAccordionComponent,
  isButtonComponent,
  isDividerComponent,
  isGridComponent,
  isImageComponent,
  isLinkComponent,
  isProductSliderComponent,
  isRecentlyViewedProductsComponent,
  isRichTextComponent,
  isSectionComponent,
  isSliderComponent,
  isSmartSortingProductsSliderComponent,
  isTextComponent,
  isVideoComponent,
} from '../types/typeguards'
import TextComponent from './TextComponent.vue'
import AccordionComponent from './AccordionComponent.vue'
import ButtonComponent from './ButtonComponent.vue'
import DividerComponent from './DividerComponent.vue'
import GridComponent from './GridComponent.vue'
import ImageComponent from './ImageComponent.vue'
import LinkComponent from './LinkComponent.vue'
import RecentlyViewedProductsComponent from './RecentlyViewedProductsComponent.vue'
import RichTextComponent from './RichTextComponent.vue'
import SectionComponent from './SectionComponent.vue'
import SliderComponent from './SliderComponent.vue'
import ProductSliderComponent from './ProductSliderComponent.vue'
import SmartSortingProductsSliderComponent from './SmartSortingProductsSliderComponent.vue'
import VideoComponent from './VideoComponent.vue'

const showNotImplemented = import.meta.dev || import.meta.test

const { contentElement } = defineProps<{
  contentElement: AmplienceContentItem
}>()

if (!showNotImplemented) {
  console.warn(
    `CMS: Amplience content element '${contentElement.componentType}' has not been implemented`,
  )
}
</script>
