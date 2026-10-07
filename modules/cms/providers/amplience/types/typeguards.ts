import type {
  AmplienceContentItem,
  Text,
  RichText,
  Image,
  Video,
  Button,
  Section,
  Grid,
  Divider,
  Slider,
  Accordion,
  ProductSlider,
  SmartSortingProducts,
  RecentlyViewedProducts,
  Link,
} from '../types/gen'

export const isTextComponent = (item: AmplienceContentItem): item is Text => {
  return item.componentType === 'text'
}

export const isRichTextComponent = (
  item: AmplienceContentItem,
): item is RichText => {
  return item.componentType === 'richText'
}

export const isImageComponent = (item: AmplienceContentItem): item is Image => {
  return item.componentType === 'image'
}

export const isVideoComponent = (item: AmplienceContentItem): item is Video => {
  return item.componentType === 'video'
}

export const isButtonComponent = (
  item: AmplienceContentItem,
): item is Button => {
  return item.componentType === 'button'
}

export const isLinkComponent = (item: AmplienceContentItem): item is Link => {
  return item.componentType === 'link'
}

export const isSectionComponent = (
  item: AmplienceContentItem,
): item is Section => {
  return item.componentType === 'section'
}

export const isGridComponent = (item: AmplienceContentItem): item is Grid => {
  return item.componentType === 'grid'
}

export const isDividerComponent = (
  item: AmplienceContentItem,
): item is Divider => {
  return item.componentType === 'divider'
}

export const isSliderComponent = (
  item: AmplienceContentItem,
): item is Slider => {
  return item.componentType === 'slider'
}

export const isAccordionComponent = (
  item: AmplienceContentItem,
): item is Accordion => {
  return item.componentType === 'accordion'
}

export const isProductSliderComponent = (
  item: AmplienceContentItem,
): item is ProductSlider => {
  return item.componentType === 'productSlider'
}

export const isSmartSortingProductsSliderComponent = (
  item: AmplienceContentItem,
): item is SmartSortingProducts => {
  return item.componentType === 'smartSorting'
}

export const isRecentlyViewedProductsComponent = (
  item: AmplienceContentItem,
): item is RecentlyViewedProducts => {
  return item.componentType === 'recentlyViewed'
}
