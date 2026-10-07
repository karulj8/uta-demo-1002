import { isClientSide } from './helper'
import { useRequestHeader } from '#imports'
import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router'

/**
 * Checks if Contentstack Live Preview is active.
 *
 * Detects the Live Preview editor by checking the referer or the `live_preview` query parameter.
 * Used to enable draft content and live reactivity during editing.
 *
 * Note: This composable requires the nuxt context to be available.
 *
 * @param route - Current route object
 * @returns `true` if Live Preview is active or the referer is the contentstack editor
 */
export const isInEditorMode = (
  _route: RouteLocationNormalizedLoadedGeneric,
) => {
  let referer: string | undefined | null
  if (!isClientSide()) {
    referer = useRequestHeader('referer')
  } else {
    referer = document.referrer
  }
  return (
    referer === 'https://app.contentstack.com/' ||
    'live_preview' in _route.query
  )
}
