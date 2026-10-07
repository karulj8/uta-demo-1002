import type { StoryObj, ComponentPropsAndSlots } from '@storybook-vue/nuxt'
import type { Product, CentAmount } from '@scayle/storefront-nuxt'
import {
  productFactory,
  priceFactory,
} from '@scayle/storefront-nuxt/dist/test/factories'
import SFBaseProductSlider from './SFBaseProductSlider.vue'
import type { AsyncDataRequestStatus } from '#app'

/**
 * SFBaseProductSlider displays a horizontal slider of product cards with navigation controls.
 * It supports loading states, responsive layouts, and campaign integration for product recommendations and listings.
 */
export default {
  title: 'Product/SFBaseProductSlider',
  component: SFBaseProductSlider,
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['idle', 'pending', 'success', 'error'],
      description:
        'The async data request status that controls whether to show loading skeletons or products.',
    },
  },
  render: (args: ComponentPropsAndSlots<typeof SFBaseProductSlider>) => ({
    components: { SFBaseProductSlider },
    setup() {
      return { args }
    },
    template: `
      <div class="w-2/3 p-6 bg-gray-50">
        <SFBaseProductSlider v-bind="args" />
      </div>
    `,
  }),
}

// Create sample products with realistic data
const sampleProducts: Product[] = [
  productFactory.build({
    id: 1,
    referenceKey: 'SHOE-001',
    isNew: true,
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'Nike',
          value: 'nike',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Air Max 90',
          value: 'air-max-90',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
      {
        hash: 'product-2-big.avif',
        name: 'product-2-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 12999 as CentAmount,
        withoutTax: 10923 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 12999 as CentAmount,
        withoutTax: 10923 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 2,
    referenceKey: 'SHOE-002',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'Adidas',
          value: 'adidas',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Sneakers',
          value: 'Sneakers-22',
        },
      },
    },
    images: [
      {
        hash: 'product-3-big.avif',
        name: 'product-3-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.25,
              absoluteWithTax: 3000 as CentAmount,
            },
          },
        ],
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 11999 as CentAmount,
        withoutTax: 10084 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 3,
    referenceKey: 'SHIRT-001',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'H&M',
          value: 'hm',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Cotton T-Shirt',
          value: 'cotton-t-shirt',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 1999 as CentAmount,
        withoutTax: 1680 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 1999 as CentAmount,
        withoutTax: 1680 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 4,
    referenceKey: 'JEANS-001',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: "Adidas's",
          value: 'Adidas',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: '501 Original Jeans',
          value: '501-original-jeans',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 5,
    referenceKey: 'JACKET-001',
    isSoldOut: true,
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'The North Face',
          value: 'tnf',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Down Jacket',
          value: 'down-jacket',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 25999 as CentAmount,
        withoutTax: 21848 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 25999 as CentAmount,
        withoutTax: 21848 as CentAmount,
      }),
    },
  }),
]

