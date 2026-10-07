# Contentstack CMS Integration

This document provides a comprehensive guide for implementing and working with
the Contentstack CMS integration in the Storefront Application.

## Getting Started

### Prerequisites

Before using the Contentstack integration, you need:

1. **Contentstack account**: Sign up at [contentstack.com](https://www.contentstack.com/)
2. **Contentstack stack**: Create a new stack for your storefront
3. **Access tokens**: Get your API key, Delivery token, and Preview token from the Contentstack stack settings
4. **Environment**: Create an environment in your Contentstack stack
5. **Region**: Determine the region where your Contentstack stack is hosted

### Installation

The Contentstack integration is included with the Storefront Application.
To enable it, configure the CMS provider in your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@scayle/storefront-nuxt'],

  cms: {
    provider: 'contentstack',
  },

  runtimeConfig: {
    public: {
      cms: {
        // Required: Contentstack Stack API Key
        accessToken: '', // Set via NUXT_PUBLIC_CMS_ACCESS_TOKEN
        // Required: Content Delivery Token
        deliveryAccessToken: '', // Set via NUXT_PUBLIC_CMS_DELIVERY_TOKEN
        // Required: Content Preview Token (for draft content)
        previewAccessToken: '', // Set via NUXT_PUBLIC_CMS_PREVIEW_TOKEN
        // Required: Environment name
        environment: '', // Set via NUXT_PUBLIC_CMS_ENVIRONMENT
        // Required: Region (na, eu, au, azure-na, azure-eu, gcp-na, gcp-eu)
        region: '', // Set via NUXT_PUBLIC_CMS_REGION
        // Optional: Branch UID (for branch feature)
        branch: '', // Set via NUXT_PUBLIC_CMS_BRANCH
      },
    },
  },
})
```

### Environment Variables

Configure the Contentstack integration using environment variables:

```bash
# Required: Contentstack Stack API Key
NUXT_PUBLIC_CMS_ACCESS_TOKEN=your_stack_api_key_here

# Required: Content Delivery Token
NUXT_PUBLIC_CMS_DELIVERY_TOKEN=your_delivery_token_here

# Required: Content Preview Token (for draft content)
NUXT_PUBLIC_CMS_PREVIEW_TOKEN=your_preview_token_here

# Required: Environment name
NUXT_PUBLIC_CMS_ENVIRONMENT=your_environment_name

# Required: Region (na, eu, au, azure-na, azure-eu, gcp-na, gcp-eu)
NUXT_PUBLIC_CMS_REGION=na

# Optional: Branch (for branch feature)
NUXT_PUBLIC_CMS_BRANCH=main
```

**Access Token Types**:

- **Stack API Key**: Identifies your Contentstack stack
- **Delivery Token**: Use in production for published content only
- **Preview Token**: Use during development to see draft content and enable Live Preview

### Live Preview Setup

In order to enable the live preview in the Contentstack editor,
you need to provide a preview access token with appropriate permissions.

Configure preview URLs for your routing mode using the Live Preview settings in Contentstack.
See the [Visual Editor Integration](#visual-editor-integration) section for detailed configuration examples.

### Basic Usage (Recommended)

Use the provided `PageComponent` in your content page to fetch and render CMS content.
This is the recommended and most concise way to integrate full page Contentstack content.

```vue
<!-- File: app/pages/content/[...slug].vue -->
<template>
  <div class="xl:container max-xl:mx-5 md:pt-4">
    <PageComponent :slug="slug" data-testid="content-page">
      <template #loading>
        <SFContentPageSkeletonLoader />
      </template>
    </PageComponent>
  </div>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useRoute } from '#imports'
import PageComponent from '#storefront-cms/components/PageComponent.vue'
import SFContentPageSkeletonLoader from '~/components/SFContentPageSkeletonLoader.vue'

