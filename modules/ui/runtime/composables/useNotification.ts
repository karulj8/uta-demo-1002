import { nanoid } from 'nanoid'
import { computed } from 'vue'
import { useState } from '#app/composables/state'
import type { RouteLocationRaw } from '#vue-router'
import type { IconName } from '#shared/types/icons'

/**
 * Default duration for notifications in milliseconds.
 */
export const DEFAULT_NOTIFICATION_DURATION = 5000

/**
 * Configuration options for displaying a notification.
 */
export type NotificationOptions = {
  /** Duration in milliseconds before auto-dismissal (defaults to `5000`ms) */
  duration?: number
  /** Optional action button configuration for user interaction */
  action?: NotificationActionHandler
  /** Notification visual styling and icon configuration */
  type: NotificationComponent
}

/**
 * Available actions for notification click handlers.
 */
export type NotificationOnClickActions = {
  /** Closes the notification */
  close: () => void
  /** Additional custom actions can be added */
  [key: string]: () => void
}

/**
 * Configuration for a notification action button.
 */
export type NotificationActionHandler = {
  /** Button text label */
  text: string
  /** Optional CSS classes for styling */
  class?: string
  /** Optional navigation route */
  href?: RouteLocationRaw
  /** Click handler with access to notification actions */
  onClick?: (actions: NotificationOnClickActions) => void
}

/**
 * Visual configuration for notification appearance.
 */
export type NotificationComponent = {
  /** CSS classes for styling the notification */
  classes: string
  /** Optional icon component name */
  iconComponent?: IconName
}

/**
 * Internal notification data structure.
 */
export type StorefrontNotification = {
  /** Unique identifier for the notification */
  id: string
  /** Notification message text */
  message: string
  /** Display duration in milliseconds */
  duration: number
  /** Optional action button configuration */
  action?: NotificationActionHandler
  /** Optional visual styling configuration */
  type?: NotificationComponent
}

/**
 * Manages toast notifications throughout the application.
 * Provides methods to show, close, and clear notifications with support for
 * custom styling, actions, and auto-dismissal.
 *
 * State is shared across the application using Nuxt's `useState`, allowing
 * notifications to be triggered from anywhere and displayed in a central location.
 *
 * @returns Object containing notification list and control methods
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { notifications, show, close, closeAll } = useNotification()
 *
 * // Show a success notification
 * const addToCart = () => {
 *   show('Item added to cart!', {
 *     duration: 3000,
 *     type: {
 *       classes: 'bg-green-500 text-white',
 *       iconComponent: 'IconNotifySuccess',
 *     },
 *     action: {
 *       text: 'View Cart',
 *       href: '/cart',
 *     },
 *   })
 * }
 *
 * // Show an error notification
 * const showError = () => {
 *   show('Something went wrong', {
 *     duration: 5000,
 *     type: {
 *       classes: 'bg-red-500 text-white',
 *       iconComponent: 'IconNotifyAlert',
 *     },
 *   })
 * }
 * </script>
 * ```
 */
export function useNotification() {
  const notifications = useState<StorefrontNotification[]>(
    'notifications',
    () => [],
  )

  /**
   * Shows a new notification with the specified message and options.
   *
   * @param message - The notification message to display
   * @param options - Configuration options for the notification
   */
  const show = (
    message: string,
    { duration, action, type }: NotificationOptions,
  ) => {
    notifications.value.push({
      message,
      id: `${nanoid()}-${Date.now()}`,
      duration: duration || DEFAULT_NOTIFICATION_DURATION,
      action,
      type,
    })
  }

  /**
   * Closes a specific notification by its ID.
   *
   * @param id - The unique identifier of the notification to close
   */
  const close = (id: string) => {
    notifications.value = notifications.value.filter((item) => item.id !== id)
  }

  /**
   * Closes all active notifications.
   */
  const closeAll = () => {
    notifications.value = []
  }

  return {
    /** Readonly computed list of all active notifications */
    notifications: computed(() => notifications.value),
    show,
    close,
    closeAll,
  }
}
