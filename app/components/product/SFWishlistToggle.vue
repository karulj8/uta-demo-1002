<template>
  <SFButton
    v-bind="$attrs"
    size="md"
    variant="raw"
    class="group rounded-md border-none bg-transparent p-1 !text-secondary transition duration-150 ease-in-out hover:scale-110 hover:bg-gray-300"
    :data-testid="
      isInWishlist
        ? 'remove-item-from-wishlist-button'
        : 'add-item-to-wishlist-button'
    "
    :loading="mounted && status === 'pending'"
    :aria-label="
      isInWishlist
        ? $t('wishlist_toggle.remove_from_wishlist')
        : $t('wishlist_toggle.add_to_wishlist')
    "
    :aria-busy="mounted && status === 'pending'"
    aria-live="off"
    :aria-disabled="isWishlistToggling"
    @click="onToggleWishlist"
  >
    <template #icon="{ _class }">
      <SFAsyncStatusWrapper :status="wishlistStatus">
        <IconCommerceWishlist
          v-if="
            (!isInWishlist && !isWishlistToggling) ||
            (isInWishlist && isWishlistToggling)
          "
          :class="_class"
          class="!size-4 fill-secondary group-hover:fill-primary"
        />
        <IconCommerceWishlisted
          v-else
          :class="_class"
          class="!size-4 fill-accent"
        />
        <template #loading>
          <IconCommerceWishlist
            :class="_class"
            class="!size-4 animate-pulse fill-gray-300"
          />
        </template>
      </SFAsyncStatusWrapper>
    </template>
  </SFButton>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '@scayle/storefront-nuxt'
import { useMounted } from '@vueuse/core'
import SFAsyncStatusWrapper from '../SFAsyncStatusWrapper.vue'
import { useWishlist } from '#storefront/composables'
import { SFButton } from '#storefront-ui/components'
import { IconCommerceWishlist, IconCommerceWishlisted } from '#components'
import { useWishlistEvents } from '#tracking/composables'

const { product, trackingItemListName, productIndex } = defineProps<{
  /**
   * The product object containing all product details including images, pricing, and attributes.
   */
  product: Product
  /**
   * The name of the item list.
   */
  trackingItemListName?: string
  /**
   * The index of the product in a list.
   */
  productIndex?: number
}>()

defineOptions({ inheritAttrs: false })

const { trackAddToWishlist, trackRemoveFromWishlist, trackWishlist } =
  useWishlistEvents()
const mounted = useMounted()
const isWishlistToggling = ref(false)

const productId = computed(() => product.id)

const { toggleItem, contains, status, items } = useWishlist()

const onToggleWishlist = async () => {
  if (isWishlistToggling.value) {
    return
  }

  isWishlistToggling.value = true
  await toggleItem({ productId: productId.value })

  if (isInWishlist.value) {
    trackAddToWishlist(product, trackingItemListName, productIndex)
    trackWishlist(items.value)
  } else {
    trackRemoveFromWishlist(product, trackingItemListName, productIndex)
    trackWishlist(items.value)
  }

  isWishlistToggling.value = false
}

const isInWishlist = computed(() => {
  return contains({ productId: productId.value })
})

const wishlistStatus = computed(() => {
  return mounted.value ? status.value : 'pending'
})
</script>