const route = useRoute()
const slug = computed(() => {
  const slugParts = ['content']
  if (typeof route.params.slug === 'string') {
    slugParts.push(route.params.slug)
  } else if (Array.isArray(route.params.slug)) {
    slugParts.push(...route.params.slug)
  }

  return slugParts.join('/')
})
definePageMeta({
  layout: 'default',
})
</script>
```

The `PageComponent` automatically:

- Fetches content from Contentstack based on the slug
- Handles locale detection and fallback
- Renders all content components recursively
- Sets up SEO meta tags
- Handles 404 errors for missing content
- Supports Live Preview editing

### Embedding CMS content into existing pages

You can enrich existing application pages with CMS-managed sections without converting the whole page to CMS.
The Product Listing Page (PLP) integrates two CMS areas using `ProductListingPageComponent.vue`:

```vue
<!-- File: app/pages/c/[...categories]/[...slug]-[id].vue (excerpt) -->
<template>
  <div class="flex flex-col">
    <!-- Teaser content above the listing -->
    <CMSProductListingPageComponent
      :key="currentCategoryId"
      :category-id="currentCategoryId"
      content-type="teaser"
    />

    <!-- ... core PLP content (navigation, list, filters) ... -->

    <!-- SEO/content block below the listing (first page only) -->
    <CMSProductListingPageComponent
      v-if="pageNumber === 1"
      :key="currentCategoryId"
      :category-id="currentCategoryId"
      content-type="seo"
    />
  </div>
</template>
```

- `content-type="teaser"` renders `teaser_content`, while `content-type="seo"` renders `seo_content` from Contentstack.
- The component constructs the slug as `c/c-{categoryId}` and queries Contentstack for entries with matching `url` field.
- This pattern lets you drop CMS-controlled blocks into any page region while keeping the core page logic in the app.
- Requires Contentstack entries with `url` field matching the pattern `/c/c-{categoryId}`.

## How It Works

### Component-Based Architecture

Contentstack uses a component-based approach where content is built from reusable blocks.
Each Contentstack content type maps to a Vue component in your application.

**Contentstack Content Type** → **Vue Component**

For example (existing components):

- Contentstack content type `TextComponent` → Vue component `TextComponent.vue`
- Contentstack content type `ImageComponent` → Vue component `ImageComponent.vue`
- Contentstack content type `SectionComponent` → Vue component `SectionComponent.vue`
- Contentstack content type `ButtonComponent` → Vue component `ButtonComponent.vue`
- Contentstack content type `LinkComponent` → Vue component `LinkComponent.vue`
- Contentstack content type `RichTextComponent` → Vue component `RichTextComponent.vue`
- Contentstack content type `SliderComponent` → Vue component `SliderComponent.vue`
- Contentstack content type `GridComponent` → Vue component `GridComponent.vue`
- Contentstack content type `AccordionComponent` → Vue component `AccordionComponent.vue`
- Contentstack content type `AccordionItemComponent` → Vue component `AccordionItemComponent.vue`
- Contentstack content type `VideoComponent` → Vue component `VideoComponent.vue`
- Contentstack content type `ProductListingPageComponent` → Vue component `ProductListingPageComponent.vue`
- Contentstack content type `SmartSortingProductsSliderComponent` → Vue component `SmartSortingProductsSliderComponent.vue`
- Contentstack content type `RecentlyViewedProductsComponent` → Vue component `RecentlyViewedProductsComponent.vue`

### Content Fetching Flow

1. **Route resolves**: User visits a URL (e.g., `/content/about`)
2. **Slug construction**: The integration constructs a Contentstack query with the slug
3. **Locale detection**: Current shop locale is automatically included in the query
4. **API request**: Content is fetched from Contentstack API (Delivery or Preview)
5. **Component mapping**: Contentstack entries are mapped to Vue components
6. **Rendering**: Vue components render the content with proper styling

### Visual Editor Integration

The Visual Editor provides real-time preview during content editing:

1. **Editor detection**: The integration detects the `live_preview` query parameter or Contentstack editor referer
2. **Draft content**: Preview API loads draft versions instead of published content
3. **Live updates**: Changes in Contentstack appear instantly in the preview
4. **Deep reactivity**: Component updates trigger Vue re-renders automatically

## Creating Custom Components

### Component Setup in Contentstack

To create a custom Contentstack component:

1. **Define in Contentstack**: Go to your Contentstack stack → Content Models → Create new content type
2. **Add fields**: Define the content structure (text, images, links, etc.)
3. **Create Vue component**: Create a corresponding Vue component in your application
4. **Generate types**: Use `pnpm cms:sync` to generate TypeScript types from your Contentstack content models

### Vue Component Structure

Create Vue components in your application that match Contentstack content types. Components receive a `contentElement` prop that matches the Contentstack schema.

**Example**: Text component (existing):

```vue
<!-- modules/cms/providers/contentstack/components/TextComponent.vue -->
<script setup lang="ts">
import type { TextComponent } from '../types/gen/contentstack'

