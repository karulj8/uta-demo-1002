# Amplience CMS Integration

This document provides a comprehensive guide for implementing and working with
the Amplience Dynamic Content integration in the Storefront Application.

## Getting Started

### Prerequisites

Before using the Amplience integration, you need:

1. **Amplience Dynamic Content hub**: With Content Delivery 2 (CD2) enabled.
2. **Virtual Staging Environment (VSE)**: Required for preview and live visualization. A VSE is tied to exactly one
   hub, so every hub (dev, staging, production) needs its own. Creating one requires org admin access in the
   Amplience Account app, separate from the Dynamic Content app. See [VSE Deep Dive](#vse-deep-dive) if you don't
   have one yet.
3. **Personal access token (PAT)**: For `dc-cli`, used to import and sync the content model. Create it in Dynamic
   Content under **Development → Personal Access Tokens**. Non-admin users may need org admin approval before the
   token becomes active.
4. **`@amplience/dc-cli`**: Installed as a project devDependency (already included, installed via `pnpm install`).
   It doesn't need a global install.
5. **Hub name and hub ID**: The hub **name** (`NUXT_PUBLIC_CMS_HUB_NAME`) is used at runtime for CD2 delivery. The hub
   **ID** (`AMPLIENCE_HUB_ID`) is used by `dc-cli` for `pnpm cms:sync` and `pnpm cms:import`. Find both in the hub
   settings in Dynamic Content.

### Installation

Set `CMS_PROVIDER=amplience` in `.env` and configure the variables below. Only one CMS provider can be active at a
time. The Amplience block in `.env.example` (`### STOREFRONT-CMS: AMPLIENCE ###`) lists the same variables.

#### Runtime (storefront)

These variables are read by `nuxt.config.ts` into `runtimeConfig.public.cms` and power the `$amplience` delivery
client.

| Variable                       | Required | Purpose                                                                  |
| ------------------------------ | -------- | ------------------------------------------------------------------------ |
| `NUXT_PUBLIC_CMS_HUB_NAME`     | Yes      | CD2 hub name for published and preview delivery                          |
| `NUXT_PUBLIC_CMS_LOCALE`       | No       | Fallback delivery locale when no shop locale resolves                    |
| `NUXT_PUBLIC_CMS_ALLOW_DRAFTS` | No       | Enables VSE draft preview when `true` (keep unset/`false` in production) |

#### CLI tooling (`pnpm cms:sync`, `pnpm cms:import`)

These variables are only used by the Amplience scripts in `scripts/sync-cms.sh` and `scripts/import-cms.sh`. They
are not needed for `pnpm dev` or production runtime unless you run sync or import locally.

| Variable                          | Required for sync/import | Purpose                                     |
| --------------------------------- | ------------------------ | ------------------------------------------- |
| `AMPLIENCE_PERSONAL_ACCESS_TOKEN` | Yes                      | Personal access token for `dc-cli`          |
| `AMPLIENCE_HUB_ID`                | Yes                      | Hub ID from hub settings (not the hub name) |

Example `.env` block:

```bash
CMS_PROVIDER=amplience

# Runtime delivery
NUXT_PUBLIC_CMS_HUB_NAME=your-hub-name
NUXT_PUBLIC_CMS_LOCALE=de-DE

# Preview (development only)
NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true

# dc-cli (pnpm cms:sync and pnpm cms:import only)
AMPLIENCE_PERSONAL_ACCESS_TOKEN=your-pat
AMPLIENCE_HUB_ID=your-hub-id
```

Draft preview requires **both** a `vse=` query parameter (injected by Amplience in the visualization iframe) **and**
`NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`. Without `allowDrafts`, the storefront ignores the VSE domain and serves
published content only, even when `vse=` is present. Leave `NUXT_PUBLIC_CMS_ALLOW_DRAFTS` unset in production.
See [Preview and the Visualization SDK](#preview-and-the-visualization-sdk).

### Basic Usage (Recommended)

Use the provided `PageComponent` in your content page to fetch and render CMS content. This is the recommended and
most concise way to integrate full page Amplience content.

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

// Build the CMS slug from the route (e.g., "content/about").
// The locale resolver prepends the shop locale (e.g., "de-DE/content/about").
const slug = computed(() => {
  const parts = ['content']
  if (typeof route.params.slug === 'string') parts.push(route.params.slug)
  else if (Array.isArray(route.params.slug)) parts.push(...route.params.slug)
  return parts.join('/')
})
</script>
```

## How It Works

### Content-Item-Based Architecture

Amplience content is built from JSON Schema-backed content items called "content types". Each Amplience content
type maps to a Vue component in your application. Nested content is rendered by the shared `AmplienceComponent.vue`
router.

**Amplience content type schema** → **Vue Component**

For example (existing components):

| Schema URI suffix                              | Vue component                             | Purpose                                         |
| ---------------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
| `page-component.json`                          | `PageComponent.vue`                       | Root page container, resolved by delivery key   |
| `product-listing-page-component.json`          | `ProductListingPageComponent.vue`         | Teaser/SEO content injected into category pages |
| `text-component.json`                          | `TextComponent.vue`                       | Heading or paragraph text                       |
| `rich-text-component.json`                     | `RichTextComponent.vue`                   | Markdown block                                  |
| `image-component.json`                         | `ImageComponent.vue`                      | Responsive `<picture>` via Dynamic Media        |
| `video-component.json`                         | `VideoComponent.vue`                      | Click-to-play video with poster image           |
| `button-component.json`                        | `ButtonComponent.vue`                     | CTA button                                      |
| `link-component.json`                          | `LinkComponent.vue`                       | Text link                                       |
| `section-component.json`                       | `SectionComponent.vue`                    | Background/padding wrapper for nested content   |
| `grid-component.json`                          | `GridComponent.vue`                       | Responsive CSS grid of nested content           |
| `divider-component.json`                       | `DividerComponent.vue`                    | Vertical spacer                                 |
| `slider-component.json`                        | `SliderComponent.vue`                     | Generic content carousel                        |
| `accordion-component.json`                     | `AccordionComponent.vue`                  | Accordion wrapper                               |
| `accordion-item-component.json`                | `AccordionItemComponent.vue`              | Single accordion entry                          |
| `product-slider-component.json`                | `ProductSliderComponent.vue`              | Curated product slider by explicit IDs          |
| `smart-sorting-products-slider-component.json` | `SmartSortingProductsSliderComponent.vue` | Algorithm-driven product slider                 |
| `recently-viewed-products-component.json`      | `RecentlyViewedProductsComponent.vue`     | Recently-viewed products slider                 |

Nested content is authored through a discriminated "content palette". Every entry in a container's content array
carries a `componentType` discriminant and a single sibling property holding the payload, for example
`{ componentType: 'text', text: { ... } }`. The generated wrapper types (`Text`, `Grid`, `Accordion`, and so on in
`types/gen/`) model this shape, and `AmplienceComponent.vue` dispatches on `componentType`.

**Same-type nesting is not supported by Amplience.** If a container schema `$ref`s the same content type inside its
own palette (directly or through another container that references back), Amplience fully dereferences the schema
graph and rejects the content type with a **cyclic reference error** during hub sync. The boilerplate avoids this by
keeping a one-directional nesting chain and never listing a type inside itself. For example, adding **Section inside
Section** would require `section-component.json` to `$ref` itself and fail sync. **Section inside Grid inside
Section** would require `grid-component.json` to `$ref` `section-component.json` while Section already `$ref`s Grid,
creating the same cycle. The shipped schemas omit those `$ref`s so sync succeeds.

### Content Fetching Flow

1. **Route resolves**: User visits a URL (e.g., `/de/about`).
2. **Delivery key resolution**: `useCMSBySlug` builds the CD2 delivery key inline. In normal traffic it prefixes the
   slug with the current shop locale (or `NUXT_PUBLIC_CMS_LOCALE` fallback), for example `de-DE/content/about`. In
   Amplience preview (`isInEditorMode` and `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`), it uses the `?key=` query parameter
   Amplience injects into the visualization iframe instead.
3. **API request**: `$amplience.getContentItemByKey(deliveryKey)` fetches the item from the CD2 `ContentClient`.
4. **Rendering**: The page component renders the fetched item and passes each palette entry to
   `AmplienceComponent.vue`, which dispatches on `componentType` to the matching Vue component.
5. **Recursion**: Container components pass their nested palette entries back through `AmplienceComponent`.

### Component Dispatch

`AmplienceComponent.vue` is a flat `v-if`/`v-else-if` chain. Each branch is guarded by a typeguard from
`types/typeguards.ts` that checks the palette entry's `componentType`, then renders the matching component with the
unwrapped payload:

```vue
<!-- modules/cms/providers/amplience/components/AmplienceComponent.vue (excerpt) -->
<template>
  <TextComponent
    v-if="isTextComponent(contentElement) && contentElement.text"
    :content-element="contentElement.text"
  />
  <AccordionComponent
    v-else-if="isAccordionComponent(contentElement) && contentElement.accordion"
    :content-element="contentElement.accordion"
  />
  <ButtonComponent
    v-else-if="isButtonComponent(contentElement) && contentElement.button"
    :content-element="contentElement.button"
  />
  <!-- ... other component mappings, including new custom components ... -->
</template>
```

The typeguards are one-liners that narrow on the discriminant:

```typescript
// modules/cms/providers/amplience/types/typeguards.ts
export const isTextComponent = (item: AmplienceContentItem): item is Text =>
  item.componentType === 'text'
```

Container components (`SectionComponent`, `GridComponent`, `SliderComponent`) recurse into `AmplienceComponent` for
their nested palette entries, similar to how Storyblok's `SectionComponent` recurses into `StoryblokComponent`.
`AccordionComponent` is the exception: its `content` is a plain array of `AccordionItemComponent` (not palette
entries), so it renders `AccordionItemComponent` directly, and each item recurses into `AmplienceComponent` for its
own nested palette content. Unrecognized `componentType` values render a "not yet implemented" message in
development and test builds only (`import.meta.dev || import.meta.test`). Production silently renders nothing.

### Preview and the Visualization SDK

When Amplience renders the storefront in a visualization iframe, it passes a `vse=` query parameter. The Nuxt plugin
(`runtime/plugin.ts`) reads that parameter and, when `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`, builds a VSE-aware
`ContentClient` pointed at the staging environment so the page serves unpublished draft content. Rendered elements
carry `data-amplience-entry-id` and `data-amplience-field-id` attributes so the Dynamic Content "click to edit"
overlay can locate the right DOM node for a given field. See [Visual Editor Configuration](#visual-editor-configuration)
for host setup across local, ngrok, and deployed environments.

Preview is save-and-refresh: the editor reloads the iframe to show saved changes. Realtime, no-save preview via the
[Amplience Visualization SDK](https://github.com/amplience/dc-visualization-sdk) (`dc-visualization-sdk`) is not
wired up in this boilerplate.

### Images

Images use Amplience Dynamic Media URLs via `buildAmplienceImageUrl` and the shared `getImageSources` helper, backed
by a custom `@nuxt/image` provider (`provider: 'amplience'`). `ImageComponent`, `SectionComponent` (backgrounds), and
`VideoComponent` (poster images) all produce responsive `<picture>`/`srcset` markup this way, mirroring how
Storyblok and Contentful build manual `<picture>` markup rather than using `<NuxtImg>` directly.

Inline images inside rich text markdown are not passed through Dynamic Media or the responsive pipeline. If you need
responsive inline images in long-form content, add them as a `Section`/`Image` combination instead.

### Rich text

Rich text fields use Amplience native markdown (`format: markdown`), not a structured JSON document like Contentful.
`RichTextComponent.vue` walks marked's token tree and renders it straight to Vue VNodes with `h()` (overriding
headings, paragraphs, lists, and links to apply the same Tailwind classes the other providers use), the same
approach Storyblok's `RichTextComponent.vue` uses for its structured content. There is no `v-html` and no HTML
string at any point, so no sanitizer is needed here. An earlier version rendered to an HTML string via a custom
`marked.Renderer` and sanitized it with `isomorphic-dompurify`, but that pulled `jsdom` (and its heavy dependency
tree) into the server bundle purely for the Node/SSR sanitize path, which was large enough to cause out-of-memory
failures in memory-constrained CI builds.

## Creating Custom Components

Adding a new Amplience content type touches five places: the JSON schema, the content type registration, a
typeguard, the dispatch branch, and the Vue component. This walkthrough uses the existing `Divider` component as a
concrete, minimal template (two optional fields, no nested content).

To make the new component available inside a container's content palette, also add a `oneOf` entry to that
container's schema (see any entry in `page-component-schema.json` for the required `componentType` const plus
single sibling property shape). The type generator turns that entry into the wrapper type the dispatch branch
consumes.

### Step 1: JSON schema

Create the schema body at `.scayle/cms/contentModel/amplience/schemas/schemas/{name}-component-schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://scayle.com/schemas/divider-component.json",
  "title": "Divider",
  "description": "A spacing element that creates visual separation between content sections.",
  "allOf": [
    { "$ref": "http://bigcontent.io/cms/schema/v1/core#/definitions/content" }
  ],
  "type": "object",
  "properties": {
    "height": {
      "title": "Height",
      "type": "string",
      "enum": ["small", "medium", "large"],
      "default": "small",
      "description": "Amount of vertical spacing. Defaults to Small."
    },
    "showLine": {
      "title": "Show Line",
      "description": "When enabled, displays a horizontal line.",
      "type": "boolean"
    }
  },
  "propertyOrder": ["height", "showLine"]
}
```

Also create the thin pointer file at `.scayle/cms/contentModel/amplience/schemas/{name}-component.json` that
`dc-cli` reads to know where the schema body lives and how strictly to validate it:

```json
{
  "body": "./schemas/divider-component-schema.json",
  "schemaId": "https://scayle.com/schemas/divider-component.json",
  "validationLevel": "CONTENT_TYPE"
}
```

Reference other components by `$ref`-ing their schema URI directly (for example
`"$ref": "https://scayle.com/schemas/text-component.json"`). Amplience fully dereferences the schema graph before
validating, so a schema that references itself through another schema (A references B, B references A) fails hub
sync with a cyclic reference error. The current content model avoids this by only allowing nesting in one direction:
`Slider → Section → Grid → Accordion → Accordion Item → leaf components`. A container earlier in that chain can
nest one later in the chain, never the reverse, and no component is nested inside itself (for example no Section
inside Section, no Grid inside Grid, and no Section inside a Grid that sits inside a Section). Keep new container
components on one side of that chain when deciding what they're allowed to contain.

### Step 2: Content type registration

Create `.scayle/cms/contentModel/amplience/content-types/{name}-component.json`, binding the schema to a Dynamic
Content content type (label, icon, repositories, and any visualization entries):

```json
{
  "contentTypeUri": "https://scayle.com/schemas/divider-component.json",
  "status": "ACTIVE",
  "settings": {
    "label": "Divider",
    "icons": [
      {
        "size": 256,
        "url": "https://bigcontent.io/cms/icons/ca-types-article.png"
      }
    ],
    "visualizations": [],
    "cards": []
  },
  "repositories": ["content", "contentde"]
}
```

`repositories` lists which hub content repositories may create items of this type. Only page-level content types
typically need a `visualizations` entry, see [Visual Editor Configuration](#visual-editor-configuration).

### Step 3: Typeguard

Add a one-line typeguard to `types/typeguards.ts`. It narrows on the palette `componentType` discriminant and
returns the generated wrapper type (`Divider`):

```typescript
export const isDividerComponent = (
  item: AmplienceContentItem,
): item is Divider => item.componentType === 'divider'
```

### Step 4: Dispatch branch

Add a branch to `AmplienceComponent.vue`, plus the matching component import and typeguard import. Render the
unwrapped payload from the discriminant's sibling property:

```vue
<DividerComponent
  v-else-if="isDividerComponent(contentElement) && contentElement.divider"
  :content-element="contentElement.divider"
/>
```

### Step 5: Vue component

Create `components/{Name}Component.vue`. The filename must match, Nuxt auto-registers everything under
`components/` (`addComponentsDir`). Give every field-editable element a `data-amplience-entry-id` (the content
item's delivery ID) and a `data-amplience-field-id` (the schema property name) so the Dynamic Content editor overlay
can locate it:

```vue
<!-- modules/cms/providers/amplience/components/DividerComponent.vue -->
<template>
  <div
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="height"
    :class="spacing"
    class="w-full"
  >
    <hr v-if="contentElement.showLine" />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { DividerComponent } from '../types/gen'

const { contentElement } = defineProps<{ contentElement: DividerComponent }>()

const spacing = computed(() => {
  switch (contentElement.height) {
    case 'medium':
      return 'py-5 lg:py-9'
    case 'large':
      return 'py-9 lg:py-12'
    case 'small':
    default:
      return 'py-3 lg:py-5'
  }
})
</script>
```

### Step 6: Generate types and sync

```bash
CMS_PROVIDER=amplience pnpm cms:sync
```

This regenerates `types/gen/{name}-component.d.ts` and the barrel `types/gen/index.ts`. Never hand-edit files under
`types/gen/`, they're overwritten on every sync. Then push the schema and content type to the hub with
`CMS_PROVIDER=amplience pnpm cms:import` (see [Syncing the Content Model](#syncing-the-content-model)).

### Nested Components

Container components pass their nested content back through `AmplienceComponent`, the same recursive pattern
Storyblok uses with `StoryblokComponent`:

```vue
<!-- modules/cms/providers/amplience/components/GridComponent.vue (excerpt) -->
<template>
  <div class="grid w-full" :class="[...]">
    <AmplienceComponent
      v-for="(element, index) in contentElement.content ?? []"
      :key="(element._meta?.deliveryId ?? index) as PropertyKey"
      :content-element="element"
    />
  </div>
</template>
```

#### Same-type and upward nesting are not possible

Nesting limits come from Amplience schema validation, not from the Vue renderer. When a container's `oneOf` palette
`$ref`s another schema that eventually `$ref`s back to the same type, Amplience reports a cyclic reference error
and the content type cannot be synced to the hub.

The boilerplate schemas deliberately omit those `$ref`s. That is why the editor palette never shows the blocked
combinations, and why adding them manually breaks sync.

| Attempted structure      | What happens if you add the `$ref`                                        |
| ------------------------ | ------------------------------------------------------------------------- |
| Section → Section        | Cyclic reference: Section `$ref`s Section                                 |
| Section → Grid → Section | Cyclic reference: Section `$ref`s Grid, Grid `$ref`s Section              |
| Grid → Grid              | Cyclic reference: Grid `$ref`s Grid                                       |
| Grid → Section → …       | Cyclic reference once Grid `$ref`s Section (Section already reaches Grid) |

Valid outer-to-inner paths follow one direction only:
`Slider → Section → Grid → Accordion → Accordion Item → leaf components`. Page and PLP palettes sit at the top and
may include Slider and Section directly. When you need two stacked Section-like wrappers (background, padding,
alignment), use two sibling Sections on the Page instead of nesting one inside the other.

## Content Types

### Page Content

Page content is used for standard content pages like About, Privacy Policy, Terms of Service, and custom pages.

**Content Type**: `page-component.json` → `PageComponent.vue`

**Delivery key**: `{locale}/content/{page-slug}` (e.g., `de-DE/content/about`)

The page schema exposes a `components` array (up to 50 items) as its main content palette, plus `metaTitle`,
`metaDescription`, and `robots` for SEO, and a `_meta.deliveryKey` slug field.

### Homepage Content

Homepage content is special content for the root path of each locale.

**Delivery key**: `{locale}/homepage` (e.g., `de-DE/homepage`)

### Product Listing Page (PLP) Content

PLP content enhances category pages with additional content blocks like banners, promotional sections, or editorial
content, split into a teaser area above the product grid and an SEO area below it.

**Content Type**: `product-listing-page-component.json` → `ProductListingPageComponent.vue`

**Delivery key**: `{locale}/c/c-{categoryId}` (e.g., `de-DE/c/c-100`)

**Usage** (already wired into the PLP):

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

`content-type="teaser"` renders the `teaser_content` field, while `content-type="seo"` renders `seo_content`. The
component constructs the slug as `c/c-{categoryId}` internally, `useCMSBySlug` prepends the locale.

### Custom Content Types

To create a custom content type:

1. **Follow the six-step recipe** in [Creating Custom Components](#creating-custom-components).
2. **Sync locally**: Run `CMS_PROVIDER=amplience pnpm cms:sync` to regenerate types before pushing to the hub.
3. **Push to the hub**: `dc-cli content-type-schema import` and `dc-cli content-type import` (this is a remote
   write, get sign-off before running it against a shared hub).
4. **Fetch content**: Use `useCMSBySlug` with the appropriate slug pattern to resolve content by locale-prefixed
   delivery key.

## Internationalization (i18n)

### Overview

The Amplience integration uses **content-item-based localization**: every content item, including pages, is
strictly bound to one locale. There is no field-level localization anywhere in the content model, every field holds
a single plain value. This mirrors Storyblok's folder-per-locale model exactly: instead of a folder prefix, Amplience
uses a locale-prefixed **delivery key** (for example `de-DE/homepage`, `en-GB/content/about`). Because localization
lives at the delivery-key level, the `ContentClient` itself is never locale-aware, `useCMSBySlug` picks the right
key up front and fetches it directly.

### Why content-item localization, not field-level localization

Amplience offers a native `localized-value` schema type that stores every locale's value for a field in a single
array on one content item (a "master" item), which the delivery client then resolves per-request based on the
locale set on the `ContentClient`. This is the idiomatic Amplience approach, and it was the original design for this
integration.

It broke down for two concrete reasons once real content was modeled:

1. **It doesn't scale past a handful of locales.** Every localized field carries an N-item array for N locales. With
   10 locales, editors see 10 input fields per localized property in Amplience Studio, for every text field on every
   component. The content model gets harder to read and edit as locale count grows, which is the opposite of what a
   content model should do.
2. **A locale-aware client hides non-localized items.** Setting `locale` on a `ContentClient` makes CD2 apply
   locale-based filtering at the delivery layer. Content items without an explicit locale assignment fall outside
   that filter and simply aren't returned, even though they exist in the hub. This forced awkward choices: give the
   page-level container item a fallback locale, or split it into a locale-agnostic page item that fetches
   locale-aware components separately (undoing the layer's simplicity).

The team briefly considered a split strategy (locale-agnostic pages, locale-bound components), but chose full
consistency with the Storyblok model instead: **every item, including the page**, is locale-bound and fetched by a
locale-prefixed delivery key. This is a stronger and simpler model than either earlier option because there's only
one localization mechanism (the delivery key) instead of two (a locale-aware client plus a resolver for master
items). The trade-off is accepted deliberately: content that doesn't vary across locales still needs one content
item per locale in the hub, rather than a single shared item.

|                     | `localized-value` (field-level)             | Content-item localization (used here)      |
| ------------------- | ------------------------------------------- | ------------------------------------------ |
| Items in hub        | One per component                           | One per component per locale               |
| Delivery payload    | `values[]` array with all locale variants   | Single resolved value                      |
| Editor experience   | N input fields per localized property       | One input, one item per locale             |
| Client              | Locale-aware `ContentClient`                | Locale-agnostic, resolved via delivery key |
| Non-localized pages | Filtered out unless given a fallback locale | Not applicable, everything is locale-bound |

This is also why the PLP no longer resolves category content through Amplience's Filter API. The original design
paginated through all PLP entries and matched `category.id` in application code, an approach that scales linearly
with the number of PLP entries in the hub and issues one HTTP round trip per page of results. Resolving by
locale-prefixed delivery key (`{locale}/c/c-{id}`) is a single request regardless of how much PLP content exists,
matching how content and homepage pages already resolve.

### Delivery Key Resolution

`useCMSBySlug` resolves the delivery key in one step:

```typescript
const localeCode = currentShop.value?.locale ?? cms.locale

const deliveryKey =
  isInEditorMode(route) && cms.allowDrafts
    ? (route.query.key as string)
    : `${localeCode}/${toValue(slug)}`
```

- **Normal traffic**: the slug passed to `useCMSBySlug` is prefixed with the shop locale (for example
  `content/about` → `de-DE/content/about`).
- **Preview**: when Amplience editor mode is active and `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`, the composable reads the
  full delivery key from `?key=` (for example `de-DE/content/about`) instead of building it from the route slug.

```typescript
// URL: /content/about (shop locale de-DE) → Fetches: de-DE/content/about
// URL: / (shop locale en-GB, slug "homepage") → Fetches: en-GB/homepage
// Preview iframe ?key=de-DE/c/c-100 → Fetches: de-DE/c/c-100
```

### Locale Fallback

The locale prefix comes from `useCurrentShop().locale`. When no shop locale resolves, `useCMSBySlug` falls back to
`NUXT_PUBLIC_CMS_LOCALE` from runtime config.

### `useCMSBySlug` and Reactivity

```typescript
const { data, status } = await useCMSBySlug<PageComponent>(
  `cms-content-${slug}`,
  () => slug,
)
// URL: /content/about (locale de-DE) → Fetches: de-DE/content/about
// URL: / (locale en-GB) → Fetches: en-GB/homepage
```

`useCMSBySlug` wraps `useAsyncData` and re-fetches on slug or shop-locale change (`watch: [...]`). It catches only the
SDK's `ContentNotFoundError`, logs a warning via `useLog()`, and resolves `null` so a missing delivery key renders an
empty-state fallback instead of a runtime error. Other failures (auth, network, misconfigured hub) are rethrown.
Reactivity is only made deep (`deep: isInEditorMode(route)`) while in the Amplience editor, so downstream templates
react to nested field changes after a save-and-refresh in preview. Outside preview it stays shallow for performance.

## Visual Editor Configuration

### How preview works

Preview requires **both** a `vse=` query parameter and `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`. No editor composable is
involved:

1. The `Page` and `Product Listing Page` content types register a `templatedUri` per environment (see below) that
   includes `?vse={{vse.domain}}`.
2. When an editor opens preview, Amplience loads that URI in a visualization iframe, substituting the hub's VSE
   domain into the `vse` query parameter.
3. The Nuxt plugin (`runtime/plugin.ts`) reads `route.query.vse` at boot and, when `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`,
   builds a `ContentClient` pointed at that staging environment so the page fetches unpublished draft content
   instead of published content.
4. `data-amplience-entry-id` and `data-amplience-field-id` attributes on rendered elements let the Dynamic Content
   "click to edit" overlay map a DOM node back to the content field it came from.

Preview updates on save and iframe refresh. There is no realtime, keystroke-level update: that would require wiring
up `dc-visualization-sdk`, which this boilerplate does not do.

### Configuring visualization URIs

Configure a `templatedUri` per content type in Amplience, one per environment, using Amplience's own template
variables. Amplience only substitutes a fixed set of tokens (`{{vse.domain}}`, `{{delivery.key}}`,
`{{content.sys.id}}`, and others). Custom schema fields cannot be referenced in the URL template.

#### Page and homepage

The `Page` content type uses a fixed storefront path plus the delivery key as a query parameter:

```json
{
  "settings": {
    "visualizations": [
      {
        "label": "Localhost",
        "templatedUri": "https://localhost:3000/?vse={{vse.domain}}&key={{delivery.key}}",
        "default": true
      }
    ]
  }
}
```

The index route has a `/homepage` alias so preview works for homepage items as well. `useCMSBySlug` reads
`route.query.key` and fetches that delivery key directly.

#### Product Listing Page (PLP)

PLP delivery keys follow `{locale}/c/c-{categoryId}` (for example `en-US/c/c-91825`), but the category page route
needs the numeric ID in the path to load products, filters, and navigation. Amplience cannot inject that ID from a
custom schema field into `templatedUri`.

Register a placeholder path and pass the delivery key as a query parameter:

```json
{
  "settings": {
    "visualizations": [
      {
        "label": "Localhost",
        "templatedUri": "https://localhost:3000/c/cms-preview-0?vse={{vse.domain}}&key={{delivery.key}}",
        "default": true
      }
    ]
  }
}
```

The global middleware `runtime/middleware/ampliencePlpPreview.global.ts` (registered from `setup.ts`) runs only in
editor mode when `?key=` contains a PLP delivery key. It parses the category ID from the key and redirects to
`/c/cms-preview-{categoryId}` (preserving any shop locale prefix, for example `/de/c/cms-preview-91825`). The
existing category page then receives the correct route param. Category URL validation is already skipped in editor
mode, so the placeholder slug does not trigger a canonical redirect.

Amplience supports multiple labeled visualization entries per content type, so editors switch environments from a
dropdown instead of overwriting a single URL. The `vse={{vse.domain}}` parameter is what makes the plugin serve
draft content in the preview iframe.

### Local development

Run `pnpm dev` (`http://localhost:3000` by default) and register a "Local Dev" visualization entry as shown above.
Browsers treat `http://localhost` as a trustworthy origin, so Amplience's HTTPS Dynamic Content app can embed it
without a mixed-content block. This only works for the developer whose own browser can reach that `localhost`
address, the browser loads the iframe directly, Amplience's backend never proxies it.

### Deployed environments

No app configuration is needed for staging or production. Register a labeled visualization entry per deployed
origin using the same patterns (`/?vse=...&key=...` for pages, `/c/cms-preview-0?vse=...&key=...` for PLP).

The boilerplate adds a `/homepage` alias on the index route for editor preview compatibility, since Amplience (like
Contentful) has no native "real path" concept the way Storyblok does.

### VSE Deep Dive

The Virtual Staging Environment domain (something like `xxxxxxxx.staging.bigcontent.io`) is **auto-generated by
Amplience**, you never choose or type it yourself.

- **Creating one is an org-admin-only task**, done in the separate Amplience **Account app**, not Dynamic Content.
  It requires content source rules and either an IP allowlist or preview keys (available for VSEs created after
  November 1, 2025).
- **A VSE is tied to exactly one hub** and can't be shared across hubs, each hub (dev, staging, production) needs
  its own. A single hub can have more than one VSE (for example, separate ones for visualization vs. preview, or per
  team).
- **Without admin rights**, you can confirm a VSE exists by:
  - Checking **Settings → Visualization/Preview settings** in Dynamic Content.
  - Inspecting a content item's visualization iframe URL for a `?vse=` parameter.
  - Requesting `https://{vse-domain}/content/key/{locale}/{slug}` directly:
    - `200` means it works.
    - `403` means your IP isn't allowlisted.
    - `404` means the delivery key is wrong.
    - No response at all usually means no VSE has been provisioned for the hub.

### How the staging client is selected

There is a single `ContentClient`, provided as `$amplience` by `runtime/plugin.ts` and built once per request at
plugin setup:

- **Normal traffic**: with no `vse` query parameter, or with `NUXT_PUBLIC_CMS_ALLOW_DRAFTS` unset/`false`, the client
  is built with just `hubName` and serves published CD2 content.
- **Preview**: when a `vse=` parameter is present **and** `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true` (Amplience injects
  `vse=` in the visualization iframe), the plugin sets `stagingEnvironment` on the client config so the same
  `$amplience` client serves draft content from that VSE domain.

## Syncing the Content Model

```bash
CMS_PROVIDER=amplience pnpm cms:sync
```

This runs `dc-cli configure`, exports schemas and content types into `.scayle/cms/contentModel/amplience/`, and
generates TypeScript types from `schemas/schemas/*-schema.json` into
`modules/cms/providers/amplience/types/gen/`.

`pnpm cms:sync` only **pulls** from the hub and regenerates types. Pushing local schema edits **to** the hub is a
separate, deliberate step so schema changes aren't pushed to a shared hub by accident:

```bash
CMS_PROVIDER=amplience pnpm cms:import
```

This reads `AMPLIENCE_PERSONAL_ACCESS_TOKEN`, `AMPLIENCE_HUB_ID`, and `NUXT_PUBLIC_CMS_HUB_NAME` from `.env`,
configures `dc-cli`, then imports schemas before content types. Only the CLI variables and hub name are required for
import. Runtime variables such as `NUXT_PUBLIC_CMS_LOCALE` and `NUXT_PUBLIC_CMS_ALLOW_DRAFTS` are not used by the
import script.
You can also run the underlying `dc-cli import` commands manually as documented in
[Creating a Clean New Hub](#creating-a-clean-new-hub).

### Content model directory structure

```text
.scayle/cms/contentModel/amplience/
├── schemas/
│   ├── {name}-component.json          # dc-cli pointer: { body, schemaId, validationLevel }
│   ├── vendor/bigcontent-core.json    # vendored copy of Amplience's core schema, for offline $ref resolution
│   └── schemas/
│       └── {name}-component-schema.json  # the actual JSON Schema body
└── content-types/
    └── {name}-component.json          # binds a schema URI to a Dynamic Content type (label, icon, visualizations, repositories)
```

`dc-cli` commands map onto this structure as follows:

| Command                                   | Direction  | Touches                                      |
| ----------------------------------------- | ---------- | -------------------------------------------- |
| `dc-cli content-type-schema export <dir>` | Hub → repo | `schemas/` (pointer files and schema bodies) |
| `dc-cli content-type export <dir>`        | Hub → repo | `content-types/`                             |
| `dc-cli content-type-schema import <dir>` | Repo → hub | Pushes schema bodies to the hub              |
| `dc-cli content-type import <dir>`        | Repo → hub | Pushes content type registrations to the hub |

Seed content items are not shipped in this repository. After import, create and publish
content in Dynamic Content (or add a local `content-items/` directory and run
`dc-cli content-item import <dir>` yourself).

### Type generation

Type generation uses a custom script, `scripts/generate-amplience-types.mjs`, rather than a naive
`json-schema-to-typescript` loop, because two problems showed up with the naive approach:

- The exported files are wrapper pointer files (`{ body, schemaId }`), not the schema bodies themselves, and can't
  resolve `http://bigcontent.io/...` or `https://scayle.com/schemas/...` `$ref`s without help. The script reads only
  `schemas/schemas/*-schema.json` and vendors Amplience's core schema locally to resolve refs offline.
- Fully dereferencing cross-schema `$ref`s before compiling causes every container schema (page, section, grid,
  slider, accordion) to inline and regenerate its leaf types from scratch, producing numeric-suffix duplicates
  (`Text1`, `Divider1`, ...) and multi-thousand-line output for a single file. The script rewrites cross-schema
  `$ref`s into `tsType` pointers with `import type` statements before dereferencing, so each leaf component type is
  defined once and imported wherever it's used.

Run it directly if you only need to regenerate types without touching the hub:

```bash
node ./scripts/generate-amplience-types.mjs
```

## Creating a Clean New Hub

This walks through bootstrapping a brand-new Amplience hub from this repository's content model, using the full set
of components already built (Page, Section, Grid, Slider, Accordion, Text, Rich Text, Image, Video, Button, Link,
Divider, Product Slider, Smart Sorting Products Slider, Recently Viewed Products, and the Product Listing Page).

### 1. Create the hub and VSE

1. In Amplience Dynamic Content, create a new hub with **Content Delivery 2** enabled.
2. In the Amplience **Account app** (org admin required), provision a **Virtual Staging Environment** for the new
   hub. See [VSE Deep Dive](#vse-deep-dive), a VSE can't be copied from another hub, it has to be created fresh per
   hub.
3. Create a **content repository** (or repositories) that maps to how you want to organize content, the seed content
   types in this repo assume repositories named `content` and `contentde`, adjust the `repositories` array in each
   content type file to match your hub if you use different names.
4. Create a **personal access token** in **Development → Personal Access Tokens** and note the **hub ID** from the
   hub settings.

### 2. Configure the project

Set in `.env` (see [Installation](#installation) for the full variable reference):

```bash
CMS_PROVIDER=amplience
NUXT_PUBLIC_CMS_HUB_NAME=<your-hub-name>
NUXT_PUBLIC_CMS_LOCALE=<default-locale-e.g.-de-DE>
NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true
AMPLIENCE_PERSONAL_ACCESS_TOKEN=<your-pat>
AMPLIENCE_HUB_ID=<your-hub-id>
```

Use `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true` on local and staging environments where editors need VSE preview. Leave it
unset in production.

### 3. Push the content model, schemas first

Schemas must be imported before content types, since content types reference schema URIs that need to already
exist in the hub:

```bash
CMS_PROVIDER=amplience pnpm cms:import
```

Or run the underlying commands manually:

```bash
pnpm exec dc-cli configure --patToken "$AMPLIENCE_PERSONAL_ACCESS_TOKEN" --hubId "$AMPLIENCE_HUB_ID"
pnpm exec dc-cli content-type-schema import .scayle/cms/contentModel/amplience/schemas/
pnpm exec dc-cli content-type import .scayle/cms/contentModel/amplience/content-types/
```

Import order within the schemas themselves also matters for anything that references another schema (every
container component references its allowed leaf/child components), `dc-cli` resolves this automatically as long as
all schema files are in the same import call, don't import them one at a time.

If the import fails with a cyclic reference error, check whether a new schema you added references a container that
(directly or transitively) references it back. Revisit the one-directional nesting chain described in
[Creating Custom Components](#creating-custom-components) (`Slider → Section → Grid → Accordion → Accordion Item →
leaves`) and keep your addition on one side of it.

### 4. Verify in Dynamic Content

1. Open **Settings → Content Types** and confirm all 17 types show up as `ACTIVE` with the expected labels and
   icons.
2. Open **Content Types → Sync with schema** for a few container types (Page, Section, Grid) to confirm the schema
   graph resolves without errors.
3. Create a test **Page** item, add a **Text** and an **Image** component inside its `components` array, and save.
   If a component doesn't show a title above its fields in the editor, the content type's `settings.label` is
   missing or the schema's `oneOf` wrapper title got dropped in an `allOf` merge, worth double-checking against the
   working examples in this repo.

### 5. Set delivery keys and register visualizations

Since localization is content-item based (see [Internationalization](#internationalization-i18n)), every content
item needs its `_meta.deliveryKey` set to `{locale}/{path}`:

- Homepage per locale: `de-DE/homepage`, `en-GB/homepage`.
- Content pages: `de-DE/content/about`, `de-DE/content/privacy`.
- PLP content per category: `de-DE/c/c-100`.

Register at least a "Local Dev" visualization entry on the `Page` and `Product Listing Page` content types (see
[Configuring visualization URIs](#configuring-visualization-uris)), so preview works immediately after content is
created.

### 6. Publish and smoke test

1. Publish each seed content item.
2. Run `pnpm dev` and visit the storefront paths that correspond to the delivery keys you created (for example `/`,
   `/content/about`).
3. Open a page item in Dynamic Content and click **Preview** to confirm the visualization iframe loads, then save an
   edit and confirm the refreshed iframe shows it.

### 7. Keep the model and hub in sync going forward

Once the hub is bootstrapped, use `pnpm cms:sync` (pull) for day-to-day schema/type changes made in the hub UI, and
`CMS_PROVIDER=amplience pnpm cms:import` (push) when a schema change originates in this repository. Never edit
files under `types/gen/` by hand, they're regenerated by the sync script.

## Error Handling

### Missing Content

When content is not found for a delivery key, the integration handles it gracefully instead of throwing:

- `PageComponent.vue` renders `No content found for delivery key "{slug}". Create content in Amplience with this
delivery key.`
- `ProductListingPageComponent.vue` renders nothing (`v-if="contentToRender?.length"`).

This mirrors how the other providers handle a 404: `useCMSBySlug` catches the SDK's `ContentNotFoundError`, logs a
warning via `useLog()`, and resolves `data` to `null` so the component can render a fallback.

### Unimplemented Content Types

If `AmplienceComponent.vue` receives a content item whose schema has no matching typeguard, it shows a "has not yet
been implemented" message, but only in development and test builds (`import.meta.dev || import.meta.test`).
Production silently drops unknown schema types instead of showing a visible error to end users.

## Best Practices

### Content Organization

- **Delivery keys mirror URL structure**: keep `{locale}/content/*`, `{locale}/c/c-{id}`, and `{locale}/homepage`
  consistent across every locale.
- **One content item per locale**: there's no fallback resolution across locales, if a delivery key doesn't exist
  for a locale, that page has no content for that locale.
- **Respect the nesting chain**: `Slider → Section → Grid → Accordion → Accordion Item → leaves`. Amplience rejects
  cyclic `$ref`s with a sync error when a container references the same type again (Section in Section, Grid in
  Grid, or Section inside Grid inside Section). Keep new container schemas on one side of the chain. Use sibling
  containers on the Page when you need repeated layout wrappers.

### Performance

- **Delivery key fetches are single-request**: every page, homepage, and PLP content item resolves in one request
  by its locale-prefixed delivery key. The integration deliberately does not use the Filter API.
- **Lazy loading**: use `lazy: true` in `asyncDataOption` for below-the-fold content.

### SEO Considerations

- **Unique meta tags**: `metaTitle`, `metaDescription`, and `robots` are plain fields on the page schema, set them
  per locale content item.
- **Hreflang tags**: `generateAmplienceHreflangLinks` builds `<link rel="alternate">` tags from the available shops,
  already wired into `PageComponent.vue`.
- **Canonical URLs**: `PageComponent.vue` already sets a sanitized canonical URL per page.

## Troubleshooting

### Preview shows published content only

Confirm the `vse=` query parameter is present in the URL **and** `NUXT_PUBLIC_CMS_ALLOW_DRAFTS=true`. Without either,
the plugin builds the published CD2 client and serves published content only.

### Content not found

Verify the content item's delivery key is prefixed with the shop locale (for example `de-DE/content/about`, not
`content/about`).

### PLP content not found

Verify the PLP content item's delivery key matches `{locale}/c/c-{id}` (for example `de-DE/c/c-100`).

### Images not loading

Confirm Dynamic Media is enabled and image link fields include `defaultHost`, `endpoint`, and `name`.

In VSE preview, content responses set `defaultHost` to the staging domain. Browser `<img>` requests
cannot send VSE authorization headers, so those URLs fail even when the asset is published. The
provider rewrites staging media hosts to `cdn.media.amplience.net` in `buildAmplienceImageUrl`.
Unpublished-only assets still require signed VSE media URLs.

### Preview does not update as I type

This is expected. Preview is save-and-refresh: save the content item in Dynamic Content and the iframe reloads with
the change. Realtime, keystroke-level preview is not implemented in this boilerplate (it would need
`dc-visualization-sdk` wiring).

### Preview pane stays blank

Confirm the visualization `templatedUri` resolves to a reachable origin and includes `?vse={{vse.domain}}`, and that
the delivery key exists for the previewed locale. For deployed or ngrok origins, also confirm the origin is reachable
from the browser rendering the iframe.

### ngrok preview doesn't load

Open the ngrok forwarding URL directly in the same browser once to clear the interstitial warning page before
loading it inside the Amplience iframe.

### Hub sync fails with a cyclic schema reference error

A schema references a container that, directly or transitively, references it back. Check the nesting chain
described in [Creating Custom Components](#creating-custom-components) and keep new container schemas on one side
of `Slider → Section → Grid → Accordion → Accordion Item → leaves`.

### Content type shows no title in the editor

The content palette item's `oneOf` wrapper `title` can get dropped when Amplience merges an `allOf`/`$ref` to a full
content-type schema. Compare against a working entry in `schemas/schemas/page-component-schema.json` for the
expected `title`/`componentType.const` structure.

## Additional Resources

- [Amplience Dynamic Content docs](https://amplience.com/developers/docs/)
- [dc-delivery-sdk-js](https://github.com/amplience/dc-delivery-sdk-js)
- [dc-visualization-sdk](https://github.com/amplience/dc-visualization-sdk)
- [dc-cli](https://github.com/amplience/dc-cli)
- [Filter API](https://amplience.com/developers/docs/apis/content-delivery/filter-api/)
- [Visualizations guide](https://amplience.com/developers/docs/dev-tools/guides-tutorials/visualizations/)
