import type {
  AdvancedAttribute,
  AttributeGroupMulti,
  AttributeGroupSingle,
  Attributes,
  Order as BaseOrder,
  OrderItem as BaseOrderItem,
  ListOfPackages,
  LowestPriorPrice,
  OrderAddress as BaseOrderAddress,
} from '@scayle/storefront-nuxt'

/**
 * Category information included in order data.
 */
export interface OrderCategory {
  categoryHidden: boolean
  categoryId: number
  categoryName: string
  categorySlug: string
  categoryUrl: string
}

/**
 * Advanced attribute type used in order product data.
 */
export type OrderAdvancedAttribute = Omit<AdvancedAttribute, 'id' | 'type'>

/**
 * Single package from the order's package list.
 */
export type Package = ListOfPackages[0]

/**
 * Delivery date from a package.
 */
export type DeliveryDate = Package['deliveryDate']

/**
 * Package information with formatted delivery status.
 */
export type DeliveryInfo = Package & { formattedStatus: string }

/**
 * Product data structure in order responses.
 * Tenant-specific typing for products within orders.
 */
export interface OrderProduct {
  advancedAttributes: {
    [k: string]: OrderAdvancedAttribute
    advColor: OrderAdvancedAttribute
    productName: OrderAdvancedAttribute
  }
  attributes: Attributes & {
    brand: AttributeGroupSingle
    brandLogo: AttributeGroupSingle
    category: AttributeGroupMulti
    color: AttributeGroupSingle
    colorHex: AttributeGroupSingle
    description: AttributeGroupSingle
    name: AttributeGroupSingle
  }
  categories: OrderCategory[][]
  createdAt: string
  id: number
  images: {
    hash: string
  }[]
  masterKey: string
  name: string
  updatedAt: string
}

/**
 * Variant data structure in order responses.
 * Tenant-specific typing for variants within orders.
 */
export interface OrderVariant {
  attributes: Attributes & {
    size: AttributeGroupSingle
  }
  createdAt: string
  id: number
  images: {
    hash: string
  }[]
  referenceKey: string
  lowestPriorPrice: LowestPriorPrice
  stock: {
    isSellableWithoutStock: boolean
    quantity: number
    supplierId: number
    warehouseId: number
  }
  updatedAt: string
}

/**
 * Complete order with tenant-specific product and variant data.
 */
export type Order = BaseOrder<OrderProduct, OrderVariant>

/**
 * Single item within an order.
 */
export type OrderItem = BaseOrderItem<OrderProduct, OrderVariant>

/**
 * Array of order items.
 */
export type OrderItems = OrderItem[]

/**
 * Price information from an order item.
 */
export type OrderPrice = OrderItem['price']

/**
 * Address information associated with an order.
 */
export type OrderAddress = BaseOrderAddress
