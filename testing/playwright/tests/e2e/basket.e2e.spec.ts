import { expect } from '@playwright/test'
import type { Product, Variant } from '@scayle/storefront-api'
import { test } from '../../fixtures/fixtures'
import {
  getUserForBrowser,
  verifySeoMetaTags,
  isMobile,
} from '../../support/utils'
import { BASKET_TEST_DATA, ROUTES } from '../../support/constants'

/**
 * @file Contains end-to-end tests for the shopping basket page functionality.
 * This suite covers empty states, adding/removing products, and SEO verification.
 */

/**
 * Verifies that when a guest user navigates to the basket page,
 * the empty basket state with appropriate title and subtitle is displayed.
 * Verifies that when a logged-in user with an empty basket navigates
 * to the basket page, the empty basket state is displayed, and the user has
 * the option to continue shopping.
 *
 * Prerequisite for this test:
 * To avoid conflicts between browsers in empty and non-empty states, every browser should use its own dedicated test user.
 * Five test users should be registered in the system and their e-mail addresses and password should match the values of
 * environment variables, as follows:
 * - `TEST_USER_EMAIL1` - test user for desktop Chromium.
 * - `TEST_USER_EMAIL2` - test user for desktop Firefox.
 * - `TEST_USER_EMAIL3` - test user for desktop Webkit (Safari).
 * - `TEST_USER_EMAIL4` - test user for mobile Chrome.
 * - `TEST_USER_EMAIL5` - test user for mobile Webkit (Safari).
 * - The password for all test users is the same, and must be defined via `TEST_USER_PASSWORD` environment variable.
 */
test('C2132186 C2132187 Verify Basket empty state as a guest and logged in user', async ({
  header,
  basketPage,
  signinPage,
  page,
  countryDetector,
}, testInfo) => {
  await test.step('Verify guest user', async () => {
    await basketPage.navigate(page, '/', 'networkidle')
    await countryDetector.closeModal()
    await header.headerBasketButton.click()
    await page.waitForLoadState('domcontentloaded')
    await expect(async () => {
      expect(page.url()).toContain(ROUTES.basket)
      await expect(basketPage.basketEmptyStateTitle).toBeVisible()
      await expect(basketPage.basketEmptyStateSubTitle).toBeVisible()
    }).toPass()
  })

  await test.step('Verify logged-in user', async () => {
    await basketPage.assertContinueButton()
    await header.headerBasketButton.waitFor()
    await header.headerBasketButton.click()
    await page.waitForTimeout(1000)
    await basketPage.assertLoginButton()

    const projectName = testInfo.project.name
    const { email, password } = getUserForBrowser(projectName)

    await signinPage.fillLoginData(email, password)
    await signinPage.clickLoginButton()
    expect(page.url()).toContain(ROUTES.basket)
    await basketPage.h1.waitFor()
    await page.waitForLoadState('domcontentloaded')
    try {
      await basketPage.removeItemButton
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
      await basketPage.removeItemFromBasket()
    } catch (error) {
      console.error(
        `Basket is already empty. Continuing test execution. ${error}`,
      )
    }
    await expect(basketPage.loginButton).not.toBeVisible()
    await expect(basketPage.continueButton).toBeVisible()
    await header.headerBasketButton.click()
    await basketPage.assertContinueButton()
  })
})

/**
 * Verifies that a guest user can add a product to the basket,
 * then logs in, and the added product persists in their basket after login, and the ability
 * to remove a product from the basket.
 *
 * Prerequisites for this test are the same as for the test "C2132186 C2132187 Verify Basket empty state as a guest and logged in user".
 * This test is using the same dedicated test users per browser, defined via environment variables.
 */
