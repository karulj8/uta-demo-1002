# Storyblok CMS Integration

This document provides a comprehensive guide for implementing and working with
the Storyblok CMS integration in the Storefront Application.

## Getting Started

### Prerequisites

Before using the Storyblok integration, you need:

1. **Storyblok account**: Sign up at [storyblok.com](https://www.storyblok.com/)
2. **Storyblok space**: Create a new space for your storefront
3. **Access token**: Get your access token from the Storyblok space settings

### Installation

The Storyblok integration is included with the Storefront Application.
To enable it, configure the CMS provider in your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@scayle/storefront-nuxt'],

  cms: {
    provider: 'storyblok',
  },

  runtimeConfig: {
    public: {
      cms: {
        // Set via NUXT_PUBLIC_CMS_ACCESS_TOKEN environment variable
        accessToken: '',
        // Enable draft content in development
        allowDrafts: false, // Set via NUXT_PUBLIC_CMS_ALLOW_DRAFTS
      },
    },
  },
})
```

### Environment Variables

Configure the Storyblok integration using environment variables:

```bash
# Required: Storyblok access token
NUXT_PUBLIC_CMS_ACCESS_TOKEN=your_access_token_here

# Optional: Enable draft content (for development/preview)
NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true
```

**Access Token Types**:

- **Preview token**: Use during development to see draft content
- **Public token**: Use in production for published content only

### Live Preview Setup

In order to enable the live preview in the storyblok editor,
you need to provide an access token with the access level `Preview`.

Configure preview URLs for your routing mode using the "Real Path" field in Storyblok.
See the [Visual Editor Configuration](#visual-editor-configuration) for detailed configuration examples.

### Basic Usage (Recommended)

Use the provided `PageComponent` in your content page to fetch and render CMS content.
This is the recommended and most concise way to integrate full page Storyblok content.

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
import { provideCMSContext } from '~~/modules/cms/utils/useCMSContext'

defineOptions({ name: 'ContentPage' })
definePageMeta({
  pageType: 'content_pages',
  validate: (route) => !!route.params.slug && route.params.slug.length > 0,
})

const route = useRoute()

// Build the CMS slug from the route (e.g., "content/about").
// The i18n resolver will prepend the shop folder (e.g., "de/content/about").
const slug = computed(() => {
  const parts = ['content']
  if (typeof route.params.slug === 'string') parts.push(route.params.slug)
  else if (Array.isArray(route.params.slug)) parts.push(...route.params.slug)
  return parts.join('/')
})

// Optional: Provide image sizing context for better performance at xl breakpoint
provideCMSContext({ maxWidths: { xl: 1280 } })
</script>
```

## How It Works

### Component-Based Architecture

Storyblok uses a component-based approach where content is built from reusable blocks called "components" or "bloks".
Each Storyblok component maps to a Vue component in your application.

**Storyblok Component** → **Vue Component**

For example (existing components):

- Storyblok component `Text` → Vue component `TextComponent.vue`
- Storyblok component `Image` → Vue component `ImageComponent.vue`
- Storyblok component `Section` → Vue component `SectionComponent.vue`
- Storyblok component `Button` → Vue component `ButtonComponent.vue`
- Storyblok component `Link` → Vue component `LinkComponent.vue`
- Storyblok component `RichText` → Vue component `RichTextComponent.vue`
- Storyblok component `ProductListingPage` → Vue component `ProductListingPageComponent.vue`

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

- `content-type="teaser"` renders `teaserContent`, while `content-type="seo"` renders `seoContent` from Storyblok.
- The component constructs the slug as `c/c-{categoryId}` and relies on the i18n resolver to prepend the shop folder (e.g., `de/c/c-91825`).
- This pattern lets you drop CMS-controlled blocks into any page region while keeping the core page logic in the app.
- Requires the Storyblok folder structure `/{locale}/c/c-{categoryId}` as documented in this guide.

### Content Fetching Flow

1. **Route resolves**: User visits a URL (e.g., `/de/about`)
2. **Slug resolution**: The integration resolves the route to a Storyblok slug (e.g., `de/about`)
3. **API request**: Content is fetched from Storyblok API
4. **Component mapping**: Storyblok components are mapped to Vue components
5. **Rendering**: Vue components render the content

