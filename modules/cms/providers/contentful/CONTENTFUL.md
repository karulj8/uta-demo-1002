# Contentful CMS Integration

This guide explains how to implement and work with the Contentful CMS integration in the Storefront Application.

## Overview

### What is Contentful?

Contentful is a headless CMS that provides flexible content management with a powerful API.
The Storefront Application integrates with Contentful to manage content pages, category enhancements,
and custom components.

### Key Features

- **Live Preview**: Real-time content editing with instant preview updates.
- **Type-safe integration**: Automatic TypeScript type generation from Contentful content models.
- **Locale support**: Native multi-language content with configurable fallback chains.
- **Component-based architecture**: Reusable content blocks mapped to Vue components.
- **Automatic caching**: Built-in response caching for optimal performance.

### When to Use Contentful

Use the Contentful integration for:

- **Content pages**: About, Privacy Policy, Terms of Service, Help pages.
- **Category enhancements**: Additional content blocks on Product Listing Pages.
- **Homepage content**: Dynamic hero banners, promotional sections, featured products.
- **Marketing content**: Campaign pages, landing pages, seasonal content.
- **Editorial content**: Blog posts, news articles, style guides.

## How It Works

### Content Fetching Flow

The integration follows this flow when loading content:

1. **Route resolves**: User visits a URL (e.g., `/content/about`).
2. **Slug construction**: The integration constructs a Contentful query with the slug.
3. **Locale detection**: Current shop locale is automatically included in the query.
4. **API request**: Content is fetched from Contentful API (Delivery or Preview).
5. **Component mapping**: Contentful entries are mapped to Vue components.
6. **Rendering**: Vue components render the content with proper styling.

### Component-Based Architecture

Contentful uses a component-based approach where content is built from reusable blocks.
Each Contentful content type maps to a Vue component in your application.

**Contentful Content Type** → **Vue Component**

Existing component mappings:

- `TextComponent` → `TextComponent.vue`
- `ImageComponent` → `ImageComponent.vue`
- `SectionComponent` → `SectionComponent.vue`
- `ButtonComponent` → `ButtonComponent.vue`
- `LinkComponent` → `LinkComponent.vue`
- `RichTextComponent` → `RichTextComponent.vue`
- `SliderComponent` → `SliderComponent.vue`
- `GridComponent` → `GridComponent.vue`
- `AccordionComponent` → `AccordionComponent.vue`
- `VideoComponent` → `VideoComponent.vue`
- `ProductListingPageComponent` → `ProductListingPageComponent.vue`
- `ProductSliderComponent` → `ProductSliderComponent.vue`
- `RecentlyViewedProductsComponent` → `RecentlyViewedProductsComponent.vue`

### Live Preview Integration

Live Preview provides real-time content editing:

1. **Editor detection**: The integration detects the `_editorMode` query parameter.
2. **Draft content**: Preview API loads draft versions instead of published content.
3. **Live updates**: Changes in Contentful appear instantly in the preview.
4. **Deep reactivity**: Component updates trigger Vue re-renders automatically.

## Implementation Guide

### Prerequisites

Before starting, ensure you have:

