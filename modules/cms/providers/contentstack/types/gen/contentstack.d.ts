type BuildTuple<T, N extends number, R extends T[] = []> = R['length'] extends N
  ? R
  : BuildTuple<T, N, [...R, T]>

type TuplePrefixes<T extends any[]> = T extends [any, ...infer Rest]
  ? T | TuplePrefixes<Rest extends any[] ? Rest : []>
  : []

type MaxTuple<T, N extends number> = TuplePrefixes<BuildTuple<T, N>>

export interface PublishDetails {
  environment: string
  locale: string
  time: string
  user: string
}

export interface File {
  uid: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  content_type: string
  file_size: string
  tags: string[]
  filename: string
  url: string
  ACL: any[] | object
  is_dir: boolean
  parent_uid: string
  _version: number
  title: string
  _metadata?: object
  description?: string
  dimension?: {
    height: number
    width: number
  }
  publish_details: PublishDetails
}

export interface Link {
  title: string
  href: string
}

export interface Taxonomy {
  taxonomy_uid: string
  max_terms?: number
  mandatory: boolean
  non_localizable: boolean
}

export type TaxonomyEntry = Taxonomy & { term_uid: string }

export interface JSONRTENode {
  type: string
  uid: string
  _version: number
  attrs: Record<string, any>
  children?: JSONRTENode[]
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  src?: string
  alt?: string
  href?: string
  target?: string
  embed?: {
    type: string
    uid: string
    _version: number
    attrs: Record<string, any>
  }
}

export interface SystemFields {
  uid?: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  _content_type_uid?: string
  tags?: string[]
  ACL?: any[]
  _version?: number
  _in_progress?: boolean
  locale?: string
  publish_details?: PublishDetails
  title?: string
}

export type ModularBlocksExtension<T> = {
  [P in keyof T]?: T[P] & { _metadata?: { uid?: string } }
}

/** A spacing element that creates visual separation between content sections. Use dividers to break up long pages and improve readability. */
export interface DividerComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Height */
  height?: ('small' | 'medium' | 'large') | null
  /** Show Line */
  show_line: boolean
}

/** A collapsible container that displays multiple expandable items, perfect for FAQs, product information, or any content that needs to be organized in a space-efficient way. */
export interface AccordionComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Display Title */
  display_title: string
  /** Content */
  content: AccordionItemComponent[]
}

/** Displays a video with a preview image. The video can autoplay or require user interaction to start. */
export interface VideoComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Video */
  video: File
  /** Preview Image - Desktop */
  previewimagedesktop: File
  /** Preview Image - Mobile */
  previewimagemobile?: File | null
  /** Aspect Ratio */
  aspect_ratio?: ('1:1' | '16:9' | '4:3') | null
  /** Autoplay */
  autoplay: boolean
  /** Muted */
  muted: boolean
  /** Loop */
  loop: boolean
  /** Show Controls */
  show_controls: boolean
}

/** An interactive button that can link to other pages or trigger actions. Use buttons for call-to-action elements like "Add to Cart", "Learn More", or "Contact Us". */
export interface ButtonComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** URL */
  url: string
  /** Open In New Tab */
  open_in_new_tab: boolean
  /** Text */
  text: string
  /** Style */
  style?: ('primary' | 'secondary' | 'outline' | 'accent') | null
}

/** A simple text element that can display as a heading or paragraph. Use this for short text content that doesn't need rich formatting. */
export interface TextComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Content */
  content: string
  /** Text Type */
  text_type?: ('p' | 'h1' | 'h2' | 'h3' | 'h4') | null
}

/** Displays an image with responsive behavior, showing different images on mobile and desktop if needed. Images automatically optimize for performance. */
export interface ImageComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Image Desktop */
  image_desktop: File
  /** Image Mobile */
  image_mobile?: File | null
  /** Alt Text */
  alt_text: string
  /** Aspect Ratio Desktop */
  aspect_ratio_desktop?: ('original' | '1:1' | '16:9' | '3:4') | null
  /** Aspect Ratio Mobile */
  aspect_ratio_mobile?: ('original' | '1:1' | '16:9' | '4:3') | null
}

/** A single expandable item within an accordion. Each item has a title that users click to reveal or hide the content inside. */
export interface AccordionItemComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Display Title */
  display_title?: string
  /** Content */
  content?: (
    | VideoComponent
    | TextComponent
    | SmartSortingProductsSliderComponent
    | SliderComponent
    | RichtextComponent
    | LinkComponent
    | ImageComponent
    | GridComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
}

/** A flexible text editor that supports formatting, links, lists, and headings. Use this for longer-form content that needs rich formatting options. */
export interface RichtextComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Content */
  content: {
    type: string
    uid: string
    _version: number
    attrs: Record<string, any>
    children: JSONRTENode[]
  }
}

/** A product slider that automatically selects and displays products using smart sorting algorithms. Perfect for showing personalized or algorithm-driven product recommendations. */
export interface SmartSortingProductsSliderComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Display Title */
  display_title?: string
  /** Smart Sorting Key */
  smart_sorting_key:
    | 'scayle:v1:sales-push'
    | 'scayle:v1:new-arrivals'
    | 'scayle:v1:balanced-offerings'
    | 'scayle:v1:inventory-optimization'
    | 'scayle:v1:luxury-promotion'
    | 'scayle:v1:stock-coverage'
    | 'scayle:v1:topseller'
    | 'scayle:v1:revenue-max'
    | 'scayle:v1:recently-popular'
    | 'scayle:v1:trending'
  /** Category ID */
  category_id?: number | null
  /** Brand ID */
  brand_id?: number | null
  /** Limit */
  limit?: number | null
}