const { contentElement } = defineProps<{ contentElement: TextComponent }>()
</script>

<template>
  <component
    :is="contentElement.textType || 'p'"
    v-live-preview="contentElement"
  >
    {{ contentElement.content }}
  </component>
</template>
```

### Component Registration

Contentstack components are rendered via the central router component `ContentstackComponent.vue`.
It maps the `contentElement._content_type_uid` from Contentstack to the corresponding Vue component using conditional branches and type guards.

```vue
<!-- modules/cms/providers/contentstack/components/ContentstackComponent.vue (excerpt) -->
<template>
  <TextComponent
    v-if="isTextComponent(contentElement)"
    :content-element="contentElement"
  />
  <ImageComponent
    v-else-if="isImageComponent(contentElement)"
    :content-element="contentElement"
  />
  <SectionComponent
    v-else-if="isSectionComponent(contentElement)"
    :content-element="contentElement"
  />
  <!-- ... other component mappings, including new custom components ... -->
  <div v-else-if="showNotImplemented">
    The CMS content element '{{ contentElement._content_type_uid }}' has not yet
    been implemented!
  </div>
</template>
```

Add a new CMS component by:

1. Creating the Vue component in `modules/cms/providers/contentstack/components/` (e.g., `MyBannerComponent.vue`).
2. Creating a type guard function in `modules/cms/providers/contentstack/types/typeguards.ts` (e.g., `isMyBannerComponent`).
3. Importing it in `ContentstackComponent.vue` and adding a new `v-else-if` branch that uses the type guard.

### Visual Editor Support

Use the `v-live-preview` directive to enable click-to-edit in the Visual Editor:

```vue
<template>
  <!-- Makes the entire block editable in Visual Editor -->
  <div v-live-preview="contentElement">
    <h2>{{ contentElement.title }}</h2>
    <p>{{ contentElement.text }}</p>
  </div>
</template>
```

### Rich Text Rendering

For rich text fields, use the existing `RichTextComponent.vue`, which renders Contentstack rich text and resolves links correctly:

```vue
<!-- modules/cms/providers/contentstack/components/RichTextComponent.vue (excerpt) -->
<template>
  <div v-live-preview="contentElement">
    <div v-html="renderedContent" />
  </div>
</template>
```

### Nested Components

Contentstack components can contain other components.
The `SectionComponent` for example renders nested content via `ContentstackComponent`:

```vue
<!-- modules/cms/providers/contentstack/components/SectionComponent.vue (excerpt) -->
<template>
  <section>
    <ContentstackComponent
      v-for="(element, index) in contentElement.content"
      :key="element.uid"
      :content-element="element"
      v-live-preview:[`content__${index}`].loop="contentElement"
    />
  </section>
</template>
```

### Best Practices for Components

- **Keep components simple**: Each component should have a single, clear purpose
- **Use TypeScript**: Define proper interfaces for component props using generated types
- **Make them reusable**: Design components that work in multiple contexts
- **Add visual editor support**: Always use `v-live-preview` for better content editing experience
- **Handle missing data**: Check for field existence before rendering
- **Follow naming conventions**: Use `Contentstack{ComponentName}` pattern consistently
- **Generate types regularly**: Run `pnpm cms:sync` after creating or modifying content types in Contentstack

## Content Types

The Storefront Application uses different content types for different purposes.
Each type serves a specific role in the storefront.

### Page Content

Page content is used for standard content pages like About, Privacy Policy, Terms of Service, and custom pages.

**Content Type**: `page-component`

**Location in Contentstack**: Entries with `url` field matching the page path (e.g., `/content/about`)

**Usage**:

```vue
<!-- pages/content/[...slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentstack/composables/useCMS'
import type { PageComponent } from '~/modules/cms/providers/contentstack/types/gen/contentstack'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: page } = await useCMSBySlug<PageComponent>(
  `cms-page-${slug}`,
  slug,
  'page-component',
)
</script>

