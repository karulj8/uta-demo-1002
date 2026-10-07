import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { TypeProductSliderComponentWithoutUnresolvableLinksResponse } from '../types'
import ProductSliderComponent from './ProductSliderComponent.vue'

/**
 * Contentful Product Slider component displays a horizontal carousel of products with navigation controls.
 * It fetches products by their IDs and renders them using the SFBaseProductSlider with customizable title display.
 */
interface ProductSliderStoryArgs {
  title?: string
  products?: Array<{ id: number }>
}

const createContentElement = (
  title?: string,
  products: Array<{ id: number }> = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
  ],
): TypeProductSliderComponentWithoutUnresolvableLinksResponse =>
  ({
    sys: {
      id: 'product-slider-basic',
      type: 'Entry',
      contentType: {
        sys: {
          id: 'productSliderComponent',
          type: 'Link',
          linkType: 'ContentType',
        },
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      locale: 'en-US',
      revision: 1,
    },
    fields: {
      title,
      products,
    },
    metadata: {
      tags: [],
      concepts: [],
    },
  }) as unknown as TypeProductSliderComponentWithoutUnresolvableLinksResponse

const meta = {
  title: 'CMS Contentful/ProductSlider',
  component: ProductSliderComponent,
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional title displayed above the product slider',
      name: 'contentElement.fields.title',
    },
    products: {
      control: 'object',
      description:
        'Array of product objects with ID references to fetch and display',
      name: 'contentElement.fields.products',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <ProductSliderComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A product carousel component that fetches products by their IDs and displays them in a horizontal slider with optional title.',
      },
    },
  },
  render: (args: ProductSliderStoryArgs) => {
    return {
      components: { ProductSliderComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(args.title, args.products),
        )
        return {
          contentElement,
        }
      },
      template: `<ProductSliderComponent :contentElement="contentElement" />`,
    }
  },
}

export default meta

type Story = StoryObj<ProductSliderStoryArgs>

/**
 * Default product slider with title and sample product IDs
 */
export const Default: Story = {
  args: {
    title: 'Featured Products',
    products: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
    ],
  },
}

/**
 * Product slider without a title, showing products only
 */
export const WithoutTitle: Story = {
  args: {
    products: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
  },
}