### Visual Editor Integration

The Visual Editor provides real-time preview during content editing:

1. **Editor detection**: The integration detects the `_storyblok` query parameter
2. **Draft content**: Draft versions are loaded instead of published versions
3. **Live updates**: Changes in Storyblok appear instantly in the preview
4. **Deep reactivity**: Component updates trigger Vue re-renders

## Creating Custom Components

### Component Setup in Storyblok

To create a custom Storyblok component:

1. **Define in Storyblok**: Go to your Storyblok space → Components → Create new component
2. **Add fields**: Define the content structure (text, images, links, etc.)
3. **Create Vue component**: Create a corresponding Vue component in your application

### Vue Component Structure

Create Vue components in your application that match Storyblok components. Components receive a `contentElement` prop that matches the Storyblok schema.

**Example**: Text component (existing):

```vue
<!-- modules/cms/providers/storyblok/components/TextComponent.vue -->
<script setup lang="ts">
import type { TextComponent } from '../types'

const { contentElement } = defineProps<{ contentElement: TextComponent }>()
</script>

<template>
  <component :is="contentElement.textType || 'p'" v-editable="contentElement">
    {{ contentElement.content }}
  </component>
</template>
```

### Component Registration

Storyblok components are rendered via the central router component `StoryblokComponent.vue`.
It maps the `contentElement.component` name from Storyblok to the corresponding Vue component using conditional branches.

```vue
<!-- modules/cms/providers/storyblok/components/StoryblokComponent.vue (excerpt) -->
<template>
  <TextComponent
    v-if="contentElement.component === 'TextComponent'"
    :content-element="contentElement"
  />
  <ImageComponent
    v-else-if="contentElement.component === 'ImageComponent'"
    :content-element="contentElement"
  />
  <SectionComponent
    v-else-if="contentElement.component === 'SectionComponent'"
    :content-element="contentElement"
  />
  <!-- ... other component mappings, including new custom components ... -->
  <div v-else-if="showNotImplemented">
    The CMS content element '{{ contentElement }}' has not yet been implemented!
  </div>
</template>
```

Add a new CMS component by:

1. Creating the Vue component in `modules/cms/providers/storyblok/components/` (e.g., `MyBannerComponent.vue`).
2. Importing it in `StoryblokComponent.vue` and adding a new `v-else-if` branch that matches the Storyblok component name (e.g., `'MyBannerComponent'`).
3. Extending `modules/cms/providers/storyblok/types` if a new type is required.

### Visual Editor Support

Use the `v-editable` directive to enable click-to-edit in the Visual Editor:

```vue
<template>
  <!-- Makes the entire block editable in Visual Editor -->
  <div v-editable="contentElement">
    <h2>{{ contentElement.title }}</h2>
    <p>{{ contentElement.text }}</p>
  </div>
</template>
```

### Rich Text Rendering

For rich text fields, use the existing `RichTextComponent.vue`, which renders Storyblok rich text and resolves links correctly:

```vue
<!-- modules/cms/providers/storyblok/components/RichTextComponent.vue (excerpt) -->
<template>
  <div v-editable="contentElement">
    <StoryblokRichText :document="document" :components="components" />
  </div>
</template>
```

### Nested Components

Storyblok components can contain other components (bloks).
The `SectionComponent` for example renders nested content via `StoryblokComponent`:

```vue
<!-- modules/cms/providers/storyblok/components/SectionComponent.vue (excerpt) -->
<template>
  <section>
    <StoryblokComponent
      v-for="(element, index) in contentElement.content"
      :key="element._uid"
      :content-element="element"
    />
  </section>
</template>
```

### Best Practices for Components

- **Keep components simple**: Each component should have a single, clear purpose
- **Use TypeScript**: Define proper interfaces for component props
- **Make them reusable**: Design components that work in multiple contexts
- **Add visual editor support**: Always use `v-editable` for better content editing experience
- **Handle missing data**: Check for field existence before rendering
- **Follow naming conventions**: Use `Storyblok{ComponentName}` pattern consistently