<template>
  <ContentstackComponent
    v-for="element in page?.content"
    :key="element.uid"
    :content-element="element"
  />
</template>
```

### Homepage Content

Homepage content is special content for the root path of each locale.

**Content Type**: `page-component`

**Location in Contentstack**: Entry with `url` field set to `/homepage`

**Usage**:

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentstack/composables/useCMS'
import type { PageComponent } from '~/modules/cms/providers/contentstack/types/gen/contentstack'

const { data: page } = await useCMSBySlug<PageComponent>(
  'cms-homepage',
  'homepage',
  'page-component',
)
</script>

<template>
  <ContentstackComponent
    v-for="element in page?.content"
    :key="element.uid"
    :content-element="element"
  />
</template>
```

### Product Listing Page (PLP) Content

PLP content enhances category pages with additional content blocks like banners,
promotional sections, or editorial content.

**Content Type**: `productlistingpage-component`

**Location in Contentstack**: Entries with `url` field matching the pattern `/c/c-{categoryId}`

**Usage**:

```vue
<!-- pages/c/[...categories]/[...slug]-[id].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentstack/composables/useCMS'
import type { ProductlistingpageComponent } from '~/modules/cms/providers/contentstack/types/gen/contentstack'
import { useCategoryId } from '~/composables/useCategoryId'

const route = useRoute()
const categoryId = useCategoryId(route)

// Construct slug: 'c/c-{categoryId}'
const cmsSlug = computed(() =>
  categoryId.value ? `c/c-${categoryId.value}` : null,
)

const { data: plpContent } = await useCMSBySlug<ProductlistingpageComponent>(
  `cms-plp-${categoryId.value}`,
  cmsSlug,
  'productlistingpage-component',
)
</script>

<template>
  <div>
    <!-- Product listing content -->
    <ProductGrid :products="products" />

    <!-- CMS content enhancement -->
    <ContentstackComponent
      v-for="element in plpContent?.teaser_content"
      :key="element.uid"
      :content-element="element"
    />
  </div>
</template>
```

**Note**: Category pages use the category ID (e.g., `91825`), not the URL slug.
The `url` field should be set to `/c/c-91825` for category ID `91825`.

### Custom Content Types

You can create custom content types for specific purposes:

1. **Create content type in Contentstack**: Define a new content type with custom fields
2. **Sync Contentstack types locally**: Use `pnpm cms:sync` to generate and update the TypeScript types for your CMS content models
3. **Create Vue component**: Implement the corresponding Vue component
4. **Create type guard**: Add a type guard function in `typeguards.ts`
5. **Register component**: Add the component mapping in `ContentstackComponent.vue`
6. **Fetch content**: Use `useCMSBySlug` with the appropriate content type and slug pattern

**Example**: Blog posts

```vue
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentstack/composables/useCMS'

const route = useRoute()
const slug = computed(() => `blog/${route.params.slug}`)

// Custom content type: BlogPost
const { data: blogPost } = await useCMSBySlug<BlogPost>(
  `cms-blog-${route.params.slug}`,
  slug,
  'blog-post-component',
)
</script>
```

## Internationalization (i18n)

### Overview

The Contentstack integration uses a **locale-based approach** for internationalization.
Contentstack entries are associated with specific locales, and the integration automatically
queries content for the current shop's locale with automatic fallback support.
This works seamlessly across all routing configurations.

### Locale-Based Content

Contentstack entries are associated with specific locales. The integration:

1. **Detects current locale**: Uses the current shop's locale from the Storefront Application
2. **Queries by locale**: Fetches content for the detected locale
3. **Fallback handling**: If content is not available in the requested locale, Contentstack automatically returns content in a fallback language according to its locale fallback configuration
4. **URL matching**: Matches the page slug against the `url` field in Contentstack entries

