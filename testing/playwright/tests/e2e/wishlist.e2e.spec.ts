import { expect } from '@playwright/test'
import type { Product } from '@scayle/storefront-api'
import { test } from '../../fixtures/fixtures'
import { TEST_USERS, WISHLIST_TEST_DATA, ROUTES } from '../../support/constants'
import { verifySeoMetaTags } from '../../support/utils'

/**
 * @file Contains end-to-end tests for the user's Wishlist page, verifying
 * both the empty and non-empty states, as well as SEO data and item removal.
 */

/**
 * Verifies that when a guest user navigates to the Wishlist page,
 * the empty wishlist state with appropriate elements (continue shopping button,
 * sign-in button, icon, headline, subheadline) is displayed.
 * Verifies that when a logged-in user with an empty wishlist navigates
 * to the Wishlist page, the empty wishlist state with appropriate elements
 * (continue shopping button, icon, headline, subheadline) is displayed.
 *
 * Prerequisites for this test:
 * - A registered user account with no items previously added to Wishlist.
 * - The email address for this user must be defined via `TEST_USER_EMAIL1` environment variable
 * (e.g., "sfb.aqa1@testsystem.com").
 * - The password for this user must be defined via `TEST_USER_PASSWORD` environment variable.
 */
test('C2132174 C2132177 Verify Wishlist empty state', async ({
  wishlistPage,
  header,
  signinPage,
  page,
  countryDetector,
}) => {
  await wishlistPage.navigate(page, ROUTES.wishlist, 'networkidle')
  await countryDetector.closeModal()

  await test.step('Verify guest user', async () => {
    await expect(async () => {
      await wishlistPage.emptyState.waitFor()
      await expect(wishlistPage.buttonContinueShopping).toBeVisible()
      await expect(wishlistPage.buttonSignIn).toBeVisible()
      await expect(wishlistPage.emptyStateIcon).toBeVisible()
      await expect(wishlistPage.emptyStateHeadline).toBeVisible()
      await expect(wishlistPage.emptyStateSubheadline).toBeVisible()
    }).toPass()
  })

  await test.step('Verify logged-in user', async () => {
    await expect(async () => {
      await header.headerLoginButton.click()
      await signinPage.fillLoginData(
        TEST_USERS.testUserEmail1,
        TEST_USERS.testUserPassword,
      )
      await signinPage.clickLoginButton()
      await wishlistPage.emptyState.waitFor()
      await expect(wishlistPage.buttonContinueShopping).toBeVisible()
      await expect(wishlistPage.emptyStateIcon).toBeVisible()
      await expect(wishlistPage.emptyStateHeadline).toBeVisible()
      await expect(wishlistPage.emptyStateSubheadline).toBeVisible()
    }).toPass()
  })
})

/**
 * Verifies that when a product is added to the Wishlist, it is
 * displayed on the Wishlist page with the product card and brand visible.
 * Verifies the SEO meta tags on the Wishlist page and the
 * functionality to remove an item from the Wishlist, leading back to the empty state.
 */
test('C2141222 C2183076 Verify Wishlist items and SEO data', async ({
  wishlistPage,
  header,
  page,
  countryDetector,
  storefrontAPIClient,
}) => {
  await test.step('Find product and add item to wishlist', async () => {
    // Find a product that is active and has at least one variant in stock
    const product = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive &&
        (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
          false),
    )

    test.skip(
      !product,
      'No active product with in-stock variants found - skipping test',
    )

    console.log(
      `[Wishlist Test] Running with product ID: ${(product as Product).id}`,
    )

    // Add product to wishlist via RPC
    await wishlistPage.addProductToWishlist((product as Product).id)
  })

  await test.step('Verify product card on wishlist page', async () => {
    await expect(async () => {
      await wishlistPage.navigate(page, ROUTES.wishlist, 'networkidle')
      await page.waitForLoadState('networkidle')
      await countryDetector.closeModal()
      await header.wishlistLink.waitFor()

      await expect(header.wishlistNumItems).toHaveText('1')

      await wishlistPage.wishlistItemsWrapper.waitFor()

      await expect(wishlistPage.wishlistCard).toBeVisible()
      await expect(wishlistPage.productBrand).toBeVisible()
    }).toPass()
  })

  await test.step('Verify Wishlist SEO data', async () => {
    const pageTitle = (await wishlistPage.pageTitle
      .nth(0)
      .textContent()) as string

    await verifySeoMetaTags(page, {
      robots: WISHLIST_TEST_DATA.seoRobots,
      canonical: page.url(),
    })

    await expect(wishlistPage.h1).toBeAttached()
    await expect(wishlistPage.h1).toContainText(pageTitle)
  })

  await test.step('Remove item from wishlist', async () => {
    await expect(async () => {
      await wishlistPage.removeItemFromWishlist()
      await wishlistPage.emptyState.waitFor()

      await expect(wishlistPage.buttonContinueShopping).toBeVisible()
    }).toPass()
  })
})

/**
 * Verifies that when a product card on Wishlist is clicked, respective PDP is loaded.
 */
test('C2228716 Verify Wishlist product click redirects to PDP', async ({
  wishlistPage,
  header,
  page,
  countryDetector,
  storefrontAPIClient,
  productDetailPage,
}) => {
  await test.step('Find product and add item to wishlist', async () => {
    // Find a product that is active and has at least one variant in stock
    const product = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive &&
        (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
          false),
    )

    test.skip(
      !product,
      'No active product with in-stock variants found - skipping test',
    )

    console.log(
      `[Wishlist Test] Running with product ID: ${(product as Product).id}`,
    )

    // Add product to wishlist via RPC
    await wishlistPage.addProductToWishlist((product as Product).id)
  })

  await test.step('Navigate to wishlist and verify product card', async () => {
    await expect(async () => {
      await wishlistPage.navigate(page, ROUTES.wishlist, 'networkidle')
      await page.waitForLoadState('networkidle')
      await countryDetector.closeModal()
      await header.wishlistLink.waitFor()

      await expect(header.wishlistNumItems).toHaveText('1')

      await wishlistPage.wishlistItemsWrapper.waitFor()

      await wishlistPage.wishlistCard.waitFor()
    }).toPass()
  })

  await test.step('Click the product card and verify PDP is loaded', async () => {
    await wishlistPage.productImage.first().hover()
    await page.waitForLoadState('domcontentloaded')

    const productUrl = (await wishlistPage.productUrl
      .first()
      .getAttribute('href')) as string

    await wishlistPage.productImage.first().click()
    await productDetailPage.h1.waitFor()
    await page.waitForURL(productUrl)

    expect(page.url()).toContain(productUrl)
  })
})