test('C2132198 C2162476 Verify add to Basket', async ({
  header,
  basketPage,
  countryDetector,
  accountPage,
  storefrontAPIClient,
  page,
}, testInfo) => {
  await test.step('Add product to Basket as a non-logged in user', async () => {
    await basketPage.navigate(page, '/', 'networkidle')
    await countryDetector.closeModal()

    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive &&
        (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
          false),
    )

    test.skip(
      !productData,
      'No product with available stock found - skipping test',
    )

    const availableVariant = (productData as Product).variants!.find(
      (variant) => variant.stock?.quantity > 0,
    )!

    console.log(
      `[Basket Test] Running with product ID: ${productData?.id}, variant ID: ${availableVariant.id}`,
    )

    await basketPage.addProductToBasket(availableVariant.id, 1)
    await page.reload()
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()

    await header.headerBasketButton.click()
    await page.waitForLoadState('networkidle')
    await basketPage.basketProductCard.first().waitFor()
    await expect(header.basketNumItems).toHaveText('1')
  })

  await test.step('Log in and assert the product is still in Basket', async () => {
    const projectName = testInfo.project.name
    const { email, password } = getUserForBrowser(projectName)

    await accountPage.userAuthentication(email, password)
    await header.visitBasketPage()
    await basketPage.basketProductCard.first().waitFor()
    await expect(header.basketNumItems).toHaveText('1')
  })

  /**
   * As a part of verifying Basket functionalities, this step verifies Basket SEO data.
   * Since the product is in Basket, the page is loaded and user is logged-in,
   * this step eliminates the need to repeat adding to basket and logging in in a separated test.
   */
  await test.step('Check Basket SEO data', async () => {
    await expect(async () => {
      await basketPage.h1.waitFor()

      const pageTitle = (await basketPage.pageTitle
        .nth(0)
        .textContent()) as string

      await verifySeoMetaTags(page, {
        robots: BASKET_TEST_DATA.seoRobots,
        canonical: page.url(),
      })
      await expect(basketPage.h1).toBeAttached()
      await expect(basketPage.h1).toContainText(pageTitle)
    }).toPass()
  })

  await test.step('Remove product from Basket', async () => {
    await expect(async () => {
      await basketPage.removeItemFromBasket()
      await expect(header.basketNumItems).not.toBeVisible()
    }).toPass()
  })
})

/**
 * Verifies that the price summary in the basket is calculated correctly for a single, regular-priced (non-sale) product.
 *
 * This test ensures that when a regular item is added to the cart, the subtotal and final price on the basket page
 * match the product's price, and no unexpected discounts are applied. It serves as a key regression test for the
 * core basket calculation logic.
 */
test('C2167319 Verify Basket Price summary - regular product', async ({
  header,
  basketPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  await test.step('Add regular product to Basket', async () => {
    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive && // must be active
        (product.variants?.every(
          (variant) => variant.price.appliedReductions.length === 0,
        ) ??
          false), // must be regular price (no applied reductions)
    )

    test.skip(
      !productData,
      'No product with regular price found - skipping test',
    )

    // const product = productData as Product
    const regularVariant = (productData as Product).variants!.find(
      (variant) => variant.price.appliedReductions.length === 0,
    )!

    console.log(
      `[Basket Test] Running with regular product ID: ${productData?.id}, variant ID: ${regularVariant.id}`,
    )
    await countryDetector.closeModal()

    await basketPage.addProductToBasket(regularVariant.id, 1)
    await page.reload() // reload the page to update the basket page after adding the product via RPC
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()

    await header.headerBasketButton.click()
    await page.waitForLoadState('networkidle')

    await basketPage.basketProductCard.waitFor()
    await page.waitForLoadState('networkidle')

    await expect(header.basketNumItems).toHaveText('1')
  })

  await test.step('Check regular product price summary', async () => {
    await basketPage.priceFinal.waitFor()
    await basketPage.assertBasketPriceSummary()
  })
})

/**
 * Verifies that the price summary in the basket is calculated correctly for a single, sale-priced product.
 *
 * This test ensures that when a sale item is added to the cart, the subtotal and final price on the basket page
 * correctly reflect the sale pricing with applied reductions. It serves as a key regression test for the
 * basket calculation logic with sale products that have applied reductions with category "sale".
 */
test('C2167320 Verify Basket Price summary - sale product', async ({
  header,
  basketPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  await test.step('Add sale product to Basket', async () => {
    const hasSaleReduction = (variant: Variant) =>
      variant.price.appliedReductions.some(
        (reduction) => reduction.category === 'sale',
      )

    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        (product.isActive && product.variants?.some(hasSaleReduction)) ?? false, // must be sale price (has applied reductions)
    )

    test.skip(!productData, 'No product with sale price found - skipping test')

    const saleVariant = (productData as Product).variants!.find(
      hasSaleReduction,
    )!

    console.log(
      `[Basket Test] Running with sale product ID: ${productData?.id}, variant ID: ${saleVariant.id}`,
    )
    await countryDetector.closeModal()

    await basketPage.addProductToBasket(saleVariant.id, 1)
    await page.reload() // reload the page to update the basket page after adding the product via RPC
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()

    await header.headerBasketButton.waitFor()
    await header.headerBasketButton.click()

    await basketPage.basketProductCard.waitFor()
    await page.waitForLoadState('networkidle')

    await expect(header.basketNumItems).toHaveText('1')
  })

  await test.step('Check sale product price summary', async () => {
    await basketPage.priceFinal.waitFor()
    await basketPage.assertBasketPriceSummary('sale')
  })
})

