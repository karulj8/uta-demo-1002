import { useBreakpoints } from '@vueuse/core'
import { useRuntimeConfig } from '#app/nuxt'

/**
 * Returns a configured breakpoints composable using the local Storefront UI module's breakpoint configuration.
 * Uses the breakpoints defined in the module options or falls back to default values.
 *
 * @returns VueUse `useBreakpoints` composable with configured breakpoint values
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const breakpoints = useDefaultBreakpoints()
 * const isMobile = breakpoints.smaller('md')
 * const isDesktop = breakpoints.greater('lg')
 * </script>
 * ```
 *
 * @see https://vueuse.org/core/useBreakpoints/
 */
export function useDefaultBreakpoints() {
  const { breakpoints } = useRuntimeConfig().public.storefrontUI
  return useBreakpoints(breakpoints)
}
