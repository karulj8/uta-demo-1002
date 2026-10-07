import type {
  NotificationOnClickActions,
  NotificationComponent,
} from '#storefront-ui'
import type { RouteLocationRaw } from '#vue-router'
import { useNotification } from '#storefront-ui'
import { useNuxtApp } from '#app'

export type ToastAction = 'CONFIRM' | 'ROUTE'
export type ToastType = 'INFO' | 'SUCCESS' | 'ERROR'
export type ToastOptions = {
  duration?: number
  action?: ToastAction
  type?: ToastType
  to?: RouteLocationRaw
}

export function useToast() {
  const { $i18n } = useNuxtApp()
  const notification = useNotification()

  const getAction = (action: ToastAction, to?: RouteLocationRaw) => {
    const classes = 'text-transform-unset font-normal'
    const actions = {
      CONFIRM: {
        class: classes,
        text: $i18n.t('notification.confirm'),
        onClick: (actions: NotificationOnClickActions) => actions.close(),
      },
      ROUTE: {
        class: classes,
        text: $i18n.t('notification.view'),
        href: to,
      },
    }

    return actions[action]
  }

  const getType = (toastType?: ToastType): NotificationComponent => {
    if (!toastType) {
      return {
        classes: 'text-white bg-primary',
      }
    }

    const type: Record<ToastType, NotificationComponent> = {
      SUCCESS: {
        classes: 'text-status-success bg-status-success-light',
        iconComponent: 'IconNotifySuccess',
      },
      INFO: {
        classes: 'text-accent bg-status-info',
        iconComponent: 'IconNotifyInfo',
      },
      ERROR: {
        classes: 'text-status-alert bg-status-alert-light',
        iconComponent: 'IconNotifyAlert',
      },
    }

    return type[toastType]
  }

  const show = (message: string, options: ToastOptions) => {
    const { action, type, to } = options

    notification.show(message, {
      ...options,
      action: action && getAction(action, to),
      type: getType(type),
    })
  }

  return {
    show,
  }
}
