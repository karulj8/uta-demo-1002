import type {
  GridComponent,
  DividerComponent,
  SmartSortingProductsSliderComponent,
  ImageComponent,
  AccordionItemComponent,
  AccordionComponent,
  TextComponent,
  VideoComponent,
  ButtonComponent,
  LinkComponent,
  RecentlyviewedproductsComponent,
  RichtextComponent,
  SectionComponent,
  SliderComponent,
} from './gen/contentstack'

export const isVideoComponent = (
  element: object,
): element is VideoComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'video-component'
  )
}

export const isTextComponent = (element: object): element is TextComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'text-component'
  )
}

export const isAccordionComponent = (
  element: object,
): element is AccordionComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'accordion-component'
  )
}

export const isAccordionItemComponent = (
  element: object,
): element is AccordionItemComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'accordion_item-component'
  )
}

export const isButtonComponent = (
  element: object,
): element is ButtonComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'button-component'
  )
}

export const isDividerComponent = (
  element: object,
): element is DividerComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'divider-component'
  )
}

export const isGridComponent = (element: object): element is GridComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'grid-component'
  )
}

export const isImageComponent = (
  element: object,
): element is ImageComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'image-component'
  )
}

export const isLinkComponent = (element: object): element is LinkComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'link-component'
  )
}

export const isRecentlyViewedProductsComponent = (
  element: object,
): element is RecentlyviewedproductsComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'recentlyviewedproducts-component'
  )
}

export const isRichTextComponent = (
  element: object,
): element is RichtextComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'richtext-component'
  )
}

export const isSectionComponent = (
  element: object,
): element is SectionComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'section-component'
  )
}

export const isSliderComponent = (
  element: object,
): element is SliderComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'slider-component'
  )
}

export const isSmartSortingProductsSliderComponent = (
  element: object,
): element is SmartSortingProductsSliderComponent => {
  return (
    element &&
    '_content_type_uid' in element &&
    element._content_type_uid === 'smart_sorting_products_slider-component'
  )
}
