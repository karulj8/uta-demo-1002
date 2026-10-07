/**
 * Creates cache-optimized timestamp for navigation API calls.
 * Rounds down to the nearest minute by zeroing seconds and milliseconds,
 * enabling 1-minute cache windows across multiple requests.
 *
 * **Cache behavior:**
 * - Multiple calls within the same minute return identical timestamps
 * - Cache revalidates each minute with new timestamp
 * - Used with `visibleAt` parameter in navigation queries
 *
 * @returns ISO 8601 timestamp string with seconds/milliseconds zeroed
 *
 * @example
 * ```ts
 * // All calls within 14:30:00-14:30:59 return "2024-01-15T14:30:00.000Z"
 * const { data } = useHeaderNavigation({
 *   visibleAt: createCacheFriendlyTimestamp()
 * })
 * ```
 */
export function createCacheFriendlyTimestamp(): string {
  const now = new Date()

  now.setSeconds(0, 0)

  return now.toISOString()
}
