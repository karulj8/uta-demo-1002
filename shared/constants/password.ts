/**
 * Minimum required length for user passwords.
 *
 * This constant is used in password validation rules to enforce a minimum password length
 * of 8 characters.
 *
 * @note
 * This value must be aligned with the CO frontend configuration in the SCAYLE Panel
 * to ensure consistent password requirements across the platform.
 *
 * @example
 * ```ts
 * // Used in validation rules for password fields
 * const rules = computed(() => ({
 *   newPassword: {
 *     required: validationRules.required,
 *     password: validationRules.password,
 *     minLength: validationRules.minLength(PASSWORD_MIN_LENGTH),
 *   },
 * }))
 * ```
 */
export const PASSWORD_MIN_LENGTH = 8