/** A flexible layout tool that arranges content in columns. Perfect for creating side-by-side layouts, product grids, or any organized content arrangement. */
export interface GridComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Desktop */
  desktop?: {
    /** Number of Columns - Desktop */
    number_of_columns_desktop: number
    /** Gap Column - Desktop */
    gap_column_desktop?: ('small' | 'medium' | 'large' | 'none') | null
    /** Gap Row - Desktop */
    gap_row_desktop?: ('small' | 'medium' | 'large' | 'none') | null
  }
  /** Mobile */
  mobile?: {
    /** Number of Columns - Mobile */
    number_of_columns_mobile: number
    /** Gap Column - Mobile */
    gap_column_mobile?: ('small' | 'medium' | 'large' | 'none') | null
    /** Gap Row - Mobile */
    gap_row_mobile?: ('small' | 'medium' | 'large' | 'none') | null
  }
  /** Vertical Content Alignment */
  vertical_content_alignment?: ('Top' | 'Middle' | 'Bottom') | null
  /** Horizontal Content Alignmen */
  horizontal_content_alignmen?: ('Left' | 'Center' | 'Right') | null
  /** Content */
  content?: (
    | VideoComponent
    | TextComponent
    | SliderComponent
    | SectionComponent
    | RichtextComponent
    | LinkComponent
    | ImageComponent
    | GridComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
}

/** A horizontal slider/carousel that displays multiple items one at a time. Users can swipe or use navigation arrows to browse through items. */
export interface SliderComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Show Navigation Arrows */
  show_navigation_arrows: boolean
  /** Show Pagination Indicators */
  show_pagination_indicators: boolean
  /** Content */
  content?: (
    | VideoComponent
    | TextComponent
    | SmartSortingProductsSliderComponent
    | SliderComponent
    | SectionComponent
    | RichtextComponent
    | LinkComponent
    | ImageComponent
    | GridComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
}

/** A clickable link that can wrap around other content (like images or text). Use this to make entire sections clickable, not just buttons. */
export interface LinkComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** URL */
  url: string
  /** Open In New Tab */
  open_in_new_tab: boolean
  /** Content */
  content: (TextComponent | ImageComponent)[]
}

/** A specialized page component for product category/listing pages. It includes both teaser content (shown at the top) and SEO content (shown at the bottom). */
export interface ProductlistingpageComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** URL */
  url: string
  /** Teaser Content */
  teaser_content?: (
    | TextComponent
    | SliderComponent
    | SectionComponent
    | ImageComponent
  )[]
  /** SEO Content */
  seo_content?: (
    | VideoComponent
    | TextComponent
    | SliderComponent
    | SectionComponent
    | RichtextComponent
    | RecentlyviewedproductsComponent
    | LinkComponent
    | ImageComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
}

/** A container component that groups related content together. Sections can have backgrounds, padding, and alignment options. Think of it as a "box" for organizing content. */
export interface SectionComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Background Color */
  background_color?: string
  /** Background Image Desktop */
  background_image_desktop?: File | null
  /** Background Image Mobile */
  background_image_mobile?: File | null
  /** Padding */
  padding?: ('small' | 'medium' | 'large' | 'none') | null
  /** Min. Height - Desktop */
  min_height_desktop?: number | null
  /** Min. Height - Mobile */
  min_height_mobile?: number | null
  /** Horizontal Content Alignment */
  horizontal_content_alignment?: ('Left' | 'Center' | 'Right') | null
  /** Vertical Content Alignment */
  vertical_content_alignment?: ('Top' | 'Middle' | 'Bottom') | null
  /** Content */
  content?: (
    | VideoComponent
    | TextComponent
    | SmartSortingProductsSliderComponent
    | SliderComponent
    | SectionComponent
    | RichtextComponent
    | LinkComponent
    | ImageComponent
    | GridComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
}

/** Automatically displays products that the current user has recently viewed. Great for personalization and encouraging return visits to products. */
export interface RecentlyviewedproductsComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** Padding */
  padding?: ('small' | 'medium' | 'large' | 'none') | null
}

/** The main page component that contains all page content and SEO settings. This is typically the root component for any page. */
export interface PageComponent extends SystemFields {
  /** Version */
  _version?: number
  /** Title */
  title: string
  /** URL */
  url: string
  /** Content */
  content?: (
    | VideoComponent
    | TextComponent
    | SmartSortingProductsSliderComponent
    | SliderComponent
    | SectionComponent
    | RichtextComponent
    | RecentlyviewedproductsComponent
    | LinkComponent
    | ImageComponent
    | GridComponent
    | DividerComponent
    | ButtonComponent
    | AccordionComponent
  )[]
  /** SEO */
  seo?: {
    /** Meta Title */
    meta_title?: string
    /** Meta Description */
    meta_description?: string
    /** Robots */
    robots?:
      | (
        | 'index, follow'
        | 'noindex, nofollow'
        | 'index, nofollow'
        | 'noindex, follow'
      )
      | null
  }
}
