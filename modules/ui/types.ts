import type TailwindTransitionDuration from '#tailwind-config/theme/transitionDuration'

/**
 * Extracts numeric transition duration values from the Tailwind config.
 * Excludes the `'DEFAULT'` key and converts duration keys to numeric literal types.
 *
 * This type ensures type-safe transition durations that match your Tailwind configuration.
 *
 * @example
 * ```ts
 * // Assuming your tailwind.config has durations: 100, 200, 300, 500, 1000
 * const duration: TransitionDuration = 300 // ✓ Valid
 * const invalid: TransitionDuration = 400  // ✗ Type error
 * ```
 */
export type TransitionDuration =
  Exclude<
    keyof typeof TailwindTransitionDuration,
    'DEFAULT'
  > extends `${infer N extends number}`
    ? N
    : never
