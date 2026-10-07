/**
 * Amplience content-type TypeScript definitions.
 *
 * Component types below are generated from exported JSON schemas via
 * `CMS_PROVIDER=amplience pnpm cms:sync`.
 *
 * Baseline types cover content types not yet exported from your hub.
 */

export type {
  AccordionComponent,
  Content,
  Accordion,
} from './accordion-component'
export type { AccordionItemComponent } from './accordion-item-component'
export type { ButtonComponent, Style, Button } from './button-component'
export type { DividerComponent, Height, Divider } from './divider-component'
export type {
  GridComponent,
  GapSizeBetweenColumnsDesktop,
  GapSizeBetweenRowsDesktop,
  GapSizeBetweenColumnsMobile,
  GapSizeBetweenRowsMobile,
  VerticalContentAlignment,
  HorizontalContentAlignment,
  ColumnContent,
  Grid,
} from './grid-component'
export type {
  ImageComponent,
  ImageDesktop,
  ImageMobile,
  AspectRatioDesktop,
  AspectRatioMobile,
  Image,
} from './image-component'
export type { LinkComponent, URLType, Link } from './link-component'
export type { PageComponent, Robots } from './page-component'
export type {
  ProductListingPageComponent,
  TeaserContent,
  SEOContent,
} from './product-listing-page-component'
export type {
  ProductSliderComponent,
  Products,
  ProductSlider,
} from './product-slider-component'
export type {
  RecentlyViewedProductsComponent,
  Padding,
  RecentlyViewedProducts,
} from './recently-viewed-products-component'
export type { RichTextComponent, RichText } from './rich-text-component'
export type {
  SectionComponent,
  BackgroundImageDesktop,
  BackgroundImageMobile,
  Section,
} from './section-component'
export type { SliderComponent, Slider } from './slider-component'
export type {
  SmartSortingProductsSliderComponent,
  SmartSortingKey,
  SmartSortingProducts,
} from './smart-sorting-products-slider-component'
export type { TextComponent, TextType, Text } from './text-component'
export type {
  VideoComponent,
  Video,
  PreviewImageDesktop,
  PreviewImageMobile,
  AspectRatio,
} from './video-component'

/** Amplience delivery metadata attached to every content item. */
export interface AmplienceMeta {
  /** Schema URI identifying the content type */
  schema?: string
  /** Stable delivery identifier for visualization annotations */
  deliveryId?: string
  /** Delivery key when set on the content item */
  deliveryKey?: string
}

/** Base shape for Amplience delivery responses with optional nested content wrapper. */
export type AmplienceContentItem<T = Record<string, unknown>> = T & {
  _meta?: AmplienceMeta
  content?: unknown
  [key: string]: unknown
}

/** Dynamic Media image link delivered by Amplience. */
export interface AmplienceImageLink {
  /** Media CDN host */
  defaultHost: string
  /** Media endpoint identifier */
  endpoint: string
  /** Asset name within the endpoint */
  name: string
}
