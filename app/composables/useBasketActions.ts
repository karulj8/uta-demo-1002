import {
  extendPromise,
  ExistingItemHandling,
  AddToBasketFailureKind,
} from '@scayle/storefront-nuxt'
import type {
  AddOrUpdateItemType,
  BasketItem,
  BasketItemUpdateData,
} from '@scayle/storefront-nuxt'
import { useI18n, type Composer } from '#i18n'
import { useToast } from '~/composables/useToast'
import { useRouteHelpers } from '~/composables'
import { routeList } from '~/utils'
import { useBasket, useLog } from '#storefront/composables'
import { hasSubscriptionCustomData } from '~~/modules/subscription/helpers/subscription'
import { useApplyPromotions } from '#storefront-promotions/composables/useApplyPromotions'
import { useBasketEvents, useGlobalEvents } from '#tracking/composables'

export type AddToBasketItem = AddOrUpdateItemType & {
  productName: string
  interval?: string
  existingItemHandling?: ExistingItemHandling
}

export type UseBasketActionsReturn = {
  /** Adds an item to the basket and shows a success or error toast. Returns `true` if the item was added successfully, `false` otherwise. */
  addItem: (item: AddToBasketItem) => Promise<boolean>
  /** Removes an item from the basket and shows a success or error toast. Additionally triggers a `remove_from_cart` tracking event. Returns `true` if the item was added successfully, `false` otherwise. */
  removeItem: (item: BasketItem) => Promise<boolean>
  /** Updates the quantity of the passed basket item and shows a success or error toast. Additionally triggers a `add_to_basket` tracking event. Returns `true` if the item quantity was updated successfully, `false` otherwise. */
  updateItemQuantity: (
    item: BasketItem,
    newQuantity: number,
  ) => Promise<boolean>
}

/**
 * Returns a translation key for a basket error message based on the provided error.
 *
 * @param error - The error to determine the error message key for
 * @returns The translation key corresponding to the error type
 */
export const getBasketToastErrorMessage = (
  error: unknown,
  i18n: Composer,
  productName?: string,
) => {
  if (error instanceof Error) {
    if (
      error.cause === AddToBasketFailureKind.ITEM_ADDED_WITH_REDUCED_QUANTITY
    ) {
      return i18n.t(
        'add_to_basket.notification.add_with_reduced_quantity_error',
      )
    } else if (error.cause === AddToBasketFailureKind.ITEM_UNAVAILABLE) {
      return i18n.t(
        'add_to_basket.notification.add_to_basket_variant_out_of_stock_error',
      )
    } else if (
      error.cause === AddToBasketFailureKind.MAXIMUM_ITEM_COUNT_REACHED
    ) {
      return i18n.t(
        'add_to_basket.notification.add_to_basket_max_basket_items_error',
      )
    }
  }
  return i18n.t('add_to_basket.notification.add_to_basket_error', {
    productName,
  })
}

/**
 * A composable to make it easier to add, update and remove items from the basket.
 * In addition of interacting with the basket, it also takes care of tracking and displaying toast messages.
 *
 * @returns An {@link UseBasketActionsReturn} object containing functions to add, update and remove items from the basket.
 */

export function useBasketActions(): UseBasketActionsReturn &
  Promise<UseBasketActionsReturn> {
  const i18n = useI18n()
  const log = useLog()

  const { show } = useToast()

  const { getLocalizedRoute } = useRouteHelpers()

  const basket = useBasket()
  const { removeItemByKey, addItem: addItemToBasket, updateItem } = basket
  const { applyPromotions } = useApplyPromotions({ basket: basket.data })
  const { trackError } = useGlobalEvents()
  const { trackBasket } = useBasketEvents()

  const removeItem = async ({ key }: BasketItem) => {
    await removeItemByKey(key)
    await applyPromotions()
    trackBasket(basket.data.value?.cost, basket.data.value?.items)
    return true
  }

  const showAddItemSuccessMessage = (
    item: AddToBasketItem,
    hasSubscriptionData: boolean,
  ) => {
    const message = hasSubscriptionData
      ? i18n.t(
          'add_to_basket.notification.add_subscription_to_basket_success',
          {
            productName: item.productName,
            interval: item.interval,
          },
        )
      : i18n.t('add_to_basket.notification.add_to_basket_success', {
          productName: item.productName,
        })

    show(message, {
      type: 'SUCCESS',
      action: 'ROUTE',
      to: getLocalizedRoute(routeList.basket),
    })
  }

  const addItem = async (item: AddToBasketItem) => {
    try {
      const hasSubscriptionData = hasSubscriptionCustomData(item.customData)
      const existingItemHandling =
        item.existingItemHandling ||
        ExistingItemHandling.ADD_QUANTITY_TO_EXISTING
      await addItemToBasket({ ...item, existingItemHandling })
      await applyPromotions(basket.data)
      showAddItemSuccessMessage(item, hasSubscriptionData)
      trackBasket(basket.data.value?.cost, basket.data.value?.items)
      return true
    } catch (error) {
      log.error('Item could not be added to basket', error)
      show(getBasketToastErrorMessage(error, i18n, item.productName), {
        type: 'ERROR',
        action: 'CONFIRM',
      })
      trackError({
        code: 500,
        message: `Failed to add ${item.productName} to basket. ${error}`,
      })
      return false
    }
  }

  const updateItemQuantity = async (
    basketItem: BasketItem,
    newQuantity: number,
  ) => {
    try {
      await updateItem(basketItem.key, {
        quantity: newQuantity,
        customData:
          basketItem?.customData as BasketItemUpdateData['customData'],
        displayData: basketItem?.displayData,
        itemGroup: basketItem?.itemGroup,
        promotions: basketItem?.promotions,
      })
      await applyPromotions(basket.data)

      trackBasket(basket.data.value?.cost, basket.data.value?.items)
      return true
    } catch (error) {
      log.error('Item quantity could not be updated', error)
      trackError({
        code: 500,
        message: `Failed to update item quantity for basket item. ${error}`,
      })
      return false
    }
  }

  return extendPromise(
    basket.then(() => ({})),
    {
      removeItem,
      addItem,
      updateItemQuantity,
    },
  )
}
