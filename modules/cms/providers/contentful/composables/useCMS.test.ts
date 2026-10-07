import { describe, it, expect } from 'vitest'
import { isUnconfiguredLocaleError } from './useCMS'

describe('isUnconfiguredLocaleError', () => {
  it('returns true for actual Contentful BadRequest error with unknown locale', () => {
    // Real Contentful error structure - message is a stringified JSON object
    const error = {
      name: 'BadRequest',
      message:
        '{\n' +
        '  "status": 400,\n' +
        '  "statusText": "Bad Request",\n' +
        '  "message": "Unknown locale: en-DE",\n' +
        '  "details": {},\n' +
        '  "request": {\n' +
        '    "url": "https://cdn.contentful.com:443/spaces/test/environments/master/entries"\n' +
        '  }\n' +
        '}',
    }
    expect(isUnconfiguredLocaleError(error)).toBe(true)
  })

  it('returns false for BadRequest without locale-related message', () => {
    // Contentful error for different type of BadRequest
    const error = {
      name: 'BadRequest',
      message:
        '{\n' +
        '  "status": 400,\n' +
        '  "statusText": "Bad Request",\n' +
        '  "message": "Invalid query parameter: fields.invalidField",\n' +
        '  "details": {}\n' +
        '}',
    }
    expect(isUnconfiguredLocaleError(error)).toBe(false)
  })

  it('returns false for non-BadRequest errors', () => {
    // Even if message contains "Unknown locale", wrong error name should return false
    const error = {
      name: 'NotFound',
      message:
        '{\n' +
        '  "status": 404,\n' +
        '  "statusText": "Not Found",\n' +
        '  "message": "Unknown locale: en-DE"\n' +
        '}',
    }
    expect(isUnconfiguredLocaleError(error)).toBe(false)
  })

  it('returns false for non-object types, null or undefined', () => {
    expect(isUnconfiguredLocaleError('error string')).toBe(false)
    expect(isUnconfiguredLocaleError(123)).toBe(false)
    expect(isUnconfiguredLocaleError(true)).toBe(false)
    expect(isUnconfiguredLocaleError(null)).toBe(false)
    expect(isUnconfiguredLocaleError(undefined)).toBe(false)
  })

  it('returns false for error objects missing required properties', () => {
    expect(isUnconfiguredLocaleError({})).toBe(false)
    expect(isUnconfiguredLocaleError({ name: 'BadRequest' })).toBe(false)
    expect(
      isUnconfiguredLocaleError({
        message: '{\n  "status": 400,\n  "message": "Unknown locale: en-DE"\n}',
      }),
    ).toBe(false)
  })
})