### Content Structure

Contentstack entries use a `url` field to map to your application's routes:

| Application URL    | Contentstack `url` Field |
| ------------------ | ------------------------ |
| `/`                | `/homepage`              |
| `/content/about`   | `/content/about`         |
| `/content/privacy` | `/content/privacy`       |

The integration automatically prepends a `/` to the slug when querying Contentstack,
so your Contentstack entries should have `url` values starting with `/`.

### Routing Mode Integration

The Contentstack integration automatically handles slug resolution based on your Storefront Application's routing configuration.
The routing mode is configured via the `SHOP_SELECTOR_MODE` environment variable.

#### Path-Based Routing

**Configuration**: `SHOP_SELECTOR_MODE=path`

In path-based routing, each shop has its own URL prefix:

| URL                   | Contentstack `url` Field |
| --------------------- | ------------------------ |
| `/de/`                | `/homepage`              |
| `/de/content/about`   | `/content/about`         |
| `/de/content/privacy` | `/content/privacy`       |
| `/en/content/about`   | `/content/about`         |

The integration automatically removes the shop prefix from the URL path before constructing the Contentstack query.
The locale is automatically detected from the shop configuration and used in the Contentstack query.

#### Domain-Based Routing

**Configuration**: `SHOP_SELECTOR_MODE=domain`

In domain-based routing, each shop uses a different domain or subdomain:

| URL                              | Contentstack `url` Field |
| -------------------------------- | ------------------------ |
| `de.example.com/`                | `/homepage`              |
| `de.example.com/content/about`   | `/content/about`         |
| `de.example.com/content/privacy` | `/content/privacy`       |
| `en.example.com/content/about`   | `/content/about`         |

The integration determines the locale from the domain and uses it in the Contentstack query.

#### Path-Except-Default Routing

**Configuration**: `SHOP_SELECTOR_MODE=path_or_default`

In path-except-default routing, the default shop has no URL prefix, while other shops do:

Assuming `de` is the default shop:

| URL                                 | Contentstack `url` Field |
| ----------------------------------- | ------------------------ |
| `/` (default locale)                | `/homepage`              |
| `/content/about` (default locale)   | `/content/about`         |
| `/content/privacy` (default locale) | `/content/privacy`       |
| `/en/content/about`                 | `/content/about`         |
| `/en/`                              | `/homepage`              |

The integration automatically detects the current locale and constructs the appropriate Contentstack query.

### How Slug Resolution Works

#### Automatic Slug Resolution

The `useCMSBySlug` composable automatically resolves route paths to Contentstack queries:

```typescript
// In your component
const { data } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  'content/about', // Route path
  'page-component',
)

// Internally queries Contentstack for:
// - Entry with url field = '/content/about'
// - Locale = current shop's locale (e.g., 'de-DE')
// - Content type = 'page-component'
```

#### Homepage Handling

The root path (`/`) is always mapped to entries with `url` field set to `/homepage`:

```typescript
// URL: /
// Queries: Entry with url = '/homepage' in current locale

// URL: /en/
// Queries: Entry with url = '/homepage' in 'en' locale
```

#### Category Pages (PLP)

Product Listing Pages (category pages) automatically fetch CMS content using the category ID pattern:

```typescript
// Component receives categoryId: 91825
// Internally constructs slug: 'c/c-91825'
// Queries: Entry with url = '/c/c-91825' in current locale

// URL: /de/c/category-slug-91825
// Queries: Entry with url = '/c/c-91825' in 'de-DE' locale
```

The `ProductListingPageComponent` automatically constructs the slug as `c/c-{categoryId}`.

#### Content Pages

Content pages (About, Privacy, Terms, etc.) are queried by their URL path:

```typescript
// URL: /content/about
// Queries: Entry with url = '/content/about' in current locale

// URL: /en/content/privacy
// Queries: Entry with url = '/content/privacy' in 'en' locale
```

### Configuration for i18n

#### Basic Configuration

