import type { GlobalComponents } from 'vue'

/**
 * All icon component names available in the project.
 *
 * Any SVG file placed in `app/assets/icons` is automatically registered
 * globally as a Vue component by `nuxt-svgo`, using the `Icon` prefix.
 * For example, `foo-bar.svg` becomes the `IconFooBar` component.
 *
 * This type provides autocomplete for all icon component names throughout the repository,
 * ensuring correct usage of icon component names where `IconName` is used.
 */
export type IconName = keyof {
  [K in keyof GlobalComponents as K extends `Icon${string}`
    ? K
    : never]: GlobalComponents[K]
}
