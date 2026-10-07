/**
 * Converts a string value to a boolean.
 * Case-insensitive comparison checks if the string equals "true".
 * Returns the default value if the input is undefined or an empty string.
 *
 * @param value - The string value to convert to boolean, or undefined
 * @param defaultValue - The value to return if the input is undefined or empty (defaults to false)
 *
 * @returns The boolean representation of the string, or the default value
 *
 * @example
 * stringToBoolean('true') // returns true
 * stringToBoolean('True') // returns true
 * stringToBoolean('false') // returns false
 * stringToBoolean('') // returns false
 * stringToBoolean(undefined) // returns false
 * stringToBoolean(undefined, true) // returns true
 */
export const stringToBoolean = (
  value: string | undefined,
  defaultValue: boolean = false,
) => (value ? value.toLowerCase() === 'true' : defaultValue)
