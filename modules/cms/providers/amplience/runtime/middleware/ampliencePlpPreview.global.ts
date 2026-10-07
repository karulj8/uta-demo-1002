import {
  isAmplienceCategoryRoutePath,
  isInEditorMode,
  parseCategoryIdFromAmplienceDeliveryKey,
  resolveAmpliencePlpPreviewPath,
} from '../../utils/helpers'
import { defineNuxtRouteMiddleware, navigateTo } from '#app/composables/router'

/**
 * Rewrites PLP visualization URLs to include the category ID from `?key=`.
 *
 * Amplience visualization templates only expose `{{delivery.key}}`, not a separate
 * category ID token. The Product Listing Page content type therefore opens preview at
 * a placeholder path (`/c/cms-preview-0`). This middleware parses the category ID from
 * the delivery key (for example `en-US/c/c-91825`) and redirects to
 * `/c/cms-preview-91825` so the existing category page receives the correct route param.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!isInEditorMode(to)) {
    return
  }

  const previewKey = to.query.key
  if (typeof previewKey !== 'string' || previewKey.length === 0) {
    return
  }

  if (!isAmplienceCategoryRoutePath(to.path)) {
    return
  }

  const categoryIdFromKey =
    parseCategoryIdFromAmplienceDeliveryKey(previewKey)
  if (categoryIdFromKey === undefined) {
    return
  }

  const routeId = Number.parseInt(String(to.params.id), 10)
  if (routeId === categoryIdFromKey) {
    return
  }

  const targetPath = resolveAmpliencePlpPreviewPath(
    to.path,
    categoryIdFromKey,
  )
  if (targetPath === to.path) {
    return
  }

  return navigateTo({
    path: targetPath,
    query: to.query,
    hash: to.hash,
  })
})
