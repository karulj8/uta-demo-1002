import type {
  AuthenticationType,
  CentAmount,
  ShopUser,
} from '@scayle/storefront-nuxt'

/**
 * Authentication-related tracking events for analytics.
 * Used in authentication composables and checkout flows to track user authentication actions.
 */
export type TrackingAuthEvent =
  | 'login'
  | 'logout'
  | 'sign_up'
  | 'forgot_password'
  | 'reset_password'
  | 'guest_login'

/**
 * Page type identifiers for tracking page views and navigation.
 * Used in route meta, tracking context, and analytics systems to categorize page visits.
 * Allows string values for custom page types not covered by predefined types.
 */
export type PageType =
  | 'account'
  | 'account:user'
  | 'account:order_id'
  | 'account:orders'
  | 'basket'
  | 'product_listing'
  | 'checkout'
  | 'checkout:#/shipping'
  | 'checkout:#/payment'
  | 'checkout:#/auth'
  | 'content'
  | 'homepage'
  | 'location'
  | 'order_success'
  | 'product_detail'
  | 'search_results'
  | 'signin'
  | 'subscription'
  | 'subscription_cancellation'
  | 'wishlist'

/**
 * Customer classification based on account status and history.
 * Used in tracking and analytics to segment users for behavior analysis.
 */
export type TrackingCustomerType = 'guest' | 'new' | 'existing'

/**
 * Source of user interaction that triggered a tracking event.
 * Used in tracking events to identify which UI component or modal triggered the action.
 */
export type TrackingInteractionSource =
  | 'basket_preview_flyout'
  | 'change_shop_flyout'
  | 'country_detection_modal'
  | 'user_flyout'
  | 'filter_flyout'
  | 'add_product_modal'
  | 'recommendation_slider'
  | 'recently_viewed_slider'
  | 'sibling_selection'
  | 'gift_products'
  | 'product_detail'
  | 'product_listing'
  | 'search'
  | 'wishlist'
  | 'basket'
  | 'checkout'
  | 'main_menu_flyout'
  | 'deals_flyout'
  | 'remove_product_flyout'

export type TrackingSorting =
  | 'price_asc'
  | 'price_desc'
  | 'reduction_desc'
  | 'top_seller'
  | 'date_newest'

/**
 * Page-level tracking context for navigation and page view analytics.
 * Used in tracking composables to capture current and previous page information.
 * Includes interaction source for tracking user actions that triggered navigation.
 */
export interface TrackingPageContext {
  /** Current page URL path */
  current_page_path?: string
  /** Current page type identifier (e.g., `pdp`, `category`, `basket`) */
  current_page_type?: PageType
  /** Previous page URL path (optional, set during navigation) */
  previous_page_path?: string
  /** Previous page type identifier (optional, set during navigation) */
  previous_page_type?: PageType
  /** Source that triggered the page interaction (optional, e.g., 'button', 'link') */
  interaction_source?: TrackingInteractionSource
}

/**
 * Session-level tracking context containing shop, user, and session metadata.
 * Used in analytics systems to provide session-wide context for all tracking events.
 * Captures landing page information, referrer data, and customer authentication state.
 */
export interface TrackingSessionContext {
  /** Shop identifier number (unique shop ID from SCAYLE) */
  shop_id: number
  /** Shop currency code (ISO 4217 format, e.g., 'EUR', 'USD') */
  shop_currency: string
  /** Locale identifier (e.g., 'de-DE', 'en-US') */
  locale: string
  /** Application version string */
  shop_version: string

  /** Absolute URL of the first page visited in this session */
  landing_page: string
  /** Raw query string from the landing page (includes utm_* parameters) */
  parameter: string
  /** First external referrer URL (optional, only set if user came from external site) */
  referrer?: string

  /** Customer identifier (optional, only set for logged-in users) */
  customer_id?: string
  /** Customer classification (optional, 'guest', 'new', or 'existing') */
  customer_type?: TrackingCustomerType
  /** Customer group identifiers (optional, array of group names) */
  customer_groups?: string[]
  /** Whether user is logged in (defaults to false for guests) */
  login: boolean
  /** Authentication method used (optional, e.g., 'password') */
  login_method?: AuthenticationType
  /** SHA256 hash of user email (optional, never raw email, used for analytics) */
  eh?: string
}

type CartEvent = {
  event: 'add_to_cart' | 'remove_from_cart'
  correlation_id: string
  action: string
  price_bi: string
  ecommerce?: {
    coupon?: string
    currency?: string
    value?: number
    payment_type?: string
    shipping_tier?: string
    items?: TrackingEcommerceItem[]
  }
}

type CompleteCheckoutEvent = {
  event: 'complete_checkout'
  correlation_id: string
  /** Action string with payment method, order ID, and customer ID */
  action: string
}

type PaymentInfoEvent = {
  event: 'add_payment_info'
  payment_type: string
  correlation_id: string
}

type ShippingInfoEvent = {
  event?: 'feature'
  name?: 'add_shipping_info'
  label?: string
  action?: string
  correlation_id?: string
  shipping_type?: string
  shipping_method?: string
  ecommerce?: {
    coupon?: string
    currency?: string
    value?: number
    payment_type?: string
    shipping_tier?: string
    items?: TrackingEcommerceItem[]
  }
}

/**
 * Checkout event used for tracking with Google Tag Manager.
 *
 * @see https://scayle.dev/en/core-documentation/storefront/checkout-guide/implementation/webcomponent#tracking
 */
