import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { ProductSliderComponent as ProductSliderComponentType } from '../types'
import ProductSliderComponent from './ProductSliderComponent.vue'

/**
 * Storyblok Product Slider component displays a horizontal carousel of products with navigation controls.
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
): ProductSliderComponentType => ({
  title,
  products,
  component: 'ProductSliderComponent',
  _uid: 'product-slider-story-uid',
})

const meta = {
  title: 'CMS Storyblok/ProductSlider',
  component: ProductSliderComponent,
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional title displayed above the product slider',
      name: 'contentElement.title',
    },
    products: {
      control: 'object',
      description:
        'Array of product objects with ID references to fetch and display',
      name: 'contentElement.products',
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
