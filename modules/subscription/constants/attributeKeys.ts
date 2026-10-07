/**
 * Attribute key for determining if a product variant is eligible for subscription purchases.
 * Used in subscription flows to check if the selected product can be added to a subscription.
 * The attribute value should be `true` for subscription-eligible products.
 */
export const ATTRIBUTE_KEY_SUBSCRIPTION_ELIGIBILITY = 'subscriptionEligibility'

/**
 * Attribute key for retrieving available subscription intervals for a product variant.
 * Used to display subscription frequency options (e.g., weekly, monthly, quarterly)
 * in the subscription selection interface.
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/subscriptions
 */
export const ATTRIBUTE_KEY_SUBSCRIPTION_INTERVALS =
  'subscriptionAvailableIntervals'

/**
 * Attribute key for retrieving subscription term information from product attributes.
 * Used to display subscription duration details and terms on product detail pages.
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/subscriptions
 */
export const ATTRIBUTE_KEY_SUBSCRIPTION_TERM = 'subscriptionTerm'

/**
 * Attribute key for retrieving subscription cancellation policy information.
 * Used to display cancellation terms and policies to customers when they view
 * subscription options on product detail pages.
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/integrations/subscriptions
 */
export const ATTRIBUTE_KEY_SUBSCRIPTION_CANCELLATION_POLICY =
  'subscriptionCancellationPolicy'