The Contentstack integration works out of the box with your existing i18n configuration.
Ensure you have the following in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@scayle/storefront-nuxt'],

  cms: {
    provider: 'contentstack',
  },

  runtimeConfig: {
    public: {
      cms: {
        accessToken: '', // Set via NUXT_PUBLIC_CMS_ACCESS_TOKEN
        deliveryAccessToken: '', // Set via NUXT_PUBLIC_CMS_DELIVERY_TOKEN
        previewAccessToken: '', // Set via NUXT_PUBLIC_CMS_PREVIEW_TOKEN
        environment: '', // Set via NUXT_PUBLIC_CMS_ENVIRONMENT
        region: '', // Set via NUXT_PUBLIC_CMS_REGION
      },
    },
  },
})
```

#### Locale Fallback Configuration

Contentstack provides built-in locale fallback support. Configure fallback languages in your Contentstack stack settings:

1. **Open Contentstack Settings**: Navigate to your Contentstack stack settings
2. **Go to Locales**: Click on **Settings** → **Locales**
3. **Configure Fallback**: Set fallback languages for each locale

When content is not available in the requested locale, Contentstack automatically returns content in the configured fallback language.

### Visual Editor Configuration

To enable live preview in the Contentstack Visual Editor, you need to configure preview URLs that match your routing mode.

#### Configuring Live Preview URLs

To set up preview URLs for use with the Contentstack Visual Editor, you must configure the appropriate **Base URL** for each shop in the _Environment Settings_ of your Contentstack stack.

- The **Base URL** should match how your storefront is deployed for each shop and environment (e.g., Preview, Dev, Live).
- If your storefront uses locales within the URL path, the `locale` segment **must be included** in the Base URL for each shop (e.g., `/en`, `/de`, etc.).
- For domain-based routing, configure the Base URL using the shop's specific domain.

**Examples:**

**Path-Based Routing (locale in path):**

- DE shop Base URL: `https://your-storefront.com/de`
- EN shop Base URL: `https://your-storefront.com/en`

**Domain-Based Routing (locale/shop by domain):**

- DE shop Base URL: `https://de.your-storefront.com`
- EN shop Base URL: `https://en.your-storefront.com`

**Path-Except-Default Routing:**

- Default locale Base URL: `https://your-storefront.com`
- EN locale Base URL: `https://your-storefront.com/en`

> **Tip:** Always ensure the locale path segment (if present) is included for every shop or language configured.

#### Preview URL Format

The preview URL should include the `live_preview` query parameter for the Visual Editor to work:

```text
https://your-domain.com/de/content/about?live_preview=true
```

This parameter is automatically added by Contentstack when opening the Visual Editor.

#### Testing Preview

1. Open an entry in Contentstack
2. Click the **Open in Visual Editor** button
3. Verify the preview loads correctly
4. Make changes in Contentstack and verify they appear in the preview

### Error Handling

#### Missing Content (404)

When content is not found for a locale, the integration gracefully handles it, including support for fallback locales:

```typescript
const { data, error } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  'content/about',
  'page-component',
)

// If content doesn't exist:
// - data.value will be null
// - error.value will contain a 404 error
// - A 404 error is thrown
```

Your application should handle this with a custom 404 page or fallback content.

#### Other Errors

Non-404 errors (network issues, API errors, etc.) are re-thrown and should be caught by your error handling:

```vue
<script setup>
import { whenever } from '@vueuse/core'
import { createError } from '#imports'

const { data, error } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  'content/about',
  'page-component',
)

// Handle errors
whenever(error, () => {
  throw createError({
    statusCode: error.value?.status || 500,
    message: 'Failed to load content',
    fatal: true,
  })
})
</script>
```

## Best Practices

### Content Organization

- **Consistent URL structure**: Use consistent `url` field values across locales when possible
- **Shared assets**: Store locale-independent assets (images, videos) separately and reference them
- **Content reuse**: Use Contentstack's reference fields to reuse content across entries

### Translation Workflow

- **Create default locale first**: Start with one locale as the source of truth
- **Use locale fallback**: Configure fallback languages in Contentstack for missing translations
- **Review process**: Implement a review process for translated content