## Content Types

The Storefront Application uses different content types for different purposes.
Each type serves a specific role in the storefront.

### Page Content

Page content is used for standard content pages like About, Privacy Policy, Terms of Service, and custom pages.

**Content Type**: `PageComponent`

**Location in Storyblok**: `{locale}/content/{page-slug}`

**Usage**:

```vue
<!-- pages/content/[...slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/storyblok/composables/useCMS'

const route = useRoute()
const slug = computed(() => `/content/${route.params.slug}`)

const { data: story } = await useCMSBySlug('cms-page', slug)
</script>

<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
```

### Homepage Content

Homepage content is special content for the root path of each locale.

**Content Type**: `PageComponent`

**Location in Storyblok**: `{locale}/homepage`

**Usage**:

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/storyblok/composables/useCMS'

const { data: story } = await useCMSBySlug('cms-homepage', '/')
</script>

<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
```

### Product Listing Page (PLP) Content

PLP content enhances category pages with additional content blocks like banners,
promotional sections, or editorial content.

**Content Type**: `ProductListingPageComponent`

**Location in Storyblok**: `{locale}/c/c-{categoryId}`

**Usage**:

```vue
<!-- pages/c/[slug].vue -->
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/storyblok/composables/useCMS'
import { useCategoryId } from '~/composables/useCategoryId'

const route = useRoute()
const categoryId = useCategoryId(route)

// Construct slug: 'c/c-{categoryId}'
const cmsSlug = computed(() =>
  categoryId.value ? `c/c-${categoryId.value}` : null,
)

const { data: story } = await useCMSBySlug('cms-plp', cmsSlug)
</script>

<template>
  <div>
    <!-- Product listing content -->
    <ProductGrid :products="products" />

    <!-- CMS content enhancement -->
    <StoryblokComponent v-if="story" :blok="story.content" />
  </div>
</template>
```

**Note**: Category pages use the category ID (e.g., `91825`), not the URL slug.
The slug `c-91825` corresponds to category ID `91825`.

### Custom Content Types

You can create custom content types for specific purposes:

1. **Create content type in Storyblok**: Define a new content type with custom fields
2. **Sync Storyblok types locally**: Use `pnpm cms:sync` to generate and update the TypeScript types for your CMS content models.
3. **Create Vue component**: Implement the corresponding Vue component
4. **Fetch content**: Use `useCMSBySlug` with the appropriate slug pattern

**Example**: Blog posts

```vue
<script setup lang="ts">
import { useCMSBySlug } from '~/modules/cms/providers/storyblok/composables/useCMS'

const route = useRoute()
const slug = computed(() => `/blog/${route.params.slug}`)

// Custom content type: BlogPost
const { data: story } = await useCMSBySlug<BlogPost>('cms-blog', slug)
</script>
```

## Internationalization (i18n)

### Overview

The Storyblok integration uses a **folder-based approach** for internationalization.
All content is organized in locale-prefixed folders within Storyblok,
regardless of which routing mode the Storefront Application uses.
This provides consistency, simplifies content management, and works seamlessly across all routing configurations.

### Folder Organization

Organize your content in Storyblok using folders that match your i18n locale codes:

```text
Storyblok Content/
├── de/              # German content
│   ├── homepage     # Homepage story (required)
│   ├── c/           # Categories folder (slug: "c") for PLP CMS content
│   │   ├── c-139    # Category page content for category ID 139
│   │   ├── c-91825  # Category page content for category ID 91825
│   │   └── c-56789  # Category page content for category ID 56789
│   └── content/     # Content folder (slug: "content") for CMS pages
│       ├── about    # About page
│       ├── privacy  # Privacy page
│       └── terms    # Terms page
├── en/              # English content
│   ├── homepage
│   ├── c/
│   │   ├── c-139
│   │   ├── c-91825
│   │   └── c-56789
│   └── content/
│       ├── about
│       ├── privacy
│       └── terms
└── ch/              # Swiss content
    ├── homepage
    ├── c/
    │   ├── c-139
    │   ├── c-91825
    │   └── c-56789
    └── content/
        ├── about
        ├── privacy
        └── terms