/**
 * Verifies that the basket quantity selector works correctly for products with limited stock (more than 2 items and less than 10 items).
 *
 * This test ensures that when a product with limited stock is added to the basket, the quantity selector
 * properly enforces the maximum available quantity and disables the increase button when the limit is reached.
 * The test also verifies that the quantity selector works correctly when the quantity is decreased.
 * It serves as a regression test for the basket quantity selector functionality with stock constraints.
 */
test('C2162487 Verify Basket Quantity Selector with limited product quantity', async ({
  header,
  basketPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  let addedQuantity = 0
  let maxQuantity = 0

  await test.step('Find and add product with limited stock to basket', async () => {
    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive && // must be active
        (product.variants?.some(
          (variant) =>
            variant.stock?.quantity > 2 && variant.stock?.quantity < 10,
        ) ??
          false), // must have limited stock (2-9 items), to verify the quantity selector when the max. available quantity is reached.
    )

    test.skip(
      !productData,
      'No product with limited stock (2-9 items) found - skipping test',
    )

    const limitedStockVariant = (productData as Product).variants!.find(
      (variant) => variant.stock?.quantity > 2 && variant.stock?.quantity < 10,
    )!

    maxQuantity = limitedStockVariant.stock?.quantity
    addedQuantity = maxQuantity - 1

    console.log(
      `[Basket Test] Running with product ID: ${productData?.id}, variant ID: ${limitedStockVariant.id}, max quantity: ${maxQuantity}`,
    )

    await basketPage.addProductToBasket(limitedStockVariant.id, addedQuantity)
    await page.reload() // reload the page to update the basket page after adding the product via RPC
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()

    await header.headerBasketButton.waitFor()
    await header.headerBasketButton.click()
    await page.waitForLoadState('networkidle')
    await basketPage.basketProductCard.first().waitFor()

    await expect(header.basketNumItems).toHaveText(String(addedQuantity))
    await expect(basketPage.quantityValue).toHaveValue(String(addedQuantity))
  })

  await test.step('Increase the quantity', async () => {
    await basketPage.buttonQuantityIncrease.click()

    const increasedQuantity = addedQuantity + 1
    await expect(basketPage.quantityValue).toHaveValue(
      String(increasedQuantity),
    )
    await expect(basketPage.buttonQuantityIncrease).toBeDisabled()
    await expect(basketPage.buttonQuantityDecrease).toBeEnabled()
    await expect(header.basketNumItems).toHaveText(String(increasedQuantity))
  })

  await test.step('Decrease the quantity', async () => {
    await basketPage.buttonQuantityDecrease.click()

    await expect(basketPage.quantityValue).toHaveValue(String(addedQuantity))
    await expect(basketPage.buttonQuantityIncrease).toBeEnabled()
    await expect(header.basketNumItems).toHaveText(String(addedQuantity))
  })
})

/**
 * Verifies that the basket quantity selector works correctly for products with high stock (more than 10 items).
 *
 * This test ensures that when a product with high stock is added to the basket, the quantity selector
 * allows increasing quantity up to the maximum limit (typically 10) and properly manages the increase/decrease buttons.
 * It serves as a regression test for the basket quantity selector functionality with high stock products.
 */