- **Contentful account**: Sign up at [contentful.com](https://www.contentful.com/).
- **Contentful space**: Create a new space for your storefront.
- **Access tokens**: Get Delivery API and Preview API access tokens from space settings.

### Configuration

#### Step 1: Configure Nuxt

Update your `nuxt.config.ts` to enable Contentful:

```typescript
// File: nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@scayle/storefront-nuxt'],

  cms: {
    provider: 'contentful',
  },

  runtimeConfig: {
    public: {
      cms: {
        // Required: Contentful space ID
        space: '',
        // Required: Contentful Delivery API access token
        accessToken: '',
        // Optional: Preview API access token (for draft content)
        previewAccessToken: '',
        // Optional: Enable draft content in development
        allowDrafts: false,
      },
    },
  },
})
```

#### Step 2: Set Environment Variables

Create or update your `.env` file:

```bash
# Required: Contentful space ID
NUXT_PUBLIC_CMS_SPACE=your_space_id_here

# Required: Contentful Delivery API access token
NUXT_PUBLIC_CMS_ACCESS_TOKEN=your_delivery_token_here

# Optional: Preview API access token (for development/preview)
NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN=your_preview_token_here

# Optional: Enable draft content (for development/preview)
NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true
```

**Access Token Types:**

- **Delivery API token**: Use in production for published content only.
- **Preview API token**: Use during development to see draft content and enable Live Preview.

#### Step 3: Generate TypeScript Types

Run the type generation command to sync your Contentful content models:

```bash
pnpm cms:sync
```

This command connects to your Contentful space, fetches all content type definitions,
and generates TypeScript types in `modules/cms/providers/contentful/types/gen/`.

### Basic Usage

Use the provided `PageComponent` to fetch and render CMS content:

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

defineOptions({ name: 'ContentPage' })
definePageMeta({
  pageType: 'content_pages',
  validate: (route) => !!route.params.slug && route.params.slug.length > 0,
})

const route = useRoute()

// Build the slug from the route (e.g., "content/about")
const slug = computed(() => {
  const parts = ['content']
  if (typeof route.params.slug === 'string') parts.push(route.params.slug)
  else if (Array.isArray(route.params.slug)) parts.push(...route.params.slug)
  return parts.join('/')
})
</script>
```

### Embedding CMS Content in Existing Pages

You can enrich existing pages with CMS-managed sections without converting the entire page to CMS.
The Product Listing Page (PLP) demonstrates this pattern:

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

    <!-- Core PLP content (navigation, list, filters) -->
    <ProductGrid :products="products" />

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

The `ProductListingPageComponent`:

- Renders `teaserContent` when `content-type="teaser"`.
- Renders `seoContent` when `content-type="seo"`.
- Constructs the slug as `c/c-{categoryId}`.
- Queries Contentful for matching content.

This pattern allows you to add CMS-controlled blocks to any page region while
keeping the core page logic in the application.

## Content Types

### Page Content

Page content is used for standard content pages like About, Privacy Policy, and Terms of Service.

**Content Type**: `PageComponent`

**Slug Pattern**: `content/{page-slug}` (e.g., `content/about`, `content/privacy`)

**Fields**:

- `slug`: Text field for URL matching.
- `content`: References to nested content components.
- `metaTitle`: SEO meta title.
- `metaDescription`: SEO meta description.
- `robots`: SEO robots meta tag.

**Example**:

```vue
<!-- File: pages/content/[...slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentful/composables/useCMS'
import type { TypePageComponentSkeleton } from '~/modules/cms/providers/contentful/types'

const route = useRoute()
const slug = computed(() => {
  const parts = ['content']
  if (typeof route.params.slug === 'string') parts.push(route.params.slug)
  else if (Array.isArray(route.params.slug)) parts.push(...route.params.slug)
  return parts.join('/')
})

const { data: story } = await useCMSBySlug<TypePageComponentSkeleton>(
  `cms-content-${slug.value}`,
  {
    content_type: 'PageComponent',
    'fields.slug[match]': slug.value,
  },
)
</script>

<template>
  <ContentfulComponent
    v-for="element in story?.fields.content"
    :key="element?.sys.id"
    :content-element="element"
  />
</template>
```

### Homepage Content

Homepage content is special content for the root path.

**Content Type**: `PageComponent`

**Slug Pattern**: `homepage`

**Example**:

```vue
<!-- File: pages/index.vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentful/composables/useCMS'
import type { TypePageComponentSkeleton } from '~/modules/cms/providers/contentful/types'

const { data: story } = await useCMSBySlug<TypePageComponentSkeleton>(
  'cms-homepage',
  {
    content_type: 'PageComponent',
    'fields.slug[match]': 'homepage',
  },
)
</script>

<template>
  <ContentfulComponent
    v-for="element in story?.fields.content"
    :key="element?.sys.id"
    :content-element="element"
  />
</template>
```

### Product Listing Page Content

PLP content enhances category pages with additional content blocks like banners and promotional sections.

**Content Type**: `ProductListingPageComponent`

**Slug Pattern**: `c/c-{categoryId}` (e.g., `c/c-91825` for category ID 91825)

**Fields**:

- `slug`: Text field matching the pattern `c/c-{categoryId}`.
- `teaserContent`: References to content displayed above the product listing.
- `seoContent`: References to content displayed below the product listing.

**Example**:

```vue
<!-- File: pages/c/[slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentful/composables/useCMS'
import { useCategoryId } from '~/composables/useCategoryId'
import type { TypeProductListingPageComponentSkeleton } from '~/modules/cms/providers/contentful/types'

const route = useRoute()
const categoryId = useCategoryId(route)

// Construct slug: 'c/c-{categoryId}'
const cmsSlug = computed(() =>
  categoryId.value ? `c/c-${categoryId.value}` : null,
)

const { data: story } =
  await useCMSBySlug<TypeProductListingPageComponentSkeleton>(
    `cms-plp-${categoryId.value}`,
    {
      content_type: 'productListingPageComponent',
      'fields.slug[match]': cmsSlug.value,
    },
  )
</script>

<template>
  <div>
    <!-- CMS teaser content -->
    <ContentfulComponent
      v-for="element in story?.fields.teaserContent"
      :key="element?.sys.id"
      :content-element="element"
    />

    <!-- Product listing content -->
    <ProductGrid :products="products" />

    <!-- CMS SEO content -->
    <ContentfulComponent
      v-for="element in story?.fields.seoContent"
      :key="element?.sys.id"
      :content-element="element"
    />
  </div>
</template>
```

**Note**: Category pages use the category ID (e.g., `91825`), not the URL slug.

### Custom Content Types

Create custom content types for specific purposes:

1. **Create content type in Contentful**: Define a new content type with custom fields.
2. **Sync types locally**: Run `pnpm cms:sync` to generate TypeScript types.
3. **Create Vue component**: Implement the corresponding Vue component.
4. **Fetch content**: Use `useCMSBySlug` with the appropriate query.

#### Example: Blog Posts

```vue
<!-- File: pages/blog/[slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/contentful/composables/useCMS'
import type { TypeBlogPostSkeleton } from '~/modules/cms/providers/contentful/types'

const route = useRoute()
const slug = computed(() => `blog/${route.params.slug}`)

const { data: story } = await useCMSBySlug<TypeBlogPostSkeleton>(
  `cms-blog-${route.params.slug}`,
  {
    content_type: 'blogPost',
    'fields.slug[match]': slug.value,
  },
)
</script>

<template>
  <article>
    <h1>{{ story?.fields.title }}</h1>
    <ContentfulComponent
      v-for="element in story?.fields.content"
      :key="element?.sys.id"
      :content-element="element"
    />
  </article>
</template>
```

## Creating Custom Components

### Component Setup in Contentful

To create a custom Contentful component:

1. **Define in Contentful**: Go to your Contentful space → Content model → Add content type.
2. **Add fields**: Define the content structure (text, images, references, etc.).
3. **Sync types**: Run `pnpm cms:sync` to generate TypeScript types.
4. **Create Vue component**: Implement the corresponding Vue component.
5. **Register component**: Add the component to `ContentfulComponent.vue`.

### Vue Component Structure

Create Vue components that match Contentful content types.
Components receive a `contentElement` prop containing the Contentful entry data.

#### Example: Text Component

```vue
<!-- File: modules/cms/providers/contentful/components/TextComponent.vue -->
<template>
  <component
    :is="contentElement?.fields?.textType || 'p'"
    :class="classes"
    :data-contentful-entry-id="contentElement?.sys?.id"
    data-contentful-field-id="content"
    class="text-wrap"
  >
    {{ contentElement.fields?.content }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TypeTextComponentWithoutUnresolvableLinksResponse } from '../types'

const { contentElement } = defineProps<{
  contentElement: TypeTextComponentWithoutUnresolvableLinksResponse
}>()

const classes = computed(() => {
  switch (contentElement.fields?.textType) {
    case 'h1':
      return 'text-3xl font-semibold'
    case 'h2':
      return 'text-2xl font-semibold'
    case 'h3':
      return 'text-xl font-semibold'
    case 'h4':
      return 'text-lg font-semibold'
    default:
      return ''
  }
})
</script>
```

### Component Registration

Register components in `ContentfulComponent.vue`:

```vue
<!-- File: modules/cms/providers/contentful/components/ContentfulComponent.vue (excerpt) -->
<template>
  <TextComponent
    v-if="contentElement && isTypeTextComponent(contentElement)"
    :content-element="contentElement"
  />
  <ImageComponent
    v-else-if="contentElement && isTypeImageComponent(contentElement)"
    :content-element="contentElement"
  />
  <SectionComponent
    v-else-if="contentElement && isTypeSectionComponent(contentElement)"
    :content-element="contentElement"
  />
  <!-- Add new components here -->
  <div v-else-if="showNotImplemented">
    The CMS content element '{{ contentElement }}' has not yet been implemented!
  </div>
</template>
```

To add a new component:

1. Create the Vue component in `modules/cms/providers/contentful/components/`.
2. Run `pnpm cms:sync` to generate types and type guards.
3. Import the component and type guard in `ContentfulComponent.vue`.
4. Add a new `v-else-if` branch with the type guard.

### Live Preview Support

Use data attributes to enable click-to-edit in Live Preview:

```vue
<template>
  <div
    :data-contentful-entry-id="contentElement?.sys?.id"
    data-contentful-field-id="content"
  >
    <h2>{{ contentElement.fields.title }}</h2>
    <p>{{ contentElement.fields.text }}</p>
  </div>
</template>
```

The `useContentfulEditor` composable automatically initializes Live Preview when
the `_editorMode` query parameter is present.

### Rich Text Rendering

For rich text fields, use the `RichTextComponent.vue`:

```vue
<!-- File: modules/cms/providers/contentful/components/RichTextComponent.vue (excerpt) -->
<template>
  <div
    :data-contentful-entry-id="contentElement?.sys?.id"
    data-contentful-field-id="content"
    v-html="content"
  />
</template>

<script setup lang="ts">
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { computed } from 'vue'

const content = computed(() => {
  return documentToHtmlString(
    contentElement.fields.content,
    options, // Custom rendering options for links, headings, etc.
  )
})
</script>
```

The component automatically handles:

- Heading styles (h1, h2, h3).
- Link resolution (internal and external).
- List formatting (ordered and unordered).
- Entry and asset hyperlinks.

### Nested Components

Components can contain other components via reference fields:

```vue
<!-- File: modules/cms/providers/contentful/components/SectionComponent.vue (excerpt) -->
<template>
  <section>
    <ContentfulComponent
      v-for="element in contentElement.fields.content"
      :key="element?.sys.id"
      :content-element="element"
    />
  </section>
</template>
```

### Component Best Practices

- **Keep components simple**: Each component should have a single, clear purpose.
- **Use TypeScript**: Define proper interfaces using generated types.
- **Make them reusable**: Design components that work in multiple contexts.
- **Add Live Preview support**: Always use `data-contentful-entry-id` and `data-contentful-field-id` attributes.
- **Handle missing data**: Check for field existence before rendering.
- **Follow naming conventions**: Match Contentful content type names with Vue component names.

## Internationalization

### Overview

The Contentful integration uses Contentful's native locale system for internationalization.
Content is managed per locale within Contentful, and the integration automatically
fetches content in the appropriate locale based on the current shop configuration.

### How Contentful's API Handles Locales

Contentful's Content Delivery API provides native locale fallback capabilities
when you configure fallback locales in your space:

- **Configured locale with content**: Returns the content in the requested locale.
- **Configured locale with missing content**: Automatically returns content from the configured fallback locale (e.g., `de-CH` → `de-DE` → `en-US`).
- **Unconfigured locale**: Returns a `BadRequest` error, causing the application to fail.
- **No locale specified**: Returns content in the space's default locale.

This native fallback is handled server-side by Contentful, requires only a single API call,
and is the most performant approach. However, it requires that all locales are pre-configured in your Contentful space.

### Locale Fallback Strategy

The integration implements a hybrid locale fallback strategy to handle missing translations gracefully.

#### Primary: Contentful's Native Fallback (Recommended)

For optimal performance and control, configure fallback locales directly in your Contentful space.
This allows Contentful to handle missing translations server-side with a single API call.

**No application changes required**
The integration already passes the shop's locale to Contentful.
Once you configure fallback locales in your Contentful space,
the fallback chain is automatically applied by Contentful's API.

**Example fallback chains:**

- Swiss German (`de-CH`) → German (`de-DE`) → English (`en-US`).
- Mexican Spanish (`es-MX`) → Spanish (`es-ES`) → English (`en-US`).
- Austrian German (`de-AT`) → German (`de-DE`) → English (`en-US`).

**Benefits:**

- Single API request (no retry needed).
- Granular control over fallback chains.
- Content team configures fallback logic in the CMS.
- Handles partial translations elegantly.
- Zero application code changes needed.

**How it works:**

1. The integration passes the shop's locale to Contentful (e.g., `de-CH`).
2. If content exists in `de-CH`, Contentful returns it.
3. If content is missing in `de-CH`, Contentful automatically falls back to `de-DE`.
4. If still missing, Contentful falls back to `en-US`.
5. All handled server-side by Contentful in a single API call.

To configure fallback locales, see [Contentful's localization documentation](https://www.contentful.com/developers/docs/tutorials/general/setting-locales/#handling-the-missing-translations).

#### Secondary: Application-Level Fallback (Safety Net)

To handle the scenario where a locale is completely unconfigured in Contentful
(which would normally cause a `BadRequest` error), the integration provides an automatic safety net:

1. Attempt to fetch content with the shop's configured locale.
2. If that fails with a `BadRequest` error indicating an unconfigured locale,
   automatically retry without specifying a locale.
3. Log a warning message indicating the fallback was used and recommending proper configuration in Contentful.
4. If the fallback also fails, throw an error.

**When this applies:**

- Launching in a new market before the locale is configured in Contentful.
- Testing with locale combinations not yet set up in the CMS.
- Edge cases during development or staging environments.

**Important**: This is a safety net, not a replacement for proper locale configuration.
Configuring fallback locales in Contentful is recommended for better performance (single API call vs. retry on error).

### Shop Configuration

The integration automatically uses the locale from your shop configuration:

```typescript
// File: nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    storefront: {
      shops: {
        de: {
          code: 'de',
          locale: 'de-DE', // Used for Contentful queries
        },
        ch: {
          code: 'ch',
          locale: 'de-CH', // Used for Contentful queries
        },
      },
    },
  },
})
```

### Multiple Shops with Same Language

You can have multiple shops sharing the same language but with different content:

#### Example: German Shops for Different Countries

- Shop 1 (Germany): `locale: 'de-DE'` → Contentful locale `de-DE`.
- Shop 2 (Austria): `locale: 'de-AT'` → Contentful locale `de-AT`.
- Shop 3 (Switzerland): `locale: 'de-CH'` → Contentful locale `de-CH`.

Each shop fetches content in its specific locale.
Use Contentful's fallback locale configuration to share content when appropriate.

### Content Translation Workflow

1. **Create default locale content**: Start with one locale as the source of truth (e.g., `en-US`).
2. **Configure fallback locales**: Set up fallback chains in Contentful space settings.
3. **Translate content**: Add translations for each locale in Contentful.
4. **Test fallbacks**: Verify fallback behavior by temporarily removing translations.

## Live Preview Configuration

### Overview

Contentful Live Preview allows content editors to see changes in real-time as they edit content.
The integration provides seamless Live Preview support with automatic draft content loading and live updates.

### Setup Steps

#### Step 1: Set Environment Variables

```bash
# Required for Live Preview
NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN=your_preview_token_here
NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true

