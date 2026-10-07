import { provide } from 'vue'
import { inject, ref, type Ref } from 'vue'
import type { BREAKPOINTS } from '~~/config/ui'

/**
 * Context for responsive image sizing in nested CMS components.
 *
 * The CMS context is a shared context that can be used to store and retrieve data from parents components in the content tree.
 * Provides viewport fraction information that flows down the component tree,
 * enabling child components to calculate appropriate image sizes.
 */
export type CMSContext = {
  /**
   * The fraction that the viewport is covered on desktop by the current element
   */
  desktopViewportFraction: Ref<number>

  /**
   * The fraction that the viewport is covered on mobile by the current element
   */
  mobileViewportFraction: Ref<number>

  /**
   * The maximum width of the current element at each breakpoint
   * When a breakpoint is not provided, the element will be as wide as the viewport
   */
  maxWidths: Partial<Record<keyof typeof BREAKPOINTS, number>>
}

/**
 * Returns the {@link CMSContext} of the current component tree branch.
 *
 * Used in components that render images (e.g., SectionComponent) to get viewport
 * fractions from parent containers like GridComponent.
 *
 * @returns Current CMS context with viewport fractions and max widths
 *
 * @example
 * ```vue
 * <script setup>
 * const { desktopViewportFraction, mobileViewportFraction, maxWidths } = useCMSContext()
 *
 * const imageSizes = getImageSizes(
 *   desktopViewportFraction.value,
 *   mobileViewportFraction.value,
 *   maxWidths
 * )
 * </script>
 * ```
 */
export function useCMSContext(): CMSContext {
  return inject<CMSContext>('cmsContext', {
    desktopViewportFraction: ref(1),
    mobileViewportFraction: ref(1),
    maxWidths: {},
  })
}

/**
 * Provides {@link CMSContext context} about the CMS content tree. All data provided can be consumed by child components using {@link useCMSContext}.
 *
 * Used by container components (e.g., GridComponent) to inform children about
 * available viewport space. Merges with parent context, overwriting provided properties.
 *
 * @param context - Partial context to provide (merged with parent context)
 *
 * @example
 * ```vue
 * <script setup>
 * // GridComponent with 2 columns
 * const { mobileViewportFraction } = useCMSContext()
 *
 * provideCMSContext({
 *   desktopViewportFraction: computed(() => 0.5), // Half viewport
 *   mobileViewportFraction: computed(() => mobileViewportFraction.value / 2)
 * })
 * </script>
 * ```
 */
export function provideCMSContext(context: Partial<CMSContext>) {
  provide('cmsContext', {
    ...useCMSContext(),
    ...context,
  })
}