test('C2170821 Verify Basket Quantity Selector available quantity more than 10', async ({
  header,
  basketPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  await test.step('Find and add product with high stock to basket', async () => {
    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive && // must be active
        (product.variants?.some((variant) => variant.stock?.quantity > 10) ??
          false), // must have high stock (more than 10 items)
    )

    test.skip(
      !productData,
      'No product with high stock (more than 10 items) found - skipping test',
    )

    const highStockVariant = (productData as Product).variants!.find(
      (variant) => variant.stock?.quantity > 10,
    )!

    console.log(
      `[Basket Test] Running with high stock product ID: ${productData?.id}, variant ID: ${highStockVariant.id}`,
    )

    await basketPage.addProductToBasket(highStockVariant.id, 9)
    await page.reload() // reload the page to update the basket page after adding the product via RPC
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()

    await header.headerBasketButton.waitFor()
    await header.headerBasketButton.click()
    await page.waitForLoadState('networkidle')
    await basketPage.basketProductCard.first().waitFor()

    await expect(header.basketNumItems).toHaveText('9')
    await expect(basketPage.quantityValue).toHaveValue('9')
    await expect(basketPage.buttonQuantityDecrease).toBeEnabled()
    await expect(basketPage.buttonQuantityIncrease).toBeEnabled()
  })

  await test.step('Increase the quantity to reach the maximum of 10', async () => {
    await basketPage.buttonQuantityIncrease.click()

    await expect(basketPage.quantityValue).toHaveValue('10')
    await expect(basketPage.buttonQuantityIncrease).toBeDisabled()
    await expect(basketPage.buttonQuantityDecrease).toBeEnabled()
    await expect(header.basketNumItems).toHaveText('10')
  })

  await test.step('Decrease the quantity to reach 9', async () => {
    await basketPage.buttonQuantityDecrease.click()

    await expect(basketPage.quantityValue).toHaveValue('9')
    await expect(basketPage.buttonQuantityIncrease).toBeEnabled()
    await expect(basketPage.buttonQuantityDecrease).toBeEnabled()
    await expect(header.basketNumItems).toHaveText('9')
  })
})

/**
 * Verifies the Basket preview flyout on desktop: it opens on hover when not on the basket page
 * and shows the added product, and it does not open when on the basket page.
 */
test('C2167371 Verify Basket preview', async ({
  page,
  header,
  basketPage,
  productDetailPage,
  countryDetector,
  storefrontAPIClient,
}) => {
  test.skip(isMobile(page), 'Test only for desktop browsers')

  let productId: number

  await test.step('Navigate to PDP and add product to basket', async () => {
    const productData = await storefrontAPIClient.findProduct(
      (product) =>
        product.isActive &&
        (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
          false),
    )

    test.skip(
      !productData,
      'No product with available stock found - skipping test',
    )

    productId = productData!.id

    await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
    await countryDetector.closeModal()

    await productDetailPage.variantPicker.waitFor()
    await productDetailPage.productName.waitFor()

    const hasMultipleVariants = (productData as Product).variants!.length > 1
    if (hasMultipleVariants) {
      await productDetailPage.variantPicker.click({ force: true })
      await productDetailPage.getVariant().click()
    }

    await productDetailPage.addProductToBasket()
    await header.basketNumItems.waitFor()
    await expect(header.basketNumItems).toHaveText('1')
  })

  await test.step('Hover over basket link and assert flyout shows product', async () => {
    await header.headerBasketButton.hover()
    await page.waitForTimeout(300)

    await expect(header.basketPreviewFlyout).toBeVisible()
    await expect(header.basketPreviewFlyoutProductCard).toBeVisible()
  })

  await test.step('Navigate to basket page and assert flyout does not open on hover', async () => {
    await header.visitBasketPage()
    await page.waitForLoadState('networkidle')
    await basketPage.h1.first().waitFor()

    await header.headerBasketButton.hover()
    await page.waitForTimeout(300)

    await expect(header.basketPreviewFlyout).toHaveCount(0)
  })

  await test.step('Go to homepage', async () => {
    await basketPage.navigate(page, '/', 'networkidle')
    await page.waitForLoadState('networkidle')
    await countryDetector.closeModal()
  })

  await test.step('Hover over basket link, click item in flyout and assert correct PDP loads', async () => {
    await header.headerBasketButton.hover()
    await page.waitForTimeout(300)

    await expect(header.basketPreviewFlyout).toBeVisible()
    await expect(header.basketPreviewFlyoutProductCard).toBeVisible()

    await header.basketPreviewFlyoutProductCard
      .getByRole('link')
      .first()
      .click()
    /*await page.waitForURL(new RegExp(`/p/p-${productId}`), {
      waitUntil: 'commit',
    })*/
    await page.waitForLoadState('networkidle')
    await productDetailPage.h1.first().waitFor()
    await page.waitForTimeout(1000)

    expect(page.url()).toMatch(new RegExp(`/p/.*${productId}`))
    await productDetailPage.productName.waitFor()
    await expect(productDetailPage.h1.first()).toBeVisible()
  })
})
