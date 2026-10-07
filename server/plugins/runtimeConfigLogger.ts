import { purifySensitiveData } from '@scayle/storefront-nuxt'

// NOTE: We need to import here from the Nuxt server-specific #imports to mitigate
// unresolved dependencies in the imported composables from Nitro (nitropack).
// This results in `nuxt typecheck` not being able to properly infer the correct
// import and throw an error without explicit `@ts-expect-error`
// @ts-expect-error TS2724: '"#imports"' has no exported member named 'defineNitroPlugin'. Did you mean 'defineNuxtPlugin'?
import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import { stringToBoolean } from '~~/server/utils/boolean'

/**
 * Logs the sanitized runtime configuration at application startup.
 *
 * This Nitro plugin helps with development and debugging by logging the runtime configuration
 * while ensuring sensitive data (tokens, passwords, secrets) is redacted before logging.
 *
 * **Configuration:**
 * - Set `CONFIG_LOG_RUNTIME_ENABLED=true` to enable runtime config logging
 * - Set `CONFIG_LOG_PRETTIER_ENABLED=true` to format the output with indentation
 *
 * @note
 * The plugin automatically detects and redacts common sensitive key patterns including:
 * `token`, `password`, `clientSecret`, `apiToken`, and `secret`.
 *
 * @example
 * ```bash
 * # Enable runtime config logging with pretty formatting
 * CONFIG_LOG_RUNTIME_ENABLED=true CONFIG_LOG_PRETTIER_ENABLED=true npm run dev
 * ```
 */
export default defineNitroPlugin(() => {
  // Early return if runtime config logging is disabled
  // Controlled via `CONFIG_LOG_RUNTIME_ENABLED` environment variable
  if (!stringToBoolean(process.env.CONFIG_LOG_RUNTIME_ENABLED)) {
    return
  }

  const runtimeConfig = useRuntimeConfig()

  // Define keys that contain sensitive information and should be redacted
  // These patterns match common naming conventions for sensitive configuration values
  const sensitiveKeys = [
    'token',
    'password',
    'clientSecret',
    'apiToken',
    'secret',
  ]

  // Sanitize the runtime config by replacing sensitive values with '[REDACTED]'
  const loggableConfig: Record<string, unknown> = purifySensitiveData(
    runtimeConfig,
    sensitiveKeys,
  )

  // Format the output based on `CONFIG_LOG_PRETTIER_ENABLED` setting
  // Pretty printing adds indentation for better readability during development
  const configToPrint = stringToBoolean(process.env.CONFIG_LOG_PRETTIER_ENABLED)
    ? JSON.stringify(loggableConfig, null, 2) // Pretty-printed with 2-space indentation
    : JSON.stringify(loggableConfig) // Compact single-line output

  console.log(
    '[storefront-application] runtimeConfig after startup:',
    configToPrint,
  )
})
