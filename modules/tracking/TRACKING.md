# Tracking Module - Technical Documentation

The tracking module provides comprehensive analytics and tracking functionality for the SCAYLE Storefront Application. It integrates with Google Tag Manager (GTM) to capture user behavior, page views, ecommerce events, and session data for analytics and business intelligence.

> **For basic setup, configuration, and usage examples, see [README.md](./README.md).**
> This document focuses on technical architecture, implementation details, and advanced usage patterns.

## How It Works

The Storefront Application tracking module automatically captures events as users interact with the storefront. When a user navigates between pages, adds items to their basket, or completes checkout, tracking events are sent to Google Tag Manager with enriched context data.

### User-Facing Behavior

- Automatic Tracking
  - Page views are tracked automatically when users navigate between routes.
  - Basket changes (add, remove, quantity updates) trigger tracking events.
  - Checkout progress (shipping, payment, completion) is tracked automatically.
  - Promotions and campaigns are tracked when they become visible in the viewport.

- Manual Tracking
  - Developers can trigger custom events using tracking composables.
  - Product interactions (view, select, add to wishlist) can be tracked explicitly.
  - Search queries and filter applications are tracked for analytics.

### Event Flow

The tracking module follows a consistent event flow for all tracking operations, ensuring all events are properly enriched with context and delivered to analytics platforms.

#### User Action Trigger

A user action initiates the tracking flow. This can be:

- **Navigation**: Route changes detected by middleware (automatic)
- **User Interaction**: Clicks, form submissions, or other UI interactions (manual or automatic)
- **Element Visibility**: Elements entering the viewport via `v-element-visibility` directive (automatic)
- **State Changes**: Basket updates, authentication state changes, or other reactive state mutations (automatic via watchers)

#### Event Capture

The appropriate tracking composable captures the event with relevant data:

- Domain-specific composables (e.g., `useProductEvents`, `useBasketEvents`) extract relevant information from the action
- Event-specific data is collected (product IDs, basket items, checkout steps, etc.)
- The composable prepares a partial tracking event object with event-specific properties

#### Context Enrichment

The `useTracking` composable automatically enriches the event with comprehensive context:

- **Page Context**: Retrieved from `useTrackingContext()`, includes:
  - Current route path and page type (from route meta)
  - Previous page path and type (from tracking state)
  - Optional interaction source (provided by the calling composable)

- **Session Context**: Retrieved from `useTrackingContext()`, includes:
  - Shop information (ID, currency, locale, version)
  - Landing page URL and query parameters (captured on first load)
  - Referrer information (from `document.referrer`)
  - User information (customer ID, type, groups, authentication status, email hash)

- **Ecommerce Data Clearing**: If the event includes ecommerce data, the previous ecommerce object in the dataLayer is cleared first to prevent data pollution between events

#### GTM DataLayer Push

The enriched event is pushed to the GTM dataLayer:

- The `useTracking` composable calls `gtm.push()` with the complete event object
- The push operation only occurs on the client-side (SSR guard prevents server-side pushes)
- The GTM instance must be initialized and available (checked before pushing)

#### GTM Processing

Google Tag Manager processes the event:

- GTM receives the event in the dataLayer
- Triggers configured based on event name and data
- Tags fire according to trigger conditions (analytics platforms, pixels, etc.)
- Events are forwarded to configured analytics platforms (Google Analytics, Facebook Pixel, etc.)

#### Error Handling

The tracking flow includes several safety checks:

- **SSR Guard**: Events are only pushed on the client-side to prevent SSR errors
- **GTM Availability Check**: Verifies GTM is initialized before pushing
- **Data Validation**: Composables validate required data before tracking
- **Graceful Degradation**: If tracking fails, the application continues normally without errors

## Technical Architecture

The tracking module consists of several interconnected components that work together to provide comprehensive tracking functionality.

### Module Structure

