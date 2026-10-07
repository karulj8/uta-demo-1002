import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { SmartSortingProductsSliderComponent as SmartSortingProductsSliderComponentType } from '../types/gen/contentstack'
import SmartSortingProductsSliderComponent from './SmartSortingProductsSliderComponent.vue'

/**
 * Contentstack Smart Sorting Products Slider component displays a horizontal carousel of products with navigation controls.
 * It fetches products using smart sorting keys (e.g., TOPSELLER, NEWEST) and renders them using the SFBaseProductSlider with customizable title display.
 */
interface SmartSortingProductSliderStoryArgs {
  title?: string
  smartSortingKey?:
    | 'Sales Push'
    | 'New Arrivals'
    | 'Balanced Offerings'
    | 'Inventory Optimization'
    | 'Luxury Promotion'
    | 'Stock Coverage'
    | 'Topseller'
    | 'Revenue Max'
    | 'Recently Popular'
  brandId?: number
  categoryId?: number
  limit?: number
}

const createContentElement = (
  smartSortingKey:
    | 'Sales Push'
    | 'New Arrivals'
    | 'Balanced Offerings'
    | 'Inventory Optimization'
    | 'Luxury Promotion'
    | 'Stock Coverage'
    | 'Topseller'
    | 'Revenue Max'
    | 'Recently Popular' = 'Topseller',
  title?: string,
  brandId?: number,
  categoryId?: number,
  limit?: number,
): SmartSortingProductsSliderComponentType =>
  ({
    smart_sorting_key: smartSortingKey,
    title,
    brand_id: brandId,
    category_id: categoryId,
    limit,
    $: undefined,
  }) as unknown as SmartSortingProductsSliderComponentType

const meta = {
  title: 'CMS Contentstack/SmartSortingProductsSlider',
  component: SmartSortingProductsSliderComponent,
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional title displayed above the product slider',
      name: 'contentElement.title',
    },
    smartSortingKey: {
      control: 'select',
      description: 'The smart sorting key to use.',
      options: [
        'Sales Push',
        'New Arrivals',
        'Balanced Offerings',
        'Inventory Optimization',
        'Luxury Promotion',
        'Stock Coverage',
        'Topseller',
        'Revenue Max',
        'Recently Popular',
      ],
      name: 'contentElement.smart_sorting_key',
    },
    brandId: {
      control: 'number',
      description: 'The brand id to filter by.',
      name: 'contentElement.brand_id',
    },
    categoryId: {
      control: 'number',
      description: 'The category id to filter by.',
      name: 'contentElement.category_id',
    },
    limit: {
      control: 'number',
      description: 'The limit of amount of products to show.',
      defaultValue: 10,
      name: 'contentElement.limit',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <SmartSortingProductsSliderComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A product carousel component that fetches products using smart sorting keys and displays them in a horizontal slider with optional title.',
      },
    },
  },
  render: (args: SmartSortingProductSliderStoryArgs) => {
    return {
      components: { SmartSortingProductsSliderComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.smartSortingKey ?? 'Topseller',
            args.title,
            args.brandId,
            args.categoryId,
            args.limit,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `<SmartSortingProductsSliderComponent :contentElement="contentElement" />`,
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
    smartSortingKey: 'Topseller',
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
    smartSortingKey: 'Topseller',
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
    smartSortingKey: 'Topseller',
    categoryId: 100,
  },
}
