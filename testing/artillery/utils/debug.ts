import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Page } from '@playwright/test'

interface ErrorContext {
  testName: string
  path: string
  timestamp: string
  error: string
  screenshotPath?: string
}

const ARTILLERY_DEBUG = process.env.ARTILLERY_DEBUG === 'true'
const ARTILLERY_ERROR_DIR = '../reports/errors'
const ARTILLERY_SCREENSHOT_DIR = '../reports/screenshots'

/**
 * Captures comprehensive error context including screenshots and state.
 *
 * @param page The Playwright Page object.
 * @param testName The name of the test that failed.
 * @param path The URL path where the error occurred.
 * @param error The error that was thrown.
 *
 * @returns ErrorContext object with all debugging information.
 */
async function captureErrorContext(
  page: Page,
  testName: string,
  path: string,
  error: unknown,
): Promise<ErrorContext> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const errorMessage = error instanceof Error ? error.message : String(error)

  // Capture screenshot
  let screenshotPath: string | undefined

  if (ARTILLERY_DEBUG) {
    try {
      const screenshotDir = join(__dirname, ARTILLERY_SCREENSHOT_DIR)
      try {
        mkdirSync(screenshotDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      screenshotPath = join(
        screenshotDir,
        `${testName}-${timestamp}.png`.replace(/[^a-z0-9.-]/gi, '_'),
      )

      await page.screenshot({ path: screenshotPath, fullPage: true })
    } catch (screenshotError) {
      console.warn('Failed to capture screenshot:', screenshotError)
    }
  }

  const context: ErrorContext = {
    testName,
    path,
    timestamp,
    error: errorMessage,
    screenshotPath,
  }

  if (ARTILLERY_DEBUG) {
    // Write error context to file for later analysis
    try {
      const errorDir = join(__dirname, ARTILLERY_ERROR_DIR)

      try {
        mkdirSync(errorDir, { recursive: true })
      } catch {
        // Directory might already exist
      }

      const errorLogPath = join(
        errorDir,
        `${testName}-${timestamp}.json`.replace(/[^a-z0-9.-]/gi, '_'),
      )

      writeFileSync(errorLogPath, JSON.stringify(context, null, 2))
    } catch (logError) {
      console.warn('Failed to write error log:', logError)
    }
  }

  return context
}

/**
 * Logs error context in a readable format.
 *
 * @param context The error context to log.
 */
export function logErrorContext(context: ErrorContext): void {
  // Set ANSI color codes for error context
  // `\x1b[1m` -> bold
  // `\x1b[31m` -> red
  // `\x1b[33m` -> yellow
  // `\x1b[0m` -> reset
  console.error('\x1b[1m\x1b[31m\nERROR CONTEXT\x1b[0m')
  console.error(`\x1b[31m  > Test: ${context.testName}\x1b[0m`)
  console.error(`\x1b[31m  > Path: ${context.path}\x1b[0m`)
  console.error(`\x1b[31m  > Time: ${context.timestamp}\x1b[0m`)
  console.error(`\x1b[31m  > Error: ${context.error}\x1b[0m`)

  if (ARTILLERY_DEBUG && context.screenshotPath) {
    console.error(
      `\x1b[33m\n  > Screenshot saved: ${context.screenshotPath}\n\x1b[0m`,
    )
  }
}

/**
 * Wraps an async operation with comprehensive error handling and logging.
 *
 * @param page The Playwright Page object.
 * @param testName The name of the test.
 * @param path The URL path being tested.
 * @param operation The async operation to execute.
 *
 * @returns The result of the operation.
 */
export async function withErrorHandling<T>(
  page: Page,
  testName: string,
  path: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const context = await captureErrorContext(page, testName, path, error)

    logErrorContext(context)

    throw error
  }
}
