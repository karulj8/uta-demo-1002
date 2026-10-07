import type { Meta } from '@storybook-vue/nuxt'
import SFRecentlyViewedProductsSlider from './SFRecentlyViewedProductsSlider.vue'
import DocsOnlyPage from '~~/.storybook/content/DocsOnly.mdx'

/**
 * SFRecentlyViewedProductsSlider is a wrapper component around SFBaseProductSlider
 * that displays recently viewed products using the useRecentlyViewedProducts composable.
 * It automatically scrolls to the first product when products are loaded and uses
 * a predefined title from translations.
 *
 * This component wraps SFBaseProductSlider with specific configuration for recently viewed products.
 * Since this is a wrapper component, all visual examples and story variants can be found in the base component's story.
 *
 * @see {@link ./SFBaseProductSlider.stories.ts} - Base component story with detailed examples and all story variants
 */
export default {
  title: 'Product/SFRecentlyViewedProductsSlider',
  component: SFRecentlyViewedProductsSlider,
  parameters: {
    docs: {
      description: {
        component:
          'This component is a wrapper around SFBaseProductSlider. For visual examples and story variants, see [SFBaseProductSlider stories](./?path=/docs/product-sfbaseproductslider--overview).',
      },
      page: DocsOnlyPage,
    },
  },
} satisfies Meta<typeof SFRecentlyViewedProductsSlider>
export const DocsOnly = {}