```
modules/tracking/
├── index.ts                          # Module setup and configuration
├── runtime/
│   ├── plugins/
│   │   └── gtm.client.ts            # GTM initialization plugin
│   ├── middleware/
│   │   ├── setupTrackingContext.global.ts  # Context management middleware
│   │   └── routeTracker.global.ts          # Route change tracking middleware
│   ├── composables/
│   │   ├── useTracking.ts           # Core tracking composable
│   │   ├── useTrackingContext.ts    # Page and session context
│   │   ├── useTrackingContextState.ts  # Reactive state management
│   │   ├── useGlobalEvents.ts       # Global event tracking
│   │   ├── useBasketEvents.ts       # Basket event tracking
│   │   ├── useCheckoutEvents.ts     # Checkout event tracking
│   │   ├── useProductEvents.ts      # Product event tracking
│   │   ├── useSignInEvents.ts       # Authentication event tracking
│   │   └── ...                      # Additional event composables
│   ├── types/
│   │   └── tracking.ts              # TypeScript type definitions
│   └── utils/                       # Tracking data transformation utilities
```

### Session and Page Context Handling

All tracking events are enriched with page and session context.
This context contains information about the current page, the previous page, the landing page, the referrer, the customer, and the session.

#### Page Context

Page context tracks current and previous page information for navigation analytics:

```typescript
interface TrackingPageContext {
  current_page_path?: string // Current route path
  current_page_type?: PageType // Page type from route meta (e.g., 'pdp', 'category')
  previous_page_path?: string // Previous route path (set on navigation)
  previous_page_type?: PageType // Previous page type (set on navigation)
  interaction_source?: string // Optional source that triggered navigation
}
```

#### Implementation

The tracking module uses a two-layer architecture for context management to ensure both reactivity and SSR compatibility.

The `useTrackingContextState` composable serves as the foundation layer, managing reactive state using Nuxt's `useState` composable. This composable creates two persistent state objects that survive navigation: one for storing the previous page context (path and page type) and another for storing the landing page URL. The state is initialized with empty values and updated by middleware functions during navigation. This layer intentionally avoids calling user-related composables to prevent hydration mismatches during server-side rendering.

The `useTrackingContext` composable builds on top of the state layer, providing computed properties that combine the persistent state with current route information and user data. It reads the current route path and page type from the route meta, combines it with the stored previous page context, and enriches it with session-level data from the shop configuration and user authentication state. The composable computes query parameters from the current route, captures the document referrer (when available client-side), and includes user information such as customer ID, type, groups, and email hash.

```typescript
// Usage in components
const { page, session } = useTrackingContext()

// page.value contains: current_page_path, current_page_type, previous_page_path, previous_page_type
// session.value contains: shop_id, locale, customer_id, landing_page, etc.
```

#### Session Context

Session context captures shop, user, and session metadata that persists throughout the user's session:

```typescript
interface TrackingSessionContext {
  shop_id: number // Shop identifier
  shop_currency: string // Currency code (ISO 4217)
  locale: string // Locale identifier
  shop_version: string // Application version
  landing_page: string // First page visited in session
  parameter: string // Query string from landing page (includes UTM params)
  referrer?: string // External referrer URL
  customer_id?: string // Customer ID (if logged in)
  customer_type?: 'guest' | 'new' | 'existing'
  customer_groups?: string[] // Customer group identifiers
  login: boolean // Authentication status
  login_method?: string // Authentication method
  eh?: string // SHA256 hash of user email
}
```

### Middleware

The tracking module uses two global middleware functions to manage context and track navigation:

#### setupTrackingContext Middleware

The `setupTrackingContext` middleware is a global route middleware that runs on every client-side navigation to maintain accurate page context for tracking. It performs two distinct operations depending on whether it's the initial page load or a subsequent navigation.

On the first client-side load, Nuxt provides a route object where both `from.path` and `to.path` are identical (representing the initial route). When this condition is detected, the middleware captures the complete landing page URL using `window.location.href`, which includes the full path, query parameters (including UTM parameters), and hash fragments. This comprehensive URL is stored in the tracking state and persists throughout the session, enabling accurate attribution analysis.