const sampleProductsWithSale: Product[] = [
  productFactory.build({
    id: 1,
    referenceKey: 'SHOE-001',
    isNew: true,
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'Nike',
          value: 'nike',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Air Max 90',
          value: 'air-max-90',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
      {
        hash: 'product-2-big.avif',
        name: 'product-2-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 12999 as CentAmount,
        withoutTax: 10923 as CentAmount,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.25,
              absoluteWithTax: 3000 as CentAmount,
            },
          },
        ],
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 12999 as CentAmount,
        withoutTax: 10923 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 2,
    referenceKey: 'SHOE-002',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'Adidas',
          value: 'adidas',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Sneakers',
          value: 'sneakers',
        },
      },
    },
    images: [
      {
        hash: 'product-3-big.avif',
        name: 'product-3-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.25,
              absoluteWithTax: 3000 as CentAmount,
            },
          },
        ],
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 11999 as CentAmount,
        withoutTax: 10084 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 3,
    referenceKey: 'SHIRT-001',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'H&M',
          value: 'hm',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Cotton T-Shirt',
          value: 'cotton-t-shirt',
        },
      },
    },
    images: [
      {
        hash: 'product-1-big.avif',
        name: 'product-1-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 1999 as CentAmount,
        withoutTax: 1680 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 1999 as CentAmount,
        withoutTax: 1680 as CentAmount,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.25,
              absoluteWithTax: 3000 as CentAmount,
            },
          },
        ],
      }),
    },
  }),
  productFactory.build({
    id: 4,
    referenceKey: 'JEANS-001',
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: "Adidas's",
          value: 'Adidas',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: '501 Original Jeans',
          value: '501-original-jeans',
        },
      },
    },
    images: [
      {
        hash: 'product-2-big.avif',
        name: 'product-2-big.avif',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 8999 as CentAmount,
        withoutTax: 7562 as CentAmount,
      }),
    },
  }),
  productFactory.build({
    id: 5,
    referenceKey: 'JACKET-001',
    isSoldOut: true,
    attributes: {
      brand: {
        id: 1,
        key: 'brand',
        label: 'Brand',
        type: 'string',
        multiSelect: false,
        values: {
          id: 1,
          label: 'The North Face',
          value: 'tnf',
        },
      },
      name: {
        id: 2,
        key: 'name',
        label: 'Name',
        type: 'string',
        multiSelect: false,
        values: {
          id: 2,
          label: 'Down Jacket',
          value: 'down-jacket',
        },
      },
    },
    images: [
      {
        hash: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
        name: 'photo-1551028719-00167b16eac5',
        attributes: {},
      },
    ],
    priceRange: {
      min: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 25999 as CentAmount,
        withoutTax: 21848 as CentAmount,
      }),
      max: priceFactory.build({
        currencyCode: 'EUR',
        withTax: 25999 as CentAmount,
        withoutTax: 21848 as CentAmount,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.3,
              absoluteWithTax: Math.floor(25999 * 0.3) as CentAmount,
            },
          },
        ],
      }),
    },
  }),
]

/**
 * Shows the slider with a collection of products.
 * Displays the standard state with multiple products in a scrollable slider format.
 */
export const Default: StoryObj<typeof SFBaseProductSlider> = {
  args: {
    title: 'Trending Now',
    products: sampleProducts,
    status: 'success' as AsyncDataRequestStatus,
  },
}

/**
 * Shows the slider in loading state with skeleton loaders.
 * Demonstrates the component while data is being fetched from the API.
 */
export const Loading: StoryObj<typeof SFBaseProductSlider> = {
  args: {
    title: 'Recommended for You',
    products: [],
    status: 'pending' as AsyncDataRequestStatus,
  },
}

/**
 * Shows the slider with a single product.
 * Demonstrates the component behavior when only one product is available (no scrolling needed).
 */
export const SingleProduct: StoryObj<typeof SFBaseProductSlider> = {
  args: {
    title: 'Featured Product',
    products: [
      productFactory.build({
        id: 1,
        referenceKey: 'SHOE-001',
        isNew: true,
        attributes: {
          brand: {
            id: 1,
            key: 'brand',
            label: 'Brand',
            type: 'string',
            multiSelect: false,
            values: {
              id: 1,
              label: 'Nike',
              value: 'nike',
            },
          },
          name: {
            id: 2,
            key: 'name',
            label: 'Name',
            type: 'string',
            multiSelect: false,
            values: {
              id: 2,
              label: 'Air Max 90',
              value: 'air-max-90',
            },
          },
        },
        images: [
          {
            hash: 'product-1.avif',
            name: 'product-1.avif',
            attributes: {},
          },
          {
            hash: 'product-2.avif',
            name: 'product-2.avif',
            attributes: {},
          },
        ],
        priceRange: {
          min: priceFactory.build({
            currencyCode: 'EUR',
            withTax: 12999 as CentAmount,
            withoutTax: 10923 as CentAmount,
          }),
          max: priceFactory.build({
            currencyCode: 'EUR',
            withTax: 12999 as CentAmount,
            withoutTax: 10923 as CentAmount,
          }),
        },
      }),
    ],
    status: 'success' as AsyncDataRequestStatus,
  },
}

/**
 * Shows the slider with no products.
 * Demonstrates the empty state when no products are available to display.
 */
export const EmptyState: StoryObj<typeof SFBaseProductSlider> = {
  args: {
    title: 'No Products Found',
    products: [],
    status: 'success' as AsyncDataRequestStatus,
  },
}

/**
 * Shows the slider with products on sale.
 * Demonstrates products with sale pricing and reduced prices clearly visible.
 */
export const SaleProducts: StoryObj<typeof SFBaseProductSlider> = {
  args: {
    title: 'Sale Items',
    products: sampleProductsWithSale,
    status: 'success' as AsyncDataRequestStatus,
  },
}
