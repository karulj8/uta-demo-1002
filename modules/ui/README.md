# Storefront UI Module

A comprehensive local UI module providing components, composables, and directives for building for building e-commerce applications with the SCAYLE Storefront Application.

## Overview

This module provides a complete set of UI primitives optimized for the SCAYLE Storefront Application. It includes:

- **Components**: Pre-built Vue components for common UI patterns
- **Composables**: Reusable composition functions for common behaviors
- **Directives**: Custom Vue directives for native browser APIs
- **Constants**: Type-safe constants for component variants and sizes
- **Utilities**: Helper functions for common UI tasks

## Installation

This module is already configured in the Storefront Application. To use it in your components:

```ts
// Import composables and utilities
import {
  useSlideIn,
  useNotification,
  Size,
  ButtonVariant,
} from '#storefront-ui'

// Import components (auto-imported by Nuxt)
import { SFButton, SFModal, SFSlideIn } from '#storefront-ui/components'
```

## Components

### Core Components

- `SFButton` - Versatile button component with multiple variants
- `SFBadge` - Badge/label component for status indicators
- `SFChip` - Chip component for tags and selections
- `SFCountdown` - Countdown timer component
- `SFModal` - Modal dialog component
- `SFSlideIn` - Slide-in panel component
- `SFPopover` - Popover component
- `SFSkeletonLoader` - Loading skeleton placeholders

### Form Components

- `SFCheckbox` - Checkbox input component
- `SFDropdown` - Dropdown select component
- `SFSwitch` - Toggle switch component
- `SFTextInput` - Text input component
- `SFPriceInput` - Specialized price input
- `SFFilterRangeSlider` - Range slider for filtering
- `SFValidatedInputGroup` - Input group with validation

### Navigation & Layout

- `SFLink` - Enhanced link component
- `SFGoBackLink` - Back navigation link
- `SFPagination` - Pagination component
- `SFHeadline` - Semantic headline component
- `SFAccordionEntry` - Accordion/collapsible component

### Sliders & Carousels

- `SFItemsSlider` - Horizontal/vertical item slider
- `SFSliderArrowButton` - Arrow button for sliders

### Notifications

- `SFToast` - Toast notification component
- `SFToastContainer` - Container for toast notifications

### Transitions

- `SFFadeInTransition` - Fade-in animation
- `SFFadeInFromBottomTransition` - Fade-in from bottom
- `SFSlideInFromLeftTransition` - Slide-in from left
- `SFSlideInFromBottomTransition` - Slide-in from bottom

## Composables

### `useDefaultBreakpoints()`

Returns VueUse breakpoints configured with the module's breakpoint settings.

```vue
<script setup lang="ts">
const breakpoints = useDefaultBreakpoints()
const isMobile = breakpoints.smaller('md')
const isDesktop = breakpoints.greater('lg')
</script>
```

### `useSlideIn(name, isInitiallyOpened?)`

Manages slide-in panel state with Nuxt's shared state.

```vue
<script setup lang="ts">
const { isOpen, toggle, close } = useSlideIn('cart')
</script>
```

### `useNotification()`

Manages toast notifications throughout the application.

```vue
<script setup lang="ts">
const { show, close, closeAll } = useNotification()

show('Item added to cart!', {
  duration: 3000,
  type: {
    classes: 'bg-green-500 text-white',
    iconComponent: 'IconCheck',
  },
})
</script>
```

### `usePagination(visiblePages, totalPages)`

Creates reactive pagination state based on URL query parameters.

```vue
<script setup lang="ts">
const {
  limitedPages,
  previousPage,
  nextPage,
  canNavigateLeft,
  canNavigateRight,
} = usePagination(3, 10)
</script>
```

### `useItemsSlider(sliderRef, mode)`

Manages slider/carousel functionality with scroll tracking.

```vue
<script setup lang="ts">
const sliderRef = ref<HTMLElement>()
const { next, prev, isNextEnabled, isPrevEnabled, activeSlide } =
  useItemsSlider(sliderRef, 'horizontal')
</script>
```

### `useDropdownKeyboardBehavior(refs, state)`

Implements comprehensive keyboard navigation for dropdowns.

```vue
<script setup lang="ts">
const rootRef = shallowRef<HTMLDivElement | null>(null)
const buttonRef = shallowRef<HTMLDivElement | null>(null)
const optionsRef = shallowRef<HTMLDivElement | null>(null)
const isOpen = ref(false)

useDropdownKeyboardBehavior(
  { rootRef, buttonRef, optionsRef },
  {
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    },
    isOpen,
  },
)
</script>
```

## Directives

### `v-dialog`

Controls native `<dialog>` elements with Vue transition support.

```vue
<template>
  <Transition>
    <dialog v-dialog.modal="isOpen">
      <!-- content -->
    </dialog>
  </Transition>
</template>
```

**Modifiers:**

- `.modal` - Opens as modal using `showModal()` instead of `show()`

### `v-popover`

Controls elements using the native Popover API with Vue transition support.

```vue
<template>
  <Transition>
    <div v-popover="isOpen">
      <!-- popover content -->
    </div>
  </Transition>
</template>
```

## Constants

Type-safe constants for component variants:

```ts
import { Size, ButtonVariant, LinkVariant, HeadlineSize } from '#storefront-ui' // Size variants
;(Size.SM, Size.MD, Size.LG, Size.XL) // Button variants
;(ButtonVariant.PRIMARY, ButtonVariant.SECONDARY, ButtonVariant.TERTIARY) // Link variants
;(LinkVariant.LOUD, LinkVariant.NORMAL, LinkVariant.WHISPER, LinkVariant.QUIET) // Headline sizes
;(HeadlineSize['3XL'], HeadlineSize['2XL'], HeadlineSize.XL)
```

## Utilities

### `showDividerTag(index, arrayLength)`

Determines if a divider should be shown between array items.

### `getDecimalPlacesForCurrency(currencyCode)`

Gets the number of decimal places for a currency.

### `roundDown(value, interval)`

Rounds a number down to the nearest interval.

### `roundUp(value, interval)`

Rounds a number up to the nearest interval.

## Configuration

Configure the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['./modules/ui'],
  'storefront-ui': {
    breakpoints: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
})
```

## Module Aliases

The module registers the following aliases:

- `#storefront-ui` - Points to `runtime/` directory
- `#storefront-ui/components` - Points to `runtime/components/` directory

## Best Practices

1. **Import from the module**: Always import from `#storefront-ui` for composables and utilities
2. **Use type-safe constants**: Use exported constants instead of magic strings
3. **Leverage composables**: Reuse provided composables for consistent behavior
4. **Follow accessibility**: Components are built with accessibility in mind
5. **Use Tailwind**: Style components using Tailwind CSS utility classes

## Architecture

The module follows a clean architecture:

```text
modules/ui/
├── index.ts              # Module definition
├── types.ts              # Type definitions
├── README.md             # This file
└── runtime/
    ├── index.ts          # Runtime exports
    ├── components/       # Vue components
    ├── composables/      # Composition functions
    ├── directives/       # Vue directives
    └── helpers/
        ├── constants.ts  # Type-safe constants
        └── utils.ts      # Utility functions
```

## Contributing

When adding new components or composables:

1. Add comprehensive JSDoc documentation
2. Include usage examples in JSDoc
3. Export from appropriate index files
4. Create Storybook stories for visual components
5. Add unit tests for complex logic
6. Update this README with new exports