For all subsequent client-side navigation, the middleware updates the previous page context by storing the `from` route's path and page type. The page type is extracted from the route's meta property, which must be defined in each page component using `definePageMeta`. This previous page information is then available in all tracking events, allowing analytics systems to understand user navigation patterns and measure the effectiveness of different entry points.

```typescript
// Example: Defining pageType in a page component
definePageMeta({
  pageType: 'product_detail', // Required for accurate tracking
})
```

Note: The `pageType` is a type of `PageType` from the `tracking.ts` file.

The middleware includes a server-side guard that immediately returns if executed during SSR, ensuring it only runs in the browser where `window.location` and navigation state are available. This prevents potential errors and ensures the middleware operates only in the appropriate context.

#### routeTracker Middleware

The `routeTracker` middleware automatically tracks content view events whenever users navigate between different routes in the application. It operates as a global middleware, ensuring consistent page view tracking across all navigation events.

The middleware first checks if the navigation represents the initial page load by comparing the `from` and `to` route paths. When these paths are identical, it indicates the first client-side render, and the middleware exits without tracking. This is intentional because the initial page view is handled separately by the GTM plugin, which tracks it on the `page:loading:end` Nuxt hook after user data has been loaded. This separation ensures the initial page view includes complete session context.

For all subsequent navigation where the paths differ, the middleware calls `trackContentView()` from the `useGlobalEvents` composable. This function automatically enriches the event with current page and session context, including the previous page information that was set by the `setupTrackingContext` middleware. The event is then pushed to the GTM dataLayer with all relevant context, enabling comprehensive page view analytics without requiring manual tracking calls in each page component.

##### Promotion and Campaign Banners

Promotion banners and campaign displays track visibility to measure campaign exposure. When a banner becomes visible, it triggers a `view_promotion` event that includes promotion details, discount information, and campaign metadata. This allows marketing teams to understand which promotions users actually see, not just which ones are rendered on the page.

##### Product Cards in Listing Pages

Product cards in listing pages can track visibility to measure product impression rates. This helps identify which products are most frequently viewed and which positions in product grids receive the most attention, enabling optimization of product placement and merchandising strategies.

#### Benefits

- **Accurate Impressions**: Only tracks when users actually see content, providing true impression metrics rather than just render counts.
- **Performance Optimized**: Uses the native Intersection Observer API for efficient visibility detection without continuous polling or layout calculations.
- **One-Time Tracking**: The callback receives visibility state changes, allowing components to implement guards that prevent duplicate tracking when elements repeatedly enter and leave the viewport.

## Usage

### Basic Usage

#### Tracking Page Views

Page views are tracked automatically by the `routeTracker` middleware. No manual implementation is required.

#### Tracking Custom Events

For custom tracking needs that don't fit into the predefined event categories, developers can use the `useTracking` composable directly. This composable provides a `push` function that accepts a partial tracking event object. The function automatically merges the provided data with current page and session context before pushing to GTM, ensuring all custom events include consistent context information.

When using `useTracking` directly, developers should provide at minimum an `event` property with the event name. Additional properties can be included as needed, and they will be merged with the automatic context data. This approach is useful for tracking application-specific events that don't fit standard ecommerce or user interaction patterns.

```typescript
// Example: Custom event tracking
const { push } = useTracking()

push({
  event: 'custom_event',
  custom_property: 'value',
  // Page and session context are automatically added
})
```

Object added to the `dataLayer`:

```json
{
  "event": "custom_event",
  "custom_property": "value",
  "page": {
    "current_page_path": "/p/123",
    "current_page_type": "product_detail",
    "previous_page_path": "/",
    "previous_page_type": "homepage",
    "interaction_source": "button"
  },
  "session": {
    "shop_id": 123,
    "shop_currency": "EUR",
    "locale": "de-DE",
    "shop_version": "1.0.0",
    "landing_page": "http://localhost:3000/",
    "parameter": "",
    "referrer": "https://google.com",
    "login": false,
    "customer_id": "123",
    "customer_type": "guest",
    "customer_groups": [],
    "login_method": "email",
    "eh": "1234567890"
  }
```

