# @scayle/nuxt-tracking

> Nuxt Tracking module for Nuxt 3.
>
> This is an Nuxt 3 module wrapper around [`useScriptGoogleTagManager()`](https://scripts.nuxt.com/scripts/tracking/google-tag-manager) of `@nuxt/scripts` and provides a composable and utilities to manage the tracking.

## Overview

The tracking module enables data-driven decision making by automatically capturing user interactions, navigation patterns, and ecommerce events throughout the Storefront Application. It provides a unified tracking system that enriches all events with consistent page and session context, ensuring accurate analytics reporting.

### Business Value

- **User Behavior Analysis**: Track how users navigate the Storefront Application and interact with products, promotions, and features.
- **Ecommerce Analytics**: Monitor basket additions, removals, checkout progress, and purchase completion for conversion optimization.
- **Campaign Performance**: Measure the effectiveness of promotions and marketing campaigns through visibility and interaction tracking.
- **Session Intelligence**: Capture landing pages, referrers, and user authentication state for comprehensive session analysis.

### Key Features

- Automatic page view tracking with navigation context.
- Session-level context management (shop, user, landing page, referrer).
- Ecommerce event tracking (basket, checkout, purchase).
- Element visibility tracking for promotions and recommendations.
- Checkout web component integration for checkout-specific events.
- Authentication event tracking (login, sign-up, logout).

## Quick Setup

1. As `@scayle/nuxt-tracking` is as local module, it does not need to be installed manually.
   It is also not necessary to add this module to the `nuxt.config.ts` manually, as Nuxt will automatically register this module on application startup.

2. Add configuration in `runtimeConfig.public.tracking.gtm` as module runtime config

**Note:** These configurations will be set implicitly by Nuxt public environment variables. See the example below for the structure, but in practice, values will be automatically mapped from environment variables prefixed with `NUXT_PUBLIC_TRACKING_` (e.g., `NUXT_PUBLIC_TRACKING_ID`, `NUXT_PUBLIC_TRACKING_DEBUG`).
For further details, see the [Nuxt Environment Variables](https://nuxt.com/docs/4.x/guide/going-further/runtime-config#environment-variables).

```ts
export default defineNuxtConfig({
  ...
  runtimeConfig: {
    public: {
      tracking: {
        gtm: {
          /** GTM container ID (format: GTM-XXXXXX) */
          id: 'GTM-xxxxxx',
          /** Authentication token for environment-specific container versions */
          auth: 'token',
          /** Preview environment name */
          preview: 'preview'
          /** Forces GTM cookies to take precedence when true */
          cookiesWin: false,
          /** Enables debug mode when true */
          debug: false,
          /** Environment name for environment-specific container */
          envName: 'Storefront'
          /** Referrer policy for analytics requests */
          authReferrerPolicy: 'origin'
      }
    }
  }
})
```

### Configuration Options

| Option | Type | Default | Description |

| Option               | Type             | Default | Required | Description                                                      |
| -------------------- | ---------------- | ------- | -------- | ---------------------------------------------------------------- |
| `id`                 | `string`         | -       | Yes      | GTM container ID (format: GTM-XXXXXX)                            |
| `auth`               | `string`         | -       | No       | Authentication token for environment-specific container versions |
| `preview`            | `string`         | -       | No       | Preview environment name                                         |
| `cookiesWin`         | `boolean \| 'x'` | -       | No       | Forces GTM cookies to take precedence when true                  |
| `debug`              | `boolean \| 'x'` | -       | No       | Enables debug mode when true                                     |
| `envName`            | `string`         | -       | No       | Environment name for environment-specific container              |
| `authReferrerPolicy` | `string`         | -       | No       | Referrer policy for analytics requests                           |

### Route Meta Configuration

Define page types in route meta for accurate page categorization:

```typescript
// In page component
definePageMeta({
  pageType: 'product_detail', // Required for accurate tracking
})
```

Available page types are defined in the `PageType` type in `types/tracking.ts` file.

## Available Composables

The tracking module provides domain-specific composables for different event types:

- `useTracking()` - Core tracking composable for custom events
- `useProductEvents()` - Product interaction tracking
- `useBasketEvents()` - Basket operation tracking
- `useCheckoutEvents()` - Checkout progress tracking
- `useSignInEvents()` - Authentication event tracking
- `useGlobalEvents()` - Global event tracking (content views, errors, etc.)
- `usePromotionEvents()` - Promotion tracking
- `useSearchEvents()` - Search query tracking
- `useWishlistEvents()` - Wishlist operation tracking

## Direct GTM Access

For advanced use cases, you can access the GTM instance directly:

```typescript
import { useRuntimeConfig, useScriptGoogleTagManager } from '#imports'

const {
  public: { tracking },
} = useRuntimeConfig()
const tagManager = useScriptGoogleTagManager(tracking.gtm)

tagManager.proxy.dataLayer.push({
  event: 'event_name',
  category: 'category',
  action: 'click',
  label: 'label',
  value: 5000,
})
```

**Note:** It's recommended to use the domain-specific composables (`useProductEvents`, `useBasketEvents`, etc.) instead of `useGtm` directly, as they automatically include relevant page and session context.

## Related Documentation

- [TRACKING.md](./TRACKING.md) - Comprehensive technical documentation
- [@gtm-support/vue-gtm documentation](https://github.com/gtm-support/vue-gtm#documentation) - Underlying GTM plugin documentation
