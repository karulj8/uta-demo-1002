import type { StoryObj } from '@storybook-vue/nuxt'
import ProductSlider from './ProductSliderComponent.vue'

const meta = {
  title: 'CMS Amplience/Product Slider',
  component: ProductSlider,
}

export default meta
type Story = StoryObj<typeof ProductSlider>

export const Default: Story = {
  args: {
    contentElement: {
      headline: 'Featured Products',
      product_ids: [1, 2, 3],
    },
  },
}