#### Tracking Product Interactions

Product interactions are tracked using the `useProductEvents` composable, which provides specialized functions for common product-related events. The `trackViewItem` function records when users view individual product details, typically called when a product detail page loads or when a product is displayed in a modal or preview. It requires the product object and an interaction source identifier to indicate where the view occurred.

The `trackSelectItem` function records when users click or interact with a product, such as clicking a product card or image. This event is important for measuring product interest and click-through rates. It includes the product, interaction source, and optional index position for list-based views.

The `trackAddToBasket` function records when products are added to the basket. It requires the variant, product, and quantity information to accurately track basket additions with complete product context.

```typescript
// Example: Product interaction tracking
const { trackViewItem, trackSelectItem } = useProductEvents()

// Track product view
trackViewItem(product, 'product_listing')

// Track product selection (click)
trackSelectItem(product, 'product_grid', index)
```

#### Tracking Basket Events

Basket operations are tracked using the `useBasketEvents` composable, which provides functions for all basket-related interactions. The `trackAddToBasket` function records additions to the basket with variant, product, and quantity information. The `trackRemoveFromBasket` function records removals and includes an interaction source to indicate where the removal occurred (e.g., from the basket page, checkout, or a flyout).

The `trackViewCart` function records when users view the basket page, including the current basket cost and all items. This event is typically triggered automatically when the basket page loads and the basket data is successfully fetched, providing analytics with complete basket state information.

```typescript
// Example: Basket event tracking
const { trackAddToBasket, trackRemoveFromBasket } = useBasketEvents()

// Track add to basket
trackAddToBasket(variant, product, quantity)

// Track remove from basket
trackRemoveFromBasket(basketItem, 'basket')
```

### Element Visibility Tracking

Element visibility tracking uses the `v-element-visibility` directive from VueUse to detect when elements enter the viewport. Components apply this directive to elements that should trigger tracking when they become visible, such as product sliders, promotion banners, or recommendation sections.

The directive accepts a callback function that receives a boolean parameter indicating visibility state.
Components typically check that the element is visible (state is `true`) and that the necessary data is loaded before triggering tracking events. This ensures tracking only occurs when users actually see the content and when the data is available for accurate event payloads.

The callback function should handle edge cases such as missing data or elements that repeatedly enter and leave the viewport. Many implementations include guards to prevent duplicate tracking, such as a ref flag that indicates whether the element has already been tracked.

```vue
<template>
  <div v-element-visibility="onVisible">
    <!-- Content to track -->
  </div>
</template>

<script setup lang="ts">
import { vElementVisibility } from '@vueuse/components'
import { ref } from 'vue'

const hasTracked = ref(false)

const onVisible = (isVisible: boolean) => {
  if (!isVisible || hasTracked.value || !products.value) {
    return
  }

  hasTracked.value = true
  trackViewItemList(products.value, 'slider')
}
</script>
```

Keep in mind that the `v-element-visibility` is triggered every time the element is visible or invisible. So you need to add a guard to prevent duplicate tracking.
So the tracking event will be triggered multiple times if the element is visible and invisible repeatedly.

