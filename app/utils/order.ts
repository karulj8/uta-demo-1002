import type { Attributes, AttributeGroup } from '@scayle/storefront-nuxt'
import type {
  Order,
  OrderProduct,
  OrderItem,
  Package,
} from '#shared/types/order'

/** Order items grouped by package ID with shipment details. */
type OrderDelivery = Record<number, { items: OrderItem[]; shipment: Package }>

/**
 * Groups order items by package for delivery tracking.
 * Used in order success page and order detail views to display shipments.
 *
 * @param orderData - Order containing items and packages
 *
 * @returns Object mapping package IDs to their items and shipment info
 *
 * @example
 * ```ts
 * // Display items grouped by shipment
 * const deliveries = getOrderDeliveries(order)
 * for (const { items, shipment } of Object.values(deliveries)) {
 *   console.log(`Package ${shipment.id}: ${items.length} items`)
 * }
 * ```
 */
export const getOrderDeliveries = ({
  items,
  packages,
}: Order): OrderDelivery => {
  if (!items?.length || !packages?.length) {
    return {}
  }

  const orderDelivery: OrderDelivery = {}
  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]))

  for (const item of items) {
    const shipment = packageMap.get(item.packageId)

    if (!shipment) {
      continue
    }

    orderDelivery[item.packageId] ??= { items: [], shipment }
    orderDelivery[item.packageId]!.items.push(item)
  }

  return orderDelivery
}

/**
 * Normalizes order product attributes to standard format.
 * Removes `id` and `type` properties while preserving all other attribute data.
 *
 * @param attributes - Order product attributes to normalize
 *
 * @returns Normalized attributes with `id` and `type` set to `null`
 *
 * @example
 * ```ts
 * const normalized = mapAttributes(orderProduct.attributes)
 * // { brand: { key: 'brand', label: 'Nike', id: null, type: null }, ... }
 * ```
 */
export const mapAttributes = (
  attributes: OrderProduct['attributes'],
): Attributes => {
  const newAttributes: Attributes = {}

  for (const key in attributes) {
    if (Object.hasOwn(attributes, key)) {
      newAttributes[key] = {
        ...attributes[key],
        id: null,
        type: null,
      } as AttributeGroup
    }
  }

  return newAttributes
}