### Performance

- **Use caching**: The Storefront Application caches Contentstack responses
- **Lazy loading**: Use `lazy: true` for below-the-fold content
- **Asset optimization**: Use Contentstack's image service for optimized delivery

### SEO Considerations

- **Unique meta tags**: Ensure each locale has unique meta titles and descriptions
- **Hreflang tags**: Implement hreflang tags for multilingual SEO (see [SEO & Hreflang Setup](#seo--hreflang-setup))
- **Canonical URLs**: Set canonical URLs appropriately for each locale
- **Sitemap**: Generate locale-specific sitemaps

## SEO & Hreflang Setup

### Overview

Hreflang tags are essential for multilingual SEO. They tell search engines which language and regional versions of a page exist, helping them serve the correct version to users based on their language and location preferences.

For a page available in German, English, and Swiss German, the hreflang tags would look like:

```html
<link
  rel="alternate"
  hreflang="de"
  href="https://example.com/de/content/about"
/>
<link
  rel="alternate"
  hreflang="en"
  href="https://example.com/en/content/about"
/>
<link
  rel="alternate"
  hreflang="de-CH"
  href="https://example.com/ch/content/about"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://example.com/de/content/about"
/>
```

## Troubleshooting

### Content Not Found (404)

**Problem**: Content exists in Contentstack but shows 404 in the application.

**Solutions**:

1. **Check URL field**: Ensure the entry's `url` field matches the expected path (including leading `/`)
2. **Verify locale**: Confirm the entry is published in the correct locale
3. **Check content type**: Verify the content type matches what you're querying (e.g., `page-component`)
4. **Review environment**: Ensure you're querying the correct environment

**Debugging**:

```typescript
// Check the query being made
const { data, error } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  'content/about',
  'page-component',
)

console.log('Query result:', data.value)
console.log('Error:', error.value)
```

### Preview Not Working

**Problem**: Visual Editor preview doesn't load or shows errors.

**Solutions**:

1. **Check preview URL**: Verify the preview URL matches your routing mode
2. **Verify access token**: Ensure you're using a preview access token
3. **Check preview token**: Verify `NUXT_PUBLIC_CMS_PREVIEW_TOKEN` is set correctly
4. **CORS settings**: Verify CORS is configured correctly in your application

**Debugging**:

- Open browser DevTools and check for network errors
- Verify the `live_preview` query parameter is present in the URL
- Check the console for warning messages
- Verify the Contentstack Live Preview SDK is initialized correctly

### Wrong Content Loaded

**Problem**: Content from wrong locale is displayed.

**Solutions**:

1. **Check current locale**: Verify the current shop's locale is correct
2. **Review routing**: Ensure your routing mode is configured correctly
3. **Clear cache**: Clear SSR cache if content is cached incorrectly
4. **Check locale fallback**: Verify Contentstack locale fallback configuration

**Debugging**:

```typescript
// Log current locale
import { useCurrentShop } from '@scayle/storefront-nuxt/composables'
const currentShop = useCurrentShop()
console.log('Current locale:', currentShop.value.locale)
```

### Slug Mismatch

**Problem**: Content query doesn't match expected Contentstack entry.

**Solutions**:

1. **Check URL field**: Verify the entry's `url` field matches the slug being queried
2. **Review slug construction**: Ensure the slug is constructed correctly (e.g., `/content/about` not `content/about`)
3. **Test query directly**: Use the Contentstack API directly to test the query

**Debugging**:

```typescript
// Test the query directly
const stack = useContentstack()
const entries = await stack
  .contentType('page-component')
  .entry()
  .locale('de-DE')
  .query()
  .where('url', QueryOperation.EQUALS, '/content/about')
  .find()

console.log('Found entries:', entries)
```

## Additional Resources

- [SCAYLE Storefront - Internationalization](https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization)
- [Contentstack Documentation - Locales and Fallback](https://www.contentstack.com/docs/developers/multilingual-content/add-a-language)
- [Contentstack Documentation - Live Preview](https://www.contentstack.com/docs/developers/set-up-live-preview)