For further details, see the [VueUse useElementVisibility](https://vueuse.org/core/useElemenstVisibility/) documentation.

### Checkout Integration

The checkout page integrates the SCAYLE Checkout Web Component through a message event listener. The web componentsends tracking events via `postMessage` to the parent page. The checkout page registers a message event listener using VueUse's `useEventListener` composable, which automatically handles cleanup when the component unmounts.

The event handler function receives message events from the web component and examines the event type to determine which tracking function to call. It extracts relevant data from the web component event payload and maps it to the appropriate tracking composable function. This integration ensures all checkout interactions within the web component are properly tracked with the correct context and basket information.

```typescript
// Example: Setting up checkout event listener
import { useEventListener } from '@vueuse/core'
import { useCheckoutEvents } from '#tracking/composables'

const { trackAddPaymentInfo, trackCompleteCheckout } = useCheckoutEvents()

const handleTrackingEvent = (event: MessageEvent<CheckoutEvent>) => {
  const actionType = event.data.event?.event

  if (actionType === 'add_payment_info') {
    trackAddPaymentInfo(event.data.event?.payment_type, basket.value?.items)
  }
  // Handle other event types...
}

useEventListener(window, 'message', (event: MessageEvent<CheckoutEvent>) => {
  if (event.data.type === 'tracking') {
    handleTrackingEvent(event)
  }
})
```

> **Note:** The SCAYLE Checkout Web Component also sends tracking events directly to the `dataLayer`. To prevent duplicate tracking events, disable tracking in the checkout web component configuration or in the SCAYLE Panel.

For further details, see the [Checkout Tracking](https://scayle.dev/en/core-documentation/storefront/checkout-guide/tracking) documentation.

### Authentication Tracking

Authentication tracking is implemented in authentication composables or components that handle login and registration forms. After attempting to authenticate a user (either through login or sign-up), the code calls the appropriate tracking function with the result of the operation.

For login and registration attempts, the code typically listens to the `auth:success` and `auth:error` events from the checkout web component and calls the appropriate tracking function with the result of the operation.
If the `source` of the event is `login` or `register`, the code calls the appropriate tracking function with the result of the operation.

Logout tracking is typically called directly when the logout action is triggered, as logout operations are generally synchronous and don't require result checking.

```typescript
useEventListener('scayle.auth.ready', () => {
  auth.events.listen(
    'auth:success',
    ({ source }: { source: AUTH_FLOW_SOURCE }) => {
      trackAuthenticationType(source, true) // track successful authentication
    },
  )

  auth.events.listen(
    'auth:error',
    ({ source }: { source: AUTH_FLOW_SOURCE }) => {
      trackAuthenticationType(source, false) // track failed authentication
    },
  )

  // ...
})
```

For further details, see the [Shop-Side Authentication](https://scayle.dev/en/core-documentation/checkout-guide/authentication-accounts/components/authenticate#shop-side-authentication) documentation.

## Troubleshooting

### Events Not Appearing in GTM

**Problem**: Events are not appearing in GTM and `dataLayer` is empty.

**Solutions**:

1. Verify GTM ID is set in `runtimeConfig.public.tracking.gtm` as runtime config
2. Check browser console for GTM initialization errors
3. Check browser network tab for GTM script requests
4. Verify GTM container is published and active

**Debugging**:

```typescript
// useTracking composable
const push = (data: Partial<TrackingEvent>) => {
  console.log('Data:', data)
  if ('ecommerce' in data) {
    tagManager.proxy.dataLayer.push({ ecommerce: null }) // Clear the previous ecommerce object
  }

  tagManager.proxy.dataLayer.push({
    ...data,
    page: {
      ...page.value,
      interaction_source: data.page?.interaction_source,
    },
    session: session.value,
  })
}
```

### Duplicate Events Being Tracked

**Problem**: Events that should be tracked only once are being tracked multiple times.

**Solutions**:

1. Check for duplicate middleware or plugin registrations
2. Check watchers for duplicate tracking and use `once: true` option to prevent multiple tracking.

## Additional Resources

- [SCAYLE Storefront API Documentation](https://scayle.dev/) - API reference for storefront functionality
- [Google Tag Manager Documentation](https://developers.google.com/tag-manager) - GTM implementation guide
- [VueUse Documentation](https://vueuse.org/) - Vue composition utilities including `v-element-visibility`
- [Nuxt 3 Documentation](https://nuxt.com/docs) - Nuxt framework documentation
- [Checkout Tracking](https://scayle.dev/en/core-documentation/storefront/checkout-guide/tracking) - Checkout tracking guide
- [Shop-Side Authentication](https://scayle.dev/en/core-documentation/checkout-guide/authentication-accounts/components/authenticate#shop-side-authentication)