# Standard configuration
NUXT_PUBLIC_CMS_SPACE=your_space_id_here
NUXT_PUBLIC_CMS_ACCESS_TOKEN=your_delivery_token_here
```

#### Step 2: Configure Preview URLs in Contentful

In your Contentful space, configure preview URLs for each content type:

1. Go to **Settings** → **Content preview**.
2. Add preview URL for each content type.
3. Include the `_editorMode` query parameter with the entry's updated timestamp.

**Example preview URLs:**

```text
# Page content
https://your-domain.com/content/{entry.fields.slug}?_editorMode={entry.sys.updatedAt}

# Homepage
https://your-domain.com/?_editorMode={entry.sys.updatedAt}

# Category pages
https://your-domain.com/c/category-slug-{entry.fields.categoryId}?_editorMode={entry.sys.updatedAt}
```

**Note**: The `_editorMode` query parameter is required for the integration to detect Live Preview mode.

#### Step 3: Test Live Preview

1. **Enable draft mode**: Set `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`.
2. **Set preview token**: Configure `NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN`.
3. **Create draft content**: Make changes in Contentful without publishing.
4. **Open preview**: Click "Open preview" in Contentful.
5. **Verify draft content**: Confirm draft content appears in preview.
6. **Test live updates**: Make changes in Contentful and verify they appear instantly.

### How Live Preview Works

1. **Editor opens preview**: Content editor clicks "Open preview" in Contentful.
2. **Query parameter detection**: Integration detects `_editorMode` query parameter.
3. **Preview API activation**: Client switches to Preview API with preview access token.
4. **Draft content loading**: Draft content is fetched instead of published content.
5. **Live updates**: `useContentfulEditor` composable subscribes to content changes.
6. **Real-time rendering**: Changes in Contentful appear instantly in the preview.

### Live Preview Data Attributes

The integration uses special data attributes to enable click-to-edit functionality:

```vue
<template>
  <div
    :data-contentful-entry-id="contentElement?.sys?.id"
    data-contentful-field-id="content"
  >
    <!-- Content here -->
  </div>
