import { expect } from '@playwright/test'
import { test } from '../../fixtures/fixtures'
import { navigateToPlp } from '../../support/utils'
import { ROUTES } from '../../support/constants'

/**
 * @file Contains end-to-end tests for verifying the order overview page during the checkout process.
 */

test.beforeEach(async ({ homePage, page, countryDetector }) => {
  await homePage.navigate(page, '/', 'networkidle')
  await page.waitForLoadState('networkidle')
  await countryDetector.closeModal()
})

/**
 * Verifies the elements present on the checkout order overview page,
 * including items in the basket and delivery estimates.
 * Verifies the presence of a simplified footer on the checkout page
 * and the functionality to remove an item, leading to an empty basket state.
 *
 * Note: this test doesn't "buy" the product. The last verification point is on the
 * Checkout order overview page.
 */
test('C2132536 C2144177 Verify Checkout order overview', async ({
  checkoutPage,
  page,
  footer,
  mainNavigation,
  mobileNavigation,
  productListingPage,
  productDetailPage,
  breadcrumb,
  header,
  homePage,
  basketPage,
  countryDetector,
}) => {
  test.setTimeout(60000)

  await test.step('Adding product to Basket', async () => {
    await navigateToPlp(page, mobileNavigation, mainNavigation)
    await breadcrumb.breadcrumbCategoryActive.waitFor()
    await productListingPage.productImage.first().click()
    await productDetailPage.variantPicker.waitFor()
    await productDetailPage.chooseProductVariant()
    await productDetailPage.addProductToBasket()
    await productDetailPage.navigate(page, ROUTES.checkout, 'domcontentloaded')
  })

  await test.step('Visit Checkout page and check Items', async () => {
    const pageUrl = page.url()

    expect(pageUrl).toContain(ROUTES.checkout)
    await expect(async () => {
      await checkoutPage.basketContainer.waitFor()
      await expect(checkoutPage.basketContainer).toBeAttached()
      await expect(checkoutPage.itemQuantity).toBeVisible()
      await expect(checkoutPage.deliveryEstimate).toBeVisible()
    }).toPass()
  })

  await test.step('Verify simplified Footer in Checkout', async () => {
    await expect(footer.footerCopyright).toBeVisible()

    const count = await footer.simpleFooterLink.count()

    for (let i = 0; i < count; i++) {
      const link = footer.simpleFooterLink.nth(i)
      const href = await link.getAttribute('href')
      if (href) {
        try {
          const response = await page.request.head(href)

          // eslint-disable-next-line playwright/no-conditional-expect
          expect(response.status()).toBeLessThan(400)
        } catch (error) {
          console.error(`Error checking link ${href}:`, error)
        }
      } else {
        console.warn(`Link element ${i} does not have an href attribute.`)
      }
    }
  })

  await test.step('Go back to Shop and remove item from Basket', async () => {
    await header.backToShopButton.click()
    await homePage.homepageContent.waitFor()
    await countryDetector.closeModal()
    await header.visitBasketPage()
    await basketPage.removeItemButton.first().waitFor()
    await basketPage.removeItemFromBasket()

    await expect(basketPage.emptyState).toBeVisible()
  })
})
