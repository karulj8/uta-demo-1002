import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { SmartSortingProductsSliderComponent } from '../types'
import SmartSortingProductsSliderComponentVue from './SmartSortingProductsSliderComponent.vue'

/**
 * Storyblok Smart Sorting Products Slider component displays a horizontal carousel of products with navigation controls.
 * It fetches products using smart sorting keys (e.g., TOPSELLER, NEWEST) and renders them using the SFBaseProductSlider with customizable title display.
 */
interface SmartSortingProductSliderStoryArgs {
  title?: string
  smartSortingKey?:
    | ''
    | 'scayle:v1:sales-push'
    | 'scayle:v1:new-arrivals'
    | 'scayle:v1:balanced-offerings'
    | 'scayle:v1:inventory-optimization'
    | 'scayle:v1:luxury-promotion'
    | 'scayle:v1:stock-coverage'
    | 'scayle:v1:topseller'
    | 'scayle:v1:revenue-max'
    | 'scayle:v1:recently-popular'
  brandId?: string
  categoryId?: string
  limit?: string
}

const createContentElement = (
  smartSortingKey:
    | ''
    | 'scayle:v1:sales-push'
    | 'scayle:v1:new-arrivals'
    | 'scayle:v1:balanced-offerings'
    | 'scayle:v1:inventory-optimization'
    | 'scayle:v1:luxury-promotion'
    | 'scayle:v1:stock-coverage'
    | 'scayle:v1:topseller'
    | 'scayle:v1:revenue-max'
    | 'scayle:v1:recently-popular' = 'scayle:v1:topseller',
  title?: string,
  brandId?: string,
  categoryId?: string,
  limit?: string,
): SmartSortingProductsSliderComponent => ({
  smartSortingKey,
  title,
  brandId,
  categoryId,
  limit,
  component: 'SmartSortingProductsSliderComponent',
  _uid: 'smart-sorting-products-slider-story-uid',
})

const meta = {
  title: 'CMS Storyblok/SmartSortingProductsSlider',
  component: SmartSortingProductsSliderComponentVue,
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
        '',
        'scayle:v1:sales-push',
        'scayle:v1:new-arrivals',
        'scayle:v1:balanced-offerings',
        'scayle:v1:inventory-optimization',
        'scayle:v1:luxury-promotion',
        'scayle:v1:stock-coverage',
        'scayle:v1:topseller',
        'scayle:v1:revenue-max',
        'scayle:v1:recently-popular',
      ],
      name: 'contentElement.smartSortingKey',
    },
    brandId: {
      control: 'text',
      description: 'The brand id to filter by.',
      name: 'contentElement.brandId',
    },
    categoryId: {
      control: 'text',
      description: 'The category id to filter by.',
      name: 'contentElement.categoryId',
    },
    limit: {
      control: 'text',
      description: 'The limit of amount of products to show.',
      defaultValue: '10',
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
      components: {
        SmartSortingProductsSliderComponent:
          SmartSortingProductsSliderComponentVue,
      },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.smartSortingKey ?? 'scayle:v1:topseller',
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
    smartSortingKey: 'scayle:v1:topseller',
    brandId: undefined,
    categoryId: undefined,
    limit: '10',
  } satisfies SmartSortingProductSliderStoryArgs,
}

/**
 * Smart sorting products slider for a specific brand
 */
export const WithFilteredBrand: Story = {
  args: {
    title: 'Top Seller Products',
    smartSortingKey: 'scayle:v1:topseller',
    brandId: '505',
    categoryId: undefined,
    limit: '10',
  } satisfies SmartSortingProductSliderStoryArgs,
}

/**
 * Smart sorting products slider for a specific category
 */
export const WithFilteredCategory: Story = {
  args: {
    smartSortingKey: 'scayle:v1:topseller',
    categoryId: '100',
  },
}
