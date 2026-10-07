import type { Stack } from '@contentstack/delivery-sdk'
import { useNuxtApp } from '#app/nuxt'
/**
 * Provides access to the Contentstack stack instance.
 * @returns The Contentstack stack instance
 */
export function useContentstack() {
  const { $contentstack } = useNuxtApp() as unknown as {
    $contentstack: { stack: Stack }
  }

  return $contentstack.stack
}
