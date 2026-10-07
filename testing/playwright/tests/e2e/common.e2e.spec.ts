import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixtures'
import { isMobile } from '../../support/utils'
import { ROUTES } from '../../support/constants'

/**
 * @file Contains end-to-end common to all pages across Storefront Application.
 */

test.beforeEach(async ({ homePage, countryDetector, page }) => {
  await homePage.navigate(page, '/', 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
})

/**
 * Verifies the functionality of the "Skip to Main Content" and
 * "Skip to Search" accessibility links, ensuring they correctly focus
 * the intended elements on the page for keyboard navigation.
 * Verifies that the "Skip to Basket" link opens the basket page when clicked.
 * Verifies that the "Skip to Basket" link is not visible on the basket page.
 */
test('C2167297 Verify Homepage Skip Links', async ({
  homePage,
  skipLinks,
  page,
  search,
  countryDetector,
  basketPage,
}) => {
  // Skip this test on mobile devices (keyboard navigation is not relevant)
  if (isMobile(page)) {
    test.skip()
  }

  await test.step('Verify Skip to Main Content', async () => {
    await homePage.homepageContent.press('Tab')
    await skipLinks.buttonSkipToMain.waitFor()

    await expect(skipLinks.buttonSkipToMain).toBeVisible()

    await skipLinks.buttonSkipToMain.focus()
    await skipLinks.buttonSkipToMain.press('Enter')

    await expect(homePage.homepageMainContent).toBeFocused()
  })

  await test.step('Verify Skip to Search', async () => {
    await page.reload()
    await homePage.homepageContent.waitFor()
    await countryDetector.closeModal()
    await homePage.homepageContent.press('Tab')
    await skipLinks.buttonSkipToSearch.waitFor()
    await skipLinks.buttonSkipToSearch.focus()
    await page.waitForLoadState('networkidle')
    await skipLinks.buttonSkipToSearch.press('Enter')
    await search.searchFormButton.nth(1).waitFor()
    await page.waitForTimeout(500)
    await search.searchFormButton.nth(1).focus()
    await search.searchFormButton.nth(1).press('Enter')
    await search.searchResetButton.nth(1).waitFor()

    await expect(search.searchResetButton.nth(1)).toBeVisible()
  })

  await test.step('Verify Skip to Basket', async () => {
    await page.reload()
    await homePage.homepageContent.waitFor()
    await countryDetector.closeModal()
    await homePage.homepageContent.press('Tab')
    await skipLinks.buttonSkipToBasket.waitFor()

    await expect(skipLinks.buttonSkipToBasket).toBeVisible()

    await skipLinks.buttonSkipToBasket.focus()
    await skipLinks.buttonSkipToBasket.press('Enter')
    await page.waitForTimeout(500)
    await basketPage.h1.waitFor()

    await expect(basketPage.emptyState).toBeVisible()
  })

  await test.step('Verify Skip to Basket button is not visible on Basket page', async () => {
    await basketPage.basketEmptyStateTitle.press('Tab')
    await skipLinks.buttonSkipToMain.waitFor()

    await expect(skipLinks.buttonSkipToMain).toBeVisible()
    await expect(skipLinks.buttonSkipToSearch).toBeVisible()
    await expect(skipLinks.buttonSkipToBasket).not.toBeVisible()
  })
})

/**
 * Verifies that the error page is loaded if user visits non-existing route.
 * Verifies that the redirection to Homepage is done when Continue shopping button is clicked.
 */
test('C2216651 Verify 404 error page', async ({
  homePage,
  page,
  countryDetector,
  errorPage,
  baseURL,
}) => {
  await test.step('Visit non-existing page and verify the page is loaded', async () => {
    await homePage.navigate(page, '/non-existing-route', 'networkidle')
    await countryDetector.closeModal()

    await expect(errorPage.errorPageLogo).toBeVisible()
    await expect(errorPage.errorPageCode).toContainText('404')
  })

  await test.step('Click Continue shopping button and verify Homepage is loaded', async () => {
    await errorPage.errorPageButtonContinue.click()
    await homePage.homepageContent.waitFor()

    expect(page.url()).toEqual(baseURL + ROUTES.homepageDefault)
  })
})
