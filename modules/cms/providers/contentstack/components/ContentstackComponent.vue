<template>
  <TextComponent
    v-if="isTextComponent(contentElement)"
    :content-element="contentElement"
  />
  <AccordionComponent
    v-else-if="isAccordionComponent(contentElement)"
    :content-element="contentElement"
  />
  <AccordionItemComponent
    v-else-if="isAccordionItemComponent(contentElement)"
    :content-element="contentElement"
  />
  <ButtonComponent
    v-else-if="isButtonComponent(contentElement)"
    :content-element="contentElement"
  />
  <DividerComponent
    v-else-if="isDividerComponent(contentElement)"
    :content-element="contentElement"
  />
  <GridComponent
    v-else-if="isGridComponent(contentElement)"
    :content-element="contentElement"
  />
  <ImageComponent
    v-else-if="isImageComponent(contentElement)"
    :content-element="contentElement"
  />
  <LinkComponent
    v-else-if="isLinkComponent(contentElement)"
    :content-element="contentElement"
  />
  <RecentlyViewedProductsComponent
    v-else-if="isRecentlyViewedProductsComponent(contentElement)"
    :content-element="contentElement"
  />
  <RichTextComponent
    v-else-if="isRichTextComponent(contentElement)"
    :content-element="contentElement"
  />
  <SectionComponent
    v-else-if="isSectionComponent(contentElement)"
    :content-element="contentElement"
  />
  <SliderComponent
    v-else-if="isSliderComponent(contentElement)"
    :content-element="contentElement"
  />
  <SmartSortingProductsSliderComponent
    v-else-if="isSmartSortingProductsSliderComponent(contentElement)"
    :content-element="contentElement"
  />
  <VideoComponent
    v-else-if="isVideoComponent(contentElement)"
    :content-element="contentElement"
  />
  <div v-else-if="showNotImplemented">
    The CMS content element '{{ (contentElement as any)._content_type_uid }}'
    has not yet been implemented!
  </div>
</template>
<script setup lang="ts">
import type {
  TextComponent as TextComponentType,
  AccordionComponent as AccordionComponentType,
  AccordionItemComponent as AccordionItemComponentType,
  ButtonComponent as ButtonComponentType,
  DividerComponent as DividerComponentType,
  GridComponent as GridComponentType,
  ImageComponent as ImageComponentType,
  LinkComponent as LinkComponentType,
  RecentlyviewedproductsComponent as RecentlyviewedproductsComponentType,
  RichtextComponent as RichtextComponentType,
  SectionComponent as SectionComponentType,
  SliderComponent as SliderComponentType,
  SmartSortingProductsSliderComponent as SmartSortingProductsSliderComponentType,
  VideoComponent as VideoComponentType,
} from '../types/gen/contentstack'
import {
  isAccordionItemComponent,
  isAccordionComponent,
  isButtonComponent,
  isDividerComponent,
  isGridComponent,
  isImageComponent,
  isLinkComponent,
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
import AccordionItemComponent from './AccordionItemComponent.vue'
import ButtonComponent from './ButtonComponent.vue'
import DividerComponent from './DividerComponent.vue'
import GridComponent from './GridComponent.vue'
import ImageComponent from './ImageComponent.vue'
import LinkComponent from './LinkComponent.vue'
import RecentlyViewedProductsComponent from './RecentlyViewedProductsComponent.vue'
import RichTextComponent from './RichTextComponent.vue'
import SectionComponent from './SectionComponent.vue'
import SliderComponent from './SliderComponent.vue'
import SmartSortingProductsSliderComponent from './SmartSortingProductsSliderComponent.vue'
import VideoComponent from './VideoComponent.vue'

const showNotImplemented = import.meta.dev || import.meta.test

const { contentElement } = defineProps<{
  contentElement:
    | VideoComponentType
    | TextComponentType
    | AccordionComponentType
    | AccordionItemComponentType
    | ButtonComponentType
    | DividerComponentType
    | GridComponentType
    | ImageComponentType
    | LinkComponentType
    | RecentlyviewedproductsComponentType
    | RichtextComponentType
    | SectionComponentType
    | SliderComponentType
    | SmartSortingProductsSliderComponentType
}>()
</script>
