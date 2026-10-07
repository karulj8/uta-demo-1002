/**
 * Storybook Mock for Storefront Composables
 *
 * This file provides mock implementations of Storefront composables for Storybook development.
 * It serves two main purposes:
 * 1. Prevents unnecessary API calls during Storybook development by mocking composables that would normally make API requests
 * 2. Provides consistent mock data for UI component development and testing
 *
 * When adding new composables to Storybook:
 * - For simple data needs: Add a mock implementation in this file
 * - For complex functionality: Import the actual composable from '@scayle/storefront-nuxt/composables'
 */

import { ref, toValue } from 'vue'
import {
  attributeGroupSingleFactory,
  automaticDiscountPromotionFactory,
  basketItemsFactory,
  buyXGetYPromotionFactory,
  productFactory,
  promotionWithCodeFactory,
} from '@scayle/storefront-nuxt/dist/test/factories'
import type { ProductWhere } from '@scayle/storefront-nuxt'
import {
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_NAME,
} from '#shared/constants/attributeKeys'

export { useProductPrice } from '@scayle/storefront-nuxt/composables'

// --- core ---
export function useAvailableShops() {
  return ref([])
}

export function useCurrentShop() {
  return ref({
    domain: 'localhost:3000',
    path: 'de',
    locale: 'de-DE',
    shopId: 1918,
    currency: 'EUR',
    isActive: true,
    checkout: {
      host: 'https://next-qa.checkout.api.scayle.cloud',
    },
    apiBasePath: '/api',
    paymentProviders: [
      'lastschrift',
      'visa',
      'mastercard',
      'discover',
      'diners',
      'ratepay',
      'klarna',
      'paypal',
    ],
    countryCode: 'DE',
    requiresConsentManagement: false,
  })
}

// We mock the `useFormatHelpers` composable to isolate this component for Storybook.
// This mock provides a simple implementation that returns formatted values (like currency and percentages)
// to ensure the story accurately represents the component's appearance with formatted data.
export function useFormatHelpers() {
  return {
    formatCurrency: (value: number) => `€${(value / 100).toFixed(2)}`,
    formatPercentage: (value: number) =>
      value.toLocaleString('en-US', {
        style: 'percent',
      }),
  }
}

export function useLog() {
  return {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }
}

export function useIDP() {}

export function useRpc() {
  return {
    data: ref(null),
    error: ref(null),
    status: ref('success'),
    refresh: () => {},
    then: () => Promise.resolve({}),
  }
}

export function useRpcCall() {
  return () => Promise.resolve({})
}

export function useSession() {
  return ref({})
}

export function useUser() {
  return ref({})
}

// --- storefront ---
export function useBasket() {
  return { data: ref({ items: basketItemsFactory.build() }) }
}
export function useBrand() {
  return { data: ref({}) }
}
export function useBrands() {
  return { data: ref([]) }
}
export function useCategories() {
  return { data: ref([]) }
}
export function useCategoryById() {
  return { data: ref({}) }
}
export function useCategoryByPath() {
  return { data: ref([]) }
}
export function useCurrentPromotions() {
  return {
    data: ref({
      entities: [
        automaticDiscountPromotionFactory.build({
          customData: { product: { attributeId: 1 } },
        }),
        buyXGetYPromotionFactory.build({
          customData: {
            product: { attributeId: 1 },
            color: {
              background: '#800080',
              text: '#fff',
            },
          },
        }),
        promotionWithCodeFactory.build({
          customData: {
            product: { attributeId: 1 },
            color: {
              background: '#ffbf00',
              text: '#fff',
            },
          },
        }),
      ],
    }),
  }
}
export function useCampaign() {
  return { data: ref({}) }
}
export function useFilters() {
  return { data: ref([]) }
}
export function useNavigationTree() {
  return { data: ref({}) }
}
export function useNavigationTrees() {
  return { data: ref([]) }
}
export function useOrder() {
  return { data: ref({}) }
}
export function useOrderConfirmation() {
  return { data: ref({}) }
}
export function useProduct() {
  return { data: ref({}) }
}
export function useProducts(options: {
  params: { categoryId?: number; where: ProductWhere; perPage?: number }
}) {
  const resolvedParams = toValue(options.params)
  const getBrand = () => {
    const brandAttribute = resolvedParams?.where?.attributes?.find(
      (attribute) => attribute.key === 'brand',
    )
    const brandId =
      brandAttribute &&
      'values' in brandAttribute &&
      typeof brandAttribute.values[0] === 'number'
        ? brandAttribute?.values?.[0]
        : 1

    return attributeGroupSingleFactory.build({
      key: ATTRIBUTE_KEY_BRAND,
      label: 'Brand',
      type: 'string',
      values: {
        label: `Brand ${brandId}`,
        id: brandId,
        value: `brand-${brandId}`,
      },
    })
  }
  const products = Array.from(
    { length: resolvedParams.perPage ?? 10 },
    (_, index) =>
      productFactory.build({
        id: index + 1,
        attributes: {
          brand: getBrand(),
          name: attributeGroupSingleFactory.build({
            key: ATTRIBUTE_KEY_NAME,
            label: `Test Product ${index + 1}`,
            values: {
              label: `Test Product ${index + 1}`,
            },
          }),
        },
        images: [
          {
            hash: `product-${(index % 3) + 1}-big.avif`,
            name: `product-${(index % 3) + 1}-big.avif`,
            attributes: {},
          },
        ],
        categories: [
          [
            {
              categoryId: resolvedParams.categoryId ?? 1,
              categoryName: `Category ${resolvedParams.categoryId ?? 1}`,
              categorySlug: 'cat',
              categoryUrl: '/cat',
              categoryHidden: false,
              categoryProperties: [],
            },
          ],
        ],
      }),
  )
  return {
    data: ref({ products }),
    status: ref('success'),
  }
}

export function useProductsByIds(options: { params: { ids: number[] } }) {
  return {
    data: ref(
      (options.params.ids || []).map((id, index) =>
        productFactory.build({
          id,
          images: [
            {
              hash: `product-${(index % 3) + 1}-big.avif`,
              name: `product-${(index % 3) + 1}-big.avif`,
              attributes: {},
            },
          ],
        }),
      ),
    ),
    status: ref('success'),
  }
}
export function useProductsByReferenceKeys() {
  return { data: ref([]) }
}
export function useProductsCount() {
  return { data: ref(0) }
}
export function usePromotions() {
  return { data: ref([]) }
}
export function usePromotionsByIds() {
  return { data: ref([]) }
}
export function useShopConfiguration() {
  return { data: ref({}) }
}
export function useStorefrontSearch() {
  return { data: ref([]) }
}
export function useUserAddresses() {
  return { data: ref([]) }
}
export function useVariant() {
  return { data: ref({}) }
}
export function useCategoryTree() {
  return { data: ref([]) }
}

const contains = ref(true)
export function useWishlist() {
  return {
    data: ref([]),
    contains: () => contains.value,
    toggleItem: () => {
      contains.value = !contains.value
    },
    status: ref('success'),
  }
}
