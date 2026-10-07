import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { ref, watch } from 'vue'
import {
  useBasketEvents,
  useGlobalEvents,
  useWishlistEvents,
} from '../composables'
import {
  useBasket,
  useUser,
  useWishlist,
  useLog,
} from '#storefront/composables'

/**
 * Initializes Google Tag Manager (GTM) for client-side tracking.
 *
 * This plugin sets up GTM integration with Vue.js and configures automatic
 * tracking events for shop initialization, content views, basket changes, and
 * wishlist updates. The plugin only runs on the client-side and requires a
 * GTM container ID to be configured.
 *
 * The plugin performs the following operations:
 * - Initializes GTM with the configured container ID and options
 * - Enables router synchronization if configured (tracks page views automatically)
 * - Sets up watchers for user, basket, and wishlist state changes
 * - Tracks initial shop load and content view events after user data is available
 *
 * @note
 * Google Tag Manager requires an `id` to function. If the necessary `id` is not set,
 * the application will run into a crashing runtime error during startup.
 *
 * @see https://github.com/nuxt/nuxt/issues/26535
 */
export default defineNuxtPlugin((nuxt) => {
  const options = useRuntimeConfig().public?.tracking?.gtm
  const log = useLog()
  const shopInitialized = ref(false)

  // Google Tag Manager required an `id` to function. If necessary `id` is not set the application will run into a crashing runtime error during startup.
  if (!options?.id) {
    log?.warn(
      'Google Tag Manager could not be initialized because no `id` was provided.',
    )
    return
  }

  // Track initial events after page load when user, basket, and wishlist data is available.
  // Tracking earlier causes hydration mismatches because `useUser` only fetches data client-side,
  // making user data available on the client before the hydration is complete.
  // Additionally, we only want to track the shop initialization event once and 'page:loading:end' is called on every page load.
  // Therefore we use a ref to track if the shop initialization event has already been tracked and return early if it has.
  nuxt.hook('page:loading:end', () => {
    if (shopInitialized.value) {
      return
    }
    shopInitialized.value = true

    const { status: userStatus } = useUser()
    const {
      status: basketStatus,
      cost: basketCost,
      items: basketItems,
    } = useBasket()
    const { status: wishlistStatus, items: wishlistItems } = useWishlist()
    const { trackShopInitialization, trackContentView } = useGlobalEvents()
    const { trackBasket } = useBasketEvents()
    const { trackWishlist } = useWishlistEvents()

    watch(
      userStatus,
      (status) => {
        if (status === 'success') {
          trackShopInitialization()
          trackContentView()
        }
      },
      { once: true },
    )

    watch(
      basketStatus,
      (status) => {
        if (status === 'success') {
          trackBasket(basketCost.value, basketItems.value)
        }
      },
      { once: true },
    )

    watch(
      wishlistStatus,
      (status) => {
        if (status === 'success') {
          trackWishlist(wishlistItems.value)
        }
      },
      { once: true },
    )
  })
})