</template>
```

- `data-contentful-entry-id`: Identifies the entry being edited.
- `data-contentful-field-id`: Identifies the specific field being edited.

These attributes allow content editors to click directly on content in the
preview to open the corresponding field in Contentful.

## Advanced Usage

### Direct API Access

For advanced use cases, access the Contentful client directly:

```typescript
// File: composables/useCustomContent.ts
import { useContentful } from '~/modules/cms/providers/contentful/composables/useContentful'

const contentfulClient = useContentful()

// Fetch entries with custom query
const entries = await contentfulClient.getEntries({
  content_type: 'product',
  'fields.category': 'electronics',
  limit: 10,
})

// Fetch a specific entry
const entry = await contentfulClient.getEntry('entry-id')

// Fetch assets
const assets = await contentfulClient.getAssets({
  'fields.title[match]': 'banner',
})
```

### Custom Query Options

The `useCMSBySlug` composable accepts any Contentful query parameters:

```typescript
// File: pages/featured.vue
const { data } = await useCMSBySlug<TypePageComponentSkeleton>('custom-query', {
  content_type: 'PageComponent',
  'fields.slug[match]': slug.value,
  'fields.category': 'featured',
  'sys.createdAt[gte]': '2024-01-01',
  order: '-sys.createdAt',
})
```

### Handling Unresolvable Links

The integration automatically uses `withoutUnresolvableLinks` to prevent errors from broken references:

```typescript
// Automatically handled by useCMSBySlug
const data = await contentfulClient.withoutUnresolvableLinks.getEntries({
  include: 10,
  ...options,
})
```

This ensures that missing or unpublished referenced entries don't cause the entire query to fail.

## Type Generation

### Overview

The integration automatically generates TypeScript types for your Contentful content models,
ensuring type safety throughout your application.

### Generating Types

Run the type generation command to sync your Contentful content models:

```bash
pnpm cms:sync
```

This command:

1. Connects to your Contentful space using the configured access token.
2. Fetches all content type definitions.
3. Generates TypeScript types in `modules/cms/providers/contentful/types/gen/`.
4. Creates type guards for runtime type checking.

### Using Generated Types

Import generated types in your components:

```typescript
// File: pages/content/[...slug].vue
import type {
  TypePageComponentSkeleton,
  TypePageComponentWithoutUnresolvableLinksResponse,
} from '~/modules/cms/providers/contentful/types'

