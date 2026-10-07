import type { ValuesType } from 'utility-types'

/**
 * Available sizes for promotion headline text.
 */
export const PromotionHeadlineSize = {
  /** Base size for standard promotion headlines */
  BASE: 'base',
  /** Small size for compact promotion displays */
  SM: 'sm',
} as const

/* NOTE: The variables have been intentionally named the same as the type */
export type PromotionHeadlineSize = ValuesType<typeof PromotionHeadlineSize>

/**
 * Number of skeleton loader units to display while countdown timer is loading.
 *
 * This constant determines how many placeholder elements are shown during server-side
 * rendering before the countdown timer hydrates on the client. The skeleton loaders
 * provide a visual placeholder that matches the expected countdown format.
 *
 * @example
 * ```vue
 * <!-- Used in SFDealTimer.vue -->
 * <ClientOnly>
 *   <template #fallback>
 *     <div class="mx-1 flex">
 *       <SFSkeletonLoader
 *         v-for="n in COUNTDOWN_LOADER_UNITS"
 *         :key="n"
 *         type="custom"
 *         class="mx-1.5 h-3 !w-3.5 rounded-md"
 *       />
 *     </div>
 *   </template>
 *   <SFCountdown />
 * </ClientOnly>
 * ```
 */
export const COUNTDOWN_LOADER_UNITS = 4