export interface CheckoutEvent {
  /** Action. */
  action?: 'authenticated'
  /** Type. */
  type?: 'tracking'
  /** User. */
  user: ShopUser
  /**
   * The OAuth 2.0 access token for the authenticated user.
   * This token can be used to access protected resources on behalf of the user.
   *
   * @see https://www.rfc-editor.org/rfc/rfc6749
   */
  accessToken: string
  /**
   * Details about a specific event within the checkout process.
   * This field is optional and is only used when tracking specific actions
   * like `add_to_cart` or `remove_from_cart`.
   *
   * @see https://scayle.dev/en/core-documentation/storefront/checkout-guide/tracking
   */
  event?:
    | CartEvent
    | CompleteCheckoutEvent
    | PaymentInfoEvent
    | ShippingInfoEvent
}

/**
 * Ecommerce item for tracking.
 * Used in tracking events to track items in the basket, wishlist, etc.
 */
export interface TrackingEcommerceItem {
  /** Unique product identifier (e.g., SKU, product ID) */
  item_id?: string
  /** Product name or title */
  item_name?: string
  /** Net item unit price in shop currency */
  price_with_tax?: CentAmount
  /** Gross item unit price in shop currency */
  original_price_with_tax?: CentAmount
  /** Quantity of items */
  quantity?: number
  /** Unique variant identifier (e.g., SKU, variant ID) */
  item_variant?: string

  /** Currency code (ISO 4217 format, e.g., 'EUR', 'USD') */
  currency?: string
  /** Brand name */
  item_brand?: string
  /** Brand identifier */
  item_brand_id?: string
  /** Product size (e.g., 'M', '42', 'Large') */
  item_size?: string
  /** Position index in list (0-based) */
  index?: number
  /** Whether the item is sold out */
  sold_out?: boolean

  /** First category name of the category list for the product */
  item_category?: string
  /** First category identifier of the category list for the product */
  item_category_id?: string
  /** Second category name of the category list for the product */
  item_category2?: string
  /** Second category identifier of the category list for the product */
  item_category2_id?: string
  /** Third category name of the category list for the product */
  item_category3?: string
  /** Third category identifier of the category list for the product */
  item_category3_id?: string
  /** Fourth category name of the category list for the product */
  item_category4?: string
  /** Fourth category identifier of the category list for the product */
  item_category4_id?: string
  /** Fifth category name of the category list for the product */
  item_category5?: string
  /** Fifth category identifier of the category list for the product */
  item_category5_id?: string
  /** List name where item appears (e.g., 'Search Results', 'You May Also Like') */
  item_list_name?: string

  /** Tax amount for this individual item (in shop currency) */
  tax?: CentAmount
  /** Discount amount from sale pricing including tax */
  sale_discount_with_tax?: CentAmount
  /** Discount amount from campaign pricing including tax */
  campaign_discount_with_tax?: CentAmount
  /** Discount amount from promotion pricing including tax */
  promotion_discount_with_tax?: CentAmount
  /** Unique promotion identifier applied to this item */
  promotion_id?: string
  /** Internal promotion name (not displayed to users) */
  promotion_name?: string
  /** Promotion display name shown to users */
  promotion_display_name?: string
  /** Promotion link URL */
  promotion_link?: string
  /** Array of promotion identifiers applied to this item */
  promotions?: string[]
}

/**
 * Ecommerce payload for tracking.
 * Used in tracking events to track items in the basket, wishlist, etc.
 */
export interface TrackingEcommercePayload {
  /** Array of ecommerce items included in the tracking event */
  items?: TrackingEcommerceItem[]
  /** Unique order or transaction reference number (e.g., order ID from checkout) */
  transaction_id?: string
  /** Customer account identifier */
  customer_id?: string
  /** Total basket value including tax and discounts */
  value?: number
  /** Total discount amount from sale pricing including tax */
  sale_reduction_with_tax?: number
  /** Total discount amount from campaigns including tax */
  campaign_reduction_with_tax?: number
  /** Total discount amount from promotions including tax */
  promotion_reduction_with_tax?: number
  /** Array of promotion identifiers applied to the entire basket or transaction */
  promotions?: string[]
  /** Total tax amount for the entire transaction */
  tax?: number
  /** Shipping cost for the order */
  shipping?: number
  /** Currency code for all monetary values (ISO 4217 format, e.g., 'EUR', 'USD') */
  currency?: string
  /** Payment method used for the transaction (e.g., 'credit_card', 'paypal', 'invoice') */
  payment_type?: string
}

/**
 * Standard tracking event names for analytics.
 * Used in tracking events to identify the type of user action or system event being tracked.
 */
export type TrackingEventName =
  | 'filter'
  | 'view_cart'
  | 'page_view'
  | 'view_item'
  | 'view_item_list'
  | 'select_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'refund'
  | 'search'
  | 'login'
  | 'logout'
  | 'sign_up'
  | 'shop_init'
  | 'error'
  | 'content_view'
  | 'shop_change'
  | 'cart'
  | 'wishlist'
  | 'view_promotion'
  | 'select_promotion'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'complete_checkout'

/**
 * Complete tracking event payload for analytics.
 * Used throughout the application to send structured tracking data to analytics systems.
 * Combines event type, page context, session context, and optional ecommerce data.
 */
export interface TrackingEvent {
  /** Type of tracking event being sent */
  event: TrackingEventName
  /** Page-level context for the current page and navigation */
  page: TrackingPageContext
  /** Session-level context with shop, user, and session metadata */
  session: TrackingSessionContext
  /** Ecommerce data with items (optional, used for cart, purchase, etc.) */
  ecommerce?: TrackingEcommercePayload
  /** Additional custom properties for extended tracking data */
  [customKey: string]: unknown
}
