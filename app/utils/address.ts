import type { OrderAddress } from '#shared/types/order'

/**
 * Formats order address based on country-specific conventions.
 * Used in order success page and order detail views.
 *
 * **Formatting rules:**
 * - USA: `houseNumber street` / `city, state zipCode`
 * - GBR: `houseNumber street` / `city zipCode`
 * - Other: `street houseNumber` / `zipCode city`
 *
 * @param address - Order address with recipient and location details
 * @returns Array of formatted address lines starting with recipient name
 *
 * @example
 * ```ts
 * getFormattedLocaleAddresses({
 *   countryCode: 'USA',
 *   recipient: { firstName: 'John', lastName: 'Doe' },
 *   houseNumber: '123',
 *   street: 'Main St',
 *   city: 'New York',
 *   state: 'NY',
 *   zipCode: '10001'
 * })
 * // Returns: ['John Doe', '123 Main St', 'New York, NY 10001']
 * ```
 */
export function getFormattedLocaleAddresses({
  countryCode,
  recipient,
  houseNumber,
  city,
  street,
  zipCode,
  additional,
  state,
}: OrderAddress): string[] {
  const fullName = `${recipient.firstName} ${recipient.lastName}`

  const localeAddresses = [fullName]
  if (countryCode === 'USA') {
    localeAddresses.push(
      `${houseNumber} ${street}`,
      `${city}, ${state} ${zipCode}`,
    )
  } else if (countryCode === 'GBR') {
    localeAddresses.push(`${houseNumber} ${street}`, `${city} ${zipCode}`)
  } else {
    localeAddresses.push(`${street} ${houseNumber}`, `${zipCode} ${city}`)
  }

  return additional ? [...localeAddresses, additional] : localeAddresses
}
