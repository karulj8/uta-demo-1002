import type {
  SearchV2With,
  WishlistWithOptions,
  BasketWithOptions,
  ProductWith,
} from '@scayle/storefront-nuxt'
import type { RuntimeConfig } from 'nuxt/schema'
import {
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_COLOR,
  ATTRIBUTE_KEY_PRIMARY_IMAGE,
  ATTRIBUTE_KEY_PROMOTION,
  ATTRIBUTE_KEY_STOREFRONT_BADGE,
  ATTRIBUTE_KEY_PRIMARY_IMAGE_TYPE,
} from './attributeKeys'

/**
 * Product `with` parameters for Product Detail Page (PDP) and Basket.
 * Includes all attributes, advanced attributes, variants, images, categories, and siblings.
 */
export const PRODUCT_DETAIL_WITH_PARAMS = {
  attributes: 'all',
  advancedAttributes: 'all',
  variants: {
    attributes: 'all',
    lowestPriorPrice: true,
  },
  images: {
    attributes: {
      withKey: [ATTRIBUTE_KEY_PRIMARY_IMAGE],
    },
  },
  categories: 'all',
  siblings: {
    images: {
      attributes: {
        withKey: [ATTRIBUTE_KEY_PRIMARY_IMAGE],
      },
    },
    attributes: {
      withKey: [ATTRIBUTE_KEY_COLOR, ATTRIBUTE_KEY_NAME, ATTRIBUTE_KEY_BRAND],
    },
    priceRange: true,
  },
  priceRange: true,
  lowestPriorPrice: true,
  sellableTimeframe: true,
} satisfies ProductWith

/**
 * Product `with` parameters for Product Cards in listings.
 * Optimized subset of data for product tiles on PLP, search results, and wishlist.
 */
export const PRODUCT_TILE_WITH_PARAMS = {
  attributes: {
    withKey: [
      ATTRIBUTE_KEY_COLOR,
      ATTRIBUTE_KEY_NAME,
      ATTRIBUTE_KEY_BRAND,
      ATTRIBUTE_KEY_STOREFRONT_BADGE,
      ATTRIBUTE_KEY_PROMOTION,
    ],
  },
  images: {
    attributes: {
      withKey: [ATTRIBUTE_KEY_PRIMARY_IMAGE, ATTRIBUTE_KEY_PRIMARY_IMAGE_TYPE],
    },
  },
  categories: 'all',
  siblings: {
    images: {
      attributes: {
        withKey: [ATTRIBUTE_KEY_PRIMARY_IMAGE],
      },
    },
    attributes: {
      withKey: [ATTRIBUTE_KEY_COLOR, ATTRIBUTE_KEY_NAME, ATTRIBUTE_KEY_BRAND],
    },
    priceRange: true,
  },
  priceRange: true,
  lowestPriorPrice: true,
} satisfies ProductWith

/**
 * Default `with` parameters configuration for storefront entities.
 * Defines data inclusion rules for wishlist, basket, product, and search operations.
 */
export default {
  wishlist: {
    items: {
      product: PRODUCT_TILE_WITH_PARAMS,
    },
  } satisfies WishlistWithOptions,
  basket: {
    items: {
      product: PRODUCT_DETAIL_WITH_PARAMS,
      variant: PRODUCT_DETAIL_WITH_PARAMS.variants,
      promotion: true,
    },
    applicablePromotions: true,
  } satisfies BasketWithOptions,
  product: PRODUCT_DETAIL_WITH_PARAMS,
  searchV2: {
    product: PRODUCT_TILE_WITH_PARAMS,
    categories: {
      parents: 'all',
      children: 0,
    },
    navigationItem: {
      category: 'all',
    },
  } satisfies SearchV2With,
} satisfies RuntimeConfig['storefront']['withParams']
