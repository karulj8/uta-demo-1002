import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import { SmartSortingKey } from '@scayle/storefront-nuxt'
import SFSmartSortingProductsSlider from './SFSmartSortingProductsSlider.vue'

/**
 * Smart Sorting Products Slider component displays a horizontal carousel of products with navigation controls.
 * It fetches products using smart sorting keys (e.g., TOPSELLER, NEWEST) and renders them using the SFBaseProductSlider with customizable title display.
 */
interface SmartSortingProductSliderStoryArgs {
  title?: string
  smartSortingKey: SmartSortingKey
  brandId?: number
  categoryId?: number
  limit?: number
}

const meta = {
  title: 'Product/SFSmartSortingProductsSlider',
  component: SFSmartSortingProductsSlider,
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional title displayed above the product slider',
    },
    smartSortingKey: {
      control: 'select',
      description: 'The smart sorting key to use.',
      options: Object.values(SmartSortingKey),
    },
    brandId: {
      control: 'number',
      description: 'The brand id to filter by.',
    },
    categoryId: {
      control: 'number',
      description: 'The category id to filter by.',
    },
    limit: {
      control: 'number',
      description: 'The limit of amount of products to show.',
      defaultValue: 10,
    },
  },
  parameters: {
    docs: {
      // source: {
      //   code: `
      //     <template>
      //       <ProductSliderComponent :contentElement="contentElement" />
      //     </template>
      //   `,
      // },
      description: {
        component:
          'A product carousel component that fetches products using smart sorting keys and displays them in a horizontal slider with optional title.',
      },
    },
  },
  render: (args: SmartSortingProductSliderStoryArgs) => {
    return {
      components: { SFSmartSortingProductsSlider },
      setup() {
        const limit = computed(() => args.limit ?? 10)
        const smartSortingKey = computed(
          () => args.smartSortingKey ?? SmartSortingKey.TOPSELLER,
        )
        const brandId = computed(() => args.brandId ?? undefined)
        const categoryId = computed(() => args.categoryId ?? undefined)
        const title = computed(() => args.title ?? undefined)
        return { limit, smartSortingKey, brandId, categoryId, title }
      },
      template: `
        <SFSmartSortingProductsSlider :limit="limit" :smart-sorting-key="smartSortingKey" :brand-id="brandId" :category-id="categoryId" :title="title" />`,
    }
  },
}

export default meta

type Story = StoryObj<SmartSortingProductSliderStoryArgs>
/**
 * Default smart sorting products slider with title and sample product IDs
 */
export const Default: Story = {
  args: {
    title: 'Top Seller Products',
    smartSortingKey: SmartSortingKey.TOPSELLER,
    brandId: undefined,
    categoryId: undefined,
    limit: 10,
  } satisfies SmartSortingProductSliderStoryArgs,
}

/**
 * Smart sorting products slider for a specific brand
 */
export const WithFilteredBrand: Story = {
  args: {
    title: 'Top Seller Products',
    smartSortingKey: SmartSortingKey.TOPSELLER,
    brandId: 505,
    categoryId: undefined,
    limit: 10,
  } satisfies SmartSortingProductSliderStoryArgs,
}

/**
 * Smart sorting products slider for a specific category
 */
export const WithFilteredCategory: Story = {
  args: {
    smartSortingKey: SmartSortingKey.TOPSELLER,
    categoryId: 100,
  },
}