```

#### Folder Naming Conventions

- **Use shop codes as folder names**: The folder name must match the `code` field in your shop configuration (e.g., `de`, `en`, `ch`, `at`, `de-en`)
  - **Important**: Use the shop `code`, NOT the full locale
  - Shop `code` is used for URL routing (e.g., `de`, `at`, `de-en`)
  - Full locale is the BCP-47 code (e.g., `de-DE`, `de-AT`, `en-DE`)
- **Homepage**: Each locale folder must contain a `homepage` story for the root path (`/`)
- **Categories folder**: Create a folder with slug `c` inside each locale folder for Product Listing Page (PLP) CMS content
  - Category pages use the pattern `c-{categoryId}` (e.g., `c-91825` for category ID 91825)
  - The application automatically constructs the slug as `c/c-{categoryId}` when fetching category content
- **Content folder**: Create a folder with slug `content` inside each locale folder for general CMS pages (except homepage)
  - All content pages (about, privacy, etc.) go inside this folder
  - The application automatically prepends `content/` to the page slug when fetching
- **Consistent structure**: Maintain the same folder structure across all locales for easier management
- **Path mirroring**: The path structure inside each locale folder mirrors your application's URL structure

#### Multiple Shops with Same Language

You can have multiple shops sharing the same language but with different content:

**Example**: German shops for different countries:

- Shop 1 (Germany): `locale: 'de-DE'`, `code: 'de'` → Storyblok folder `de/`
- Shop 2 (Austria): `locale: 'de-AT'`, `code: 'at'` → Storyblok folder `at/`
- Shop 3 (Switzerland): `locale: 'de-CH'`, `code: 'ch'` → Storyblok folder `ch/`

Each shop gets its own Storyblok folder based on its unique `code`, allowing completely different content even when using the same language. This is useful for:

- Country-specific campaigns and promotions
- Different product catalogs per country
- Region-specific legal content
- Localized imagery and messaging

##### Sharing Content Across Shops

If you want multiple shops to use the **same content** from a single Storyblok folder, use the `folderMapping` configuration to map different shop codes to the same folder:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      cms: {
        folderMapping: {
          de: 'de', // Germany shop uses 'de-common' folder
          at: 'de', // Austria shop uses same 'de-common' folder
          ch: 'de', // Switzerland shop uses same 'de-common' folder
        },
      },
    },
  },
})
```

With this configuration:

- All three shops (`de`, `at`, `ch`) fetch content from the same `de/` folder in Storyblok
- You only need to maintain one set of content for all German-speaking markets
- Reduces content duplication and maintenance effort
- Perfect for markets with minimal regional differences

**Use cases for shared content**:

- Testing new markets before creating localized content
- Small markets that don't require region-specific content
- Consistent brand messaging across similar regions
- Reducing initial content creation effort

### Routing Mode Integration

The Storyblok integration automatically handles slug resolution based on your Storefront Application's routing configuration.
The routing mode is configured via the `SHOP_SELECTOR_MODE` environment variable.

#### Path-Based Routing

**Configuration**: `SHOP_SELECTOR_MODE=path`

In path-based routing, each shop has its own URL prefix:

| URL                                    | Storyblok Slug       |
| -------------------------------------- | -------------------- |
| `/de/`                                 | `de/homepage`        |
| `/de/content/about`                    | `de/content/about`   |
| `/de/content/privacy`                  | `de/content/privacy` |
| `/de/c/category-slug-91825` (Category) | `de/c/c-91825`       |
| `/en/content/about`                    | `en/content/about`   |
| `/ch/c/category-slug-139` (Category)   | `ch/c/c-139`         |

The integration automatically removes the shop prefix from the URL path before constructing the Storyblok slug.

#### Domain-Based Routing

**Configuration**: `SHOP_SELECTOR_MODE=domain`

In domain-based routing, each shop uses a different domain or subdomain:

| URL                                               | Storyblok Slug       |
| ------------------------------------------------- | -------------------- |
| `de.example.com/`                                 | `de/homepage`        |
| `de.example.com/content/about`                    | `de/content/about`   |
| `de.example.com/content/privacy`                  | `de/content/privacy` |
| `de.example.com/c/category-slug-91825` (Category) | `de/c/c-91825`       |
| `en.example.com/content/about`                    | `en/content/about`   |
| `ch.example.com/c/category-slug-139` (Category)   | `ch/c/c-139`         |

The integration determines the locale from the domain and prepends it to the path.

#### Path-Except-Default Routing

**Configuration**: `SHOP_SELECTOR_MODE=path_or_default`

In path-except-default routing, the default shop has no URL prefix, while other shops do:

Assuming `de` is the default shop:

| URL                                          | Storyblok Slug       |
| -------------------------------------------- | -------------------- |
| `/` (default locale)                         | `de/homepage`        |
| `/content/about` (default locale)            | `de/content/about`   |
| `/content/privacy` (default locale)          | `de/content/privacy` |
| `/c/category-slug-91825` (Category, default) | `de/c/c-91825`       |
| `/en/content/about`                          | `en/content/about`   |
| `/en/`                                       | `en/homepage`        |
| `/ch/c/category-slug-139` (Category)         | `ch/c/c-139`         |

The integration automatically detects the current locale and constructs the appropriate Storyblok slug.

### How Slug Resolution Works

#### Automatic Slug Resolution

The `useCMSBySlug` composable automatically resolves route paths to Storyblok slugs:

```typescript
// In your component
const { data } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  '/about', // Route path
)

// Internally resolved to:
// - 'de/about' if current locale is 'de'
// - 'en/about' if current locale is 'en'
// - 'ch/about' if current locale is 'ch'
```

#### Homepage Handling

The root path (`/`) is always mapped to the `homepage` story within the locale folder:

```typescript
// URL: /
// Resolved to: de/homepage (if current locale is 'de')

// URL: /en/
// Resolved to: en/homepage
```

#### Category Pages (PLP)

Product Listing Pages (category pages) automatically fetch CMS content from the `c/` folder:

```typescript
// Component receives categoryId: 91825
// Internally constructs slug: 'c/c-91825'
// Resolved to: de/c/c-91825 (if current locale is 'de')

// URL: /de/c/category-slug-91825
// Fetches: de/c/c-91825 from Storyblok
```

The `ProductListingPageComponent` automatically prepends `c/` to the category ID pattern `c-{categoryId}`.

#### Content Pages

Content pages (About, Privacy, Terms, etc.) are stored in the `content/` folder:

```typescript
// URL: /content/about
// Resolved to: de/content/about (if current locale is 'de')

// URL: /en/content/privacy
// Resolved to: en/content/privacy
```

The content page route automatically prepends `content/` to the dynamic slug segments.

### Configuration for i18n

#### Basic Configuration

The Storyblok integration works out of the box with your existing i18n configuration.
Ensure you have the following in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@scayle/storefront-nuxt'],

  cms: {
    provider: 'storyblok',
  },

  runtimeConfig: {
    public: {
      cms: {
        accessToken: '', // Set via NUXT_PUBLIC_CMS_ACCESS_TOKEN
        allowDrafts: false, // Set via NUXT_PUBLIC_CMS_ALLOW_DRAFTS
      },
    },
  },
})
```

#### Custom Folder Mapping

If your Storyblok folder names don't match your i18n locale codes, you can configure custom mappings:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      cms: {
        accessToken: '',
        allowDrafts: false,
        folderMapping: {
          de: 'german', // Map 'de' locale to 'german' folder
          en: 'english', // Map 'en' locale to 'english' folder
          ch: 'switzerland', // Map 'ch' locale to 'switzerland' folder
        },
      },
    },
  },
})
```

With this configuration:

- URL `/de/about` → Storyblok slug `german/about`
- URL `/en/about` → Storyblok slug `english/about`

### Visual Editor Configuration

To enable live preview in the Storyblok Visual Editor, you need to configure preview URLs that match your routing mode.

#### Using Real Path Field

Storyblok provides a built-in "Real Path" field that you can use to configure preview URLs for each story.

**Configuration Steps**:

1. Open a story in Storyblok
2. Go to the **Entry Configuration** tab
3. Set the **Real Path** field to match your application's URL structure

**Examples by Routing Mode**:

##### Path-Based Routing

- For `de/content/about` story: Set Real Path to `/de/content/about`
- For `en/content/privacy` story: Set Real Path to `/en/content/privacy`
- For `de/c/c-91825` story: Set Real Path to `/de/c/category-slug-91825`
- For `de/homepage` story: Set Real Path to `/de/`

##### Domain-Based Routing

- For `de/content/about` story: Set Real Path to `https://de.example.com/content/about`
- For `en/content/privacy` story: Set Real Path to `https://en.example.com/content/privacy`
- For `de/c/c-91825` story: Set Real Path to `https://de.example.com/c/category-slug-91825`
- For `de/homepage` story: Set Real Path to `https://de.example.com/`

##### Path-Except-Default Routing

Assuming `de` is the default locale:

- For `de/content/about` story (default): Set Real Path to `/content/about`
- For `en/content/about` story: Set Real Path to `/en/content/about`
- For `de/c/c-91825` story (default): Set Real Path to `/c/category-slug-91825`
- For `de/homepage` story (default): Set Real Path to `/`
- For `en/homepage` story: Set Real Path to `/en/`

**Note**: This approach requires manual configuration for each story.
You'll need to update the Real Path field whenever you create new content or change your routing structure.

#### Preview URL Format

The preview URL should include the `_storyblok` query parameter for the Visual Editor to work:

```text
https://your-domain.com/de/about?_storyblok=12345
```

This parameter is automatically added by Storyblok when opening the Visual Editor.

#### Testing Preview

1. Open a story in Storyblok
2. Click the **Open in Visual Editor** button
3. Verify the preview loads correctly
4. Make changes in Storyblok and verify they appear in the preview

### Error Handling

#### Missing Content (404)

When content is not found for a locale, the integration handles it gracefully:

```typescript
const { data, error } = await useCMSBySlug<PageComponent>(
  'cms-content-about',
  '/about',
)

// If content doesn't exist:
// - data.value will be null
// - error.value will contain a 404 error
// - A warning is logged: "Storyblok content not found for slug 'de/about' (locale: de)"
```

Your application should handle this with a custom 404 page or fallback content.

#### Other Errors

Non-404 errors (network issues, API errors, etc.) are re-thrown and should be caught by your error handling:

```vue
<script setup>
import { whenever } from '@vueuse/core'
import { createError } from '#imports'

const { data, error } =
  (await useCMSBySlug) < PageComponent > ('cms-content-about', '/about')

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

### Migration Guide

If you're migrating from a non-internationalized Storyblok setup to the folder-based i18n structure:

#### Step 1: Plan Your Folder Structure

1. List all your locales (e.g., `de`, `en`, `ch`, `at`)
2. Create a mapping of existing content to locales
3. Decide on your folder naming convention

#### Step 2: Create Locale Folders

1. In Storyblok, create folders for each locale at the root level
2. Name them according to your i18n locale codes (e.g., `de/`, `en/`)

#### Step 3: Migrate Content

For each locale:

1. **Duplicate stories** from your existing structure
2. **Move them** into the appropriate locale folder
3. **Translate content** as needed
4. **Update internal links** to use the new folder structure

#### Step 4: Update Homepage

1. Rename or create a `homepage` story in each locale folder
2. This story will be used for the root path (`/`)

#### Step 5: Test

1. Test content fetching for each locale
2. Verify Visual Editor preview works
3. Check all internal links work correctly
4. Test error handling for missing content

## Best Practices

### Content Organization

- **Mirror URL structure**: Keep the same folder structure in all locale folders
- **Consistent naming**: Use the same story slugs across locales when possible
- **Shared assets**: Store locale-independent assets (images, videos) separately and reference them

### Translation Workflow

- **Create default locale first**: Start with one locale as the source of truth
- **Use translation workflows**: Leverage Storyblok's translation features
- **Review process**: Implement a review process for translated content

### Performance

- **Use caching**: The Storefront Application caches Storyblok responses
- **Lazy loading**: Use `lazy: true` for below-the-fold content
- **Asset optimization**: Use Storyblok's image service for optimized delivery

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

### Enabling Alternative Versions in Storyblok

Storyblok provides built-in support for managing content alternates across locales through the **Alternative Versions** feature.

**Configuration Steps**:

1. **Open Storyblok Settings**: Navigate to your Storyblok space settings
2. **Go to Internationalization**: Click on **Settings** → **Internationalization**
3. **Enable Alternative Versions**: Toggle on **Enable Alternative Versions**
4. **Configure Languages**: Add all languages/locales that correspond to your folder structure

Once enabled, you can link stories across different locale folders as alternates of each other. This creates the relationship needed for hreflang tags.

### Linking Alternative Versions

After enabling Alternative Versions, link stories across locales:

1. **Open a story** (e.g., `de/content/about`)
2. **Go to Entry Configuration** tab
3. **Find Alternative Versions** section
4. **Link alternate stories** from other locale folders (e.g., `en/content/about`, `ch/content/about`)

**Example**: For an "About" page:

| Locale Folder | Story Slug      | Linked Alternates                      |
| ------------- | --------------- | -------------------------------------- |
| `de/`         | `content/about` | `en/content/about`, `ch/content/about` |
| `en/`         | `content/about` | `de/content/about`, `ch/content/about` |
| `ch/`         | `content/about` | `de/content/about`, `en/content/about` |

## Troubleshooting

### Content Not Found (404)

**Problem**: Content exists in Storyblok but shows 404 in the application.

**Solutions**:

1. **Check folder structure**: Ensure content is in the correct locale folder
2. **Verify locale code**: Confirm the locale code matches your i18n configuration
3. **Check story slug**: Verify the story slug matches the URL path
4. **Review folderMapping**: If using custom mapping, ensure it's correct

**Debugging**:

```typescript
// Check resolved slug in browser console
const slug = resolveStoryblokSlug('de', '/about')
console.log('Resolved Storyblok slug:', slug)
```

### Preview Not Working

**Problem**: Visual Editor preview doesn't load or shows errors.

**Solutions**:

1. **Check preview URL**: Verify the preview URL matches your routing mode
2. **Verify access token**: Ensure you're using a preview access token
3. **Check allowDrafts**: Set `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true` for preview
4. **CORS settings**: Verify CORS is configured correctly in your application

**Debugging**:

- Open browser DevTools and check for network errors
- Verify the `_storyblok` query parameter is present in the URL
- Check the console for warning messages

### Wrong Content Loaded

**Problem**: Content from wrong locale is displayed.

**Solutions**:

1. **Check current locale**: Verify `i18n.locale.value` is correct
2. **Review routing**: Ensure your routing mode is configured correctly
3. **Clear cache**: Clear SSR cache if content is cached incorrectly

**Debugging**:

```typescript
// Log current locale
import { useI18n } from '#i18n'
const i18n = useI18n()
console.log('Current locale:', i18n.locale.value)
```

### Slug Mismatch

**Problem**: Slug resolution doesn't match expected Storyblok path.

**Solutions**:

1. **Check path prefix**: Verify shop prefix is being removed correctly
2. **Review custom mapping**: If using `folderMapping`, ensure configuration is correct
3. **Test slug resolution**: Use the `resolveStoryblokSlug` utility directly to test

**Debugging**:

```typescript
import { resolveStoryblokSlug } from '../utils/helpers'

// Test slug resolution
console.log(resolveStoryblokSlug('de', '/de/about')) // Should: 'de/about'
console.log(resolveStoryblokSlug('en', '/about')) // Should: 'en/about'
console.log(resolveStoryblokSlug('de', '/')) // Should: 'de/homepage'
```

## Additional Resources

- [SCAYLE Storefront - Storyblok Integration Guide](https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/cms/storyblok)
- [SCAYLE Storefront - Internationalization](https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization)
- [Storyblok Documentation - Internationalization](https://www.storyblok.com/docs/concepts/internationalization)
- [Nuxt i18n Module](https://i18n.nuxtjs.org/)