// Use skeleton type for queries
const { data } = await useCMSBySlug<TypePageComponentSkeleton>('cms-page', {
  content_type: 'PageComponent',
  'fields.slug[match]': slug.value,
})

// Use response type for component props
const { contentElement } = defineProps<{
  contentElement: TypePageComponentWithoutUnresolvableLinksResponse
}>()
```

### Type Naming Conventions

Generated types follow these naming conventions:

- `Type{ContentTypeName}Skeleton`: For use with queries and `useCMSBySlug`.
- `Type{ContentTypeName}WithoutUnresolvableLinksResponse`: For use with component props.
- `isType{ContentTypeName}`: Type guard function for runtime type checking.

### When to Regenerate Types

Regenerate types whenever you:

- Add a new content type in Contentful.
- Modify existing content type fields.
- Change field types or validations.
- Add or remove references between content types.

## Best Practices

### Content Organization

- **Use consistent naming**: Follow a clear naming convention for content types and fields.
- **Organize with references**: Use reference fields to create reusable content blocks.
- **Leverage validation**: Use Contentful's field validations to ensure content quality.
- **Document content models**: Add descriptions to content types and fields.

### Translation Workflow

- **Configure fallback locales**: Set up fallback chains in Contentful for optimal performance.
- **Create default locale first**: Start with one locale as the source of truth.
- **Use Contentful's translation features**: Leverage built-in translation workflows.
- **Review process**: Implement a review process for translated content.

### Performance

- **Use lazy loading**: Enable `lazy: true` for below-the-fold content.
- **Optimize images**: Use the image optimization utilities provided.
- **Leverage caching**: Use unique cache keys for proper deduplication.
- **Monitor payload size**: Keep content payloads small by selecting only needed fields.

### SEO Considerations

- **Unique meta tags**: Ensure each page has unique meta titles and descriptions.
- **Structured data**: Add structured data fields to content types when appropriate.
- **Canonical URLs**: Set canonical URLs appropriately for each page.
- **Sitemap**: Generate sitemaps that include CMS-managed pages.

### Development Workflow

- **Use Live Preview**: Enable Live Preview for content editors.
- **Sync types regularly**: Run `pnpm cms:sync` after content model changes.
- **Test with draft content**: Verify draft content displays correctly before publishing.
- **Handle errors gracefully**: Implement proper error boundaries and fallbacks.

## Troubleshooting

### Content Not Loading

**Issue: Content exists in Contentful but doesn't appear in the application.**

**Possible causes:**

- Configuration is incorrect or missing.
- Content is not published in Contentful.
- Slug in Contentful doesn't match the query.
- Content doesn't exist in the requested locale.

**Solution:**

1. Verify `NUXT_PUBLIC_CMS_SPACE` and `NUXT_PUBLIC_CMS_ACCESS_TOKEN` are set correctly.
2. Ensure content is published in Contentful.
3. Check that the slug in Contentful matches the query exactly.
4. Verify content exists in the requested locale or configure fallback locales.
5. Check browser console and server logs for error messages.

**Debugging:**

```typescript
// File: pages/content/[...slug].vue
// Log query parameters
console.log('Query:', {
  content_type: 'PageComponent',
  'fields.slug[match]': slug.value,
  locale: currentShop.value.locale,
})
```

**Prevention:** Use consistent slug naming conventions and test content in all locales before publishing.

### Type Errors

**Issue: TypeScript errors when using generated types.**

**Possible causes:**

- Generated types are outdated.
- Importing from incorrect path.
- Contentful content model doesn't match expected structure.

**Solution:**

1. Run `pnpm cms:sync` to regenerate types.
2. Verify you're importing from `~/modules/cms/providers/contentful/types`.
3. Ensure Contentful content model matches expected structure.
4. Clear TypeScript cache and restart IDE.

**Prevention:** Run `pnpm cms:sync` after every content model change in Contentful.

### Preview Not Working

**Issue: Live Preview doesn't load or shows errors.**

**Possible causes:**

- Preview access token is missing or incorrect.
- `allowDrafts` is not enabled.
- `_editorMode` query parameter is missing.
- Preview token doesn't have correct permissions.

**Solution:**

1. Verify `NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN` is set correctly.
2. Ensure `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`.
3. Check that `_editorMode` is in the preview URL.
4. Verify preview token has correct permissions in Contentful.
5. Check application logs for warnings.

**Debugging:**

```typescript
// File: composables/useDebugPreview.ts
import { isInEditorMode } from '~/modules/cms/providers/contentful/utils/helpers'
const route = useRoute()
console.log('In editor mode:', isInEditorMode(route))
```

**Prevention:** Test Live Preview setup in development before deploying to production.

### Locale Issues

**Issue: Wrong locale content is displayed or locale errors occur.**

**Possible causes:**

- Fallback locales are not configured in Contentful.
- Shop locale codes don't match Contentful locale codes.
- Locale is not configured in Contentful space.

**Solution:**

1. Configure fallback locales in Contentful space settings.
2. Ensure shop locale codes match Contentful locale codes exactly.
3. Verify all required locales are configured in Contentful.
4. Check application logs for locale-related warnings.

**Debugging:**

```typescript
// File: composables/useDebugLocale.ts
import { useCurrentShop } from '#storefront/composables'
const currentShop = useCurrentShop()
console.log('Current shop locale:', currentShop.value.locale)
```

**Prevention:** Configure all required locales in Contentful before launching in new markets.

### Performance Issues

**Issue: Slow content loading or large payload sizes.**

**Possible causes:**

- Content is not using lazy loading.
- Include depth is too high for deeply nested content.
- Images are not optimized.
- Network conditions or API response times are slow.

**Solution:**

1. Enable `lazy: true` for non-critical content.
2. Lower the `include` parameter if deeply nested content isn't needed.
3. Use image optimization utilities provided by the integration.
4. Check network conditions and Contentful API response times.
5. Ensure proper cache keys are used for deduplication.

**Prevention:** Monitor performance metrics and optimize content structure regularly.

## Related Documentation

- [SCAYLE Storefront - Contentful Integration Guide](https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/cms/contentful)
- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Contentful JavaScript SDK](https://contentful.github.io/contentful.js/)
- [Contentful Live Preview](https://www.contentful.com/developers/docs/tutorials/general/live-preview/)
- [Contentful Localization](https://www.contentful.com/developers/docs/tutorials/general/setting-locales/)
- [Nuxt Content Module](https://content.nuxtjs.org/)
