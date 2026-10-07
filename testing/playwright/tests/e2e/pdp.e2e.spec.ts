import { expect } from '@playwright/test'
import type { ProductCategory, Variant } from '@scayle/storefront-api'
import { test } from '../../fixtures/fixtures'
import { PDP_E2E, ROUTES } from '../../support/constants'
import { verifySeoMetaTags, navigateToPlp, isMobile } from '../../support/utils'

/**
 * @file Contains end-to-end tests for the Product Detail Page (PDP),
 * verifying elements like name, brand, price, wishlist functionality,
 * page title, and SEO meta tags.
 */

/**
 * Verifies that the product brand, name, regular price, and
 * tax information are visible on the Product Detail Page.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must be in stock (at least one variant with stock > 0)
 */
test('C2141594: Verify PDP name brand, price and image', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false), // must be in stock
  )

  test.skip(!productData, 'No active product in stock found - skipping test')

  console.log(`[PDP Test] Running test with product ID: ${productData!.id}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${productData!.id}`,
    'networkidle',
  )
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()
  await productDetailPage.productImageMain.waitFor()

  await expect(productDetailPage.productBrand).toBeVisible()
  await expect(productDetailPage.productName).toBeVisible()
  await expect(productDetailPage.productImageMain).toBeVisible()
  await expect(productDetailPage.priceRegular.first()).toBeVisible()
  await expect(productDetailPage.taxInfo).toBeVisible()
})

/**
 * C2141598: Verifies that a user can add a product to their Wishlist from the
 * Product Detail Page and that the Wishlist item counter in the header is updated.
 * It also verifies the removal of the product from the Wishlist, checking if the
 * counter is updated accordingly.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must be in stock (at least one variant with stock > 0)
 */
test('C2141598: Verify PDP add and remove to/from Wishlist', async ({
  productDetailPage,
  header,
  page,
  countryDetector,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false), // must be in stock
  )

  test.skip(!productData, 'No active product in stock found - skipping test')

  console.log(`[PDP Test] Running test with product ID: ${productData!.id}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${productData!.id}`,
    'networkidle',
  )
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await test.step('Adding product to Wishlist', async () => {
    await productDetailPage.assertAddToWishlistIconVisibility()
    await page.waitForLoadState('networkidle')
    await productDetailPage.addProductToWishlist()
    await productDetailPage.assertRemoveFromWishlistIconVisibility()

    await expect(header.wishlistNumItems).toHaveText('1')
  })

  await test.step('Removing product from Wishlist', async () => {
    await productDetailPage.removeProductFromWishlist()

    await expect(header.wishlistNumItems).toBeHidden()
  })
})

/**
 * Verifies the presence and correctness of specific SEO meta tags
 * (robots and canonical) on the Product Detail Page, checks if the
 * main headline (H1) contains the page title and that the product name
 * is contained in the SEO page title.
 */
test('C2141150 C2141757 Verify PDP SEO data', async ({
  productDetailPage,
  countryDetector,
  page,
  mobileNavigation,
  mainNavigation,
  breadcrumb,
  productListingPage,
}) => {
  await productDetailPage.navigate(page, '/', 'networkidle')
  await page.waitForLoadState('networkidle')
  await countryDetector.closeModal()
  await navigateToPlp(page, mobileNavigation, mainNavigation)
  await breadcrumb.breadcrumbCategoryActive.waitFor()
  await productListingPage.productImage.first().click()
  await productDetailPage.h1.waitFor()

  const pageTitle = (await productDetailPage.pageTitle.textContent()) as string
  const pageTitleSEO = await page.title()
  const productName = await productDetailPage.productName.textContent()

  await verifySeoMetaTags(page, {
    robots: PDP_E2E.seoRobots,
    canonical: page.url(),
  })
  await expect(productDetailPage.h1).toBeAttached()
  await expect(productDetailPage.h1).toContainText(pageTitle)
  expect(pageTitleSEO).toContain(productName)
})

/**
 * Verifies that a multi-variant product can be successfully added to the basket from the PDP.
 *
 * Test Criteria:
 * - Product must have multiple variants (more than 1)
 * - Product must be in stock (at least one variant with stock > 0)
 *
 * The test finds a product meeting these criteria, navigates to its PDP, selects a variant,
 * adds it to the basket, and asserts that the basket count and toast message are correct.
 */
test('C2141595: Verify PDP add to Basket for multi variant product', async ({
  page,
  productDetailPage,
  header,
  toastMessage,
  countryDetector,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      product.variants!.length > 1, // must have multiple variants
  )

  test.skip(!productData, 'No product with multi variant found - skipping test')

  const productId = productData!.id

  console.log(`[PDP Test] Running test with product ID: ${productId}`)

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await countryDetector.closeModal()

  await productDetailPage.variantPicker.waitFor()
  await productDetailPage.productName.waitFor()

  const productName = await productDetailPage.productName.textContent()

  await productDetailPage.variantPicker.waitFor()
  await productDetailPage.variantPicker.click({ force: true })
  await productDetailPage.getVariant().click()
  await productDetailPage.addProductToBasket()

  await expect(header.basketNumItems).toHaveText('1')
  await expect(toastMessage.toastInfo).toContainText(productName as string)
})

/**
 * Verifies that a single-variant product can be successfully added to the basket from the PDP.
 *
 * Test Criteria:
 * - Product must have only one variant
 * - Product must be in stock
 *
 * The test finds a product meeting these criteria, navigates to its PDP, selects a variant,
 * adds it to the basket, and asserts that the basket count and toast message are correct.
 */
test('C2141596: Verify PDP add to Basket for single variant product', async ({
  page,
  productDetailPage,
  header,
  toastMessage,
  countryDetector,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      product.variants?.length === 1, // must have exactly one variant
  )

  test.skip(
    !productData,
    'No product with single variant found - skipping test',
  )

  const productId = productData!.id

  console.log(`[PDP Test] Running test with product ID: ${productId}`)

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await countryDetector.closeModal()

  await productDetailPage.variantPicker.waitFor()
  await productDetailPage.productName.waitFor()

  const productName = await productDetailPage.productName.textContent()

  await productDetailPage.addProductToBasket()
  await header.basketNumItems.waitFor()

  await expect(header.basketNumItems).toHaveText('1')
  await expect(toastMessage.toastInfo).toBeVisible()
  await expect(toastMessage.toastInfo).toContainText(productName as string)
})

/**
 * Verifies that a user can click on a product sibling on the PDP and successfully navigate to that sibling's page.
 *
 * Test Criteria:
 * - Product must have multiple siblings (more than 1)
 * - Product must be in stock
 *
 * The test finds a product meeting these criteria, navigates to its PDP, clicks a random sibling, and asserts
 * that the new product's ID is reflected in the URL.
 */
test('C2266540: Verify PDP product siblings navigation', async ({
  page,
  productDetailPage,
  countryDetector,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      product.siblings!.length > 1, // must have multiple siblings
  )

  test.skip(!productData, 'No product with siblings found - skipping test')

  const initialProductId = productData!.id

  console.log(`[PDP Test] Running with initial product ID: ${initialProductId}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${initialProductId}`,
    'networkidle',
  )
  await countryDetector.closeModal()

  await test.step('Click a random product sibling and verify URL change', async () => {
    const siblingCount = await productDetailPage.productSiblingLink.count()

    const randomSiblingIndex =
      // eslint-disable-next-line sonarjs/pseudo-random
      Math.floor(Math.random() * (siblingCount - 1)) + 1
    const randomSiblingButton =
      productDetailPage.productSiblingLink.nth(randomSiblingIndex)

    const siblingHref = await randomSiblingButton.getAttribute('href')
    expect(siblingHref).not.toBeNull()

    const siblingProductId = siblingHref!.split('-').pop()

    await randomSiblingButton.click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    expect(page.url()).toContain(siblingProductId as string)
  })

  await test.step('Verify new PDP is loaded and interactive', async () => {
    await productDetailPage.variantPicker.waitFor()

    await expect(productDetailPage.productName).toBeVisible()
  })
})

/**
 * Verifies that a PDP quantity selector is working correctly.
 *
 * Test Criteria:
 * - Product must have a high stock variant (at least one variant with more than 10 items in stock)
 *
 * The test finds a product meeting these criteria, navigates to its PDP,
 * and asserts that increasing and decreasing quantity works as expected.
 */
test('C2141597: Verify PDP quantity selector', async ({
  productDetailPage,
  header,
  page,
  countryDetector,
  storefrontAPIClient,
}) => {
  const product = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 10) ??
        false), // must have high stock (more than 10 items)
  )

  test.skip(
    !product,
    'No product with high stock variant found - skipping test',
  )

  // Find a high stock variant from the product
  const highStockVariant = product!.variants!.find(
    (variant) => variant.stock?.quantity > 10,
  )!

  const variantId = highStockVariant.id

  console.log(`[PDP Test] Running with initial product ID: ${product!.id}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${product!.id}?variantId=${variantId}`,
    'networkidle',
  )
  await countryDetector.closeModal()

  await expect(productDetailPage.quantityValue).toHaveValue('1')
  await expect(productDetailPage.quantityMinus).toBeDisabled()
  await expect(productDetailPage.quantityPlus).toBeEnabled()

  await productDetailPage.quantityPlus.click()
  await productDetailPage.quantityPlus.click()

  await expect(productDetailPage.quantityMinus).toBeEnabled()
  await expect(productDetailPage.quantityValue).toHaveValue('3')

  await productDetailPage.quantityMinus.click()
  await expect(productDetailPage.quantityValue).toHaveValue('2')

  await productDetailPage.addProductToBasket()
  await expect(header.basketNumItems).toHaveText('2')
})

/**
 * Verifies that the PDP URL correctly updates with the variant ID parameter when a user
 * selects a specific variant from a multi-size product.
 *
 * Test Criteria:
 * - Product must have a high stock variant (at least one variant with more than 10 items in stock)
 *
 * The test finds a product meeting these criteria, navigates to its PDP,
 * selects a specific variant using keyboard navigation, and asserts that the URL contains the correct variant ID parameter.
 */
test('C2181798: Verify PDP URL Variant ID parameter for multi-size available variant', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const product = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      product.variants!.length > 1, // must have multiple variants
  )

  test.skip(!product, 'No product with multiple variants found - skipping test')

  // Get the first variant for testing
  const firstVariant = product!.variants?.[0]

  const variantId = firstVariant!.id
  console.log(
    `[PDP Test] Running with initial product ID: ${
      product!.id
    } and variant ID: ${variantId}`,
  )
  const variantIdUrl = `?variantId=${variantId.toString()}`

  await productDetailPage.navigate(page, `/p/p-${product!.id}`, 'networkidle')
  await countryDetector.closeModal()
  expect(page.url()).not.toContain(variantIdUrl)
  console.log(variantId.toString())

  await productDetailPage.variantPicker.click()
  await productDetailPage.getVariant(variantId.toString()).focus()
  await productDetailPage.getVariant(variantId.toString()).press('Enter')

  await expect(async () => {
    expect(page.url()).toContain(variantIdUrl)
  }).toPass({ timeout: 1000 })
})

/**
 * Verifies that the PDP URL does not contain variant ID parameter for one-size products.
 *
 * Test Criteria:
 * - Product must have only one variant
 * - Product must be in stock
 *
 * The test navigates to a single-variant product PDP and verifies that the variant is pre-selected and that the URL does not
 * include a variantId parameter. This ensures that one-size products maintain
 * clean URLs without unnecessary variant parameters.
 */
test('C2181801: Verify PDP URL Variant ID parameter for one-size product', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      product.variants?.length === 1, // must have exactly one variant
  )

  test.skip(
    !productData,
    'No product with single variant found - skipping test',
  )

  const productId = productData!.id
  const variantId = productData!.variants?.[0]?.id?.toString()
  console.log(`[PDP Test] Running test with product ID: ${productId}`)

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await countryDetector.closeModal()

  await test.step('Visit one-size available product PDP and check URL parameter', async () => {
    await productDetailPage.variantPicker.waitFor()

    expect(page.url()).not.toContain('variantId')
    await expect(productDetailPage.getVariant(variantId)).toBeAttached()
  })
})

/**
 * Verifies that the subscription service is correctly displayed and functional on the PDP.
 * The test finds a product with at least one subscription-eligible variant that has available stock,
 * then verifies the subscription service behavior.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must have at least one variant with subscriptionEligibility where
 *   both values.label and values.value are "true"
 * - Variant must have available stock (quantity > 0)
 */
test('C2141599: Verify PDP Subscription service', async ({
  productDetailPage,
  page,
  header,
  countryDetector,
  storefrontAPIClient,
}) => {
  // Helper function to check if a variant is eligible (in stock and subscription eligible)
  const isVariantEligible = (variant: Variant): boolean => {
    if (variant.stock.quantity === 0) {
      return false
    }

    const values = variant.attributes?.subscriptionEligibility?.values
    const value = Array.isArray(values) ? values[0] : values

    return !!value && value.label === 'true' && value.value === 'true'
  }

  // Find a product with at least one subscription-eligible variant that has available stock
  const product = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && !!product.variants?.some(isVariantEligible),
  )

  test.skip(
    !product,
    'No product with subscription-eligible variant found - skipping test',
  )

  // Find an eligible variant (in stock and subscription eligible)
  const eligibleVariant = product!.variants!.find(isVariantEligible)
  const productId = product!.id

  console.log(
    `[PDP Test] Running subscription test with product ID: ${productId}`,
  )
  console.log(`[PDP Test] Eligible variant ID: ${eligibleVariant?.id}`)

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()

  await test.step('Check subscription before choosing the size', async () => {
    await expect(productDetailPage.subscriptionService).toBeVisible()
    await expect(productDetailPage.addToBasketButtonSubscribe).toBeHidden()
  })

  await test.step('Check subscription after choosing an eligible variant', async () => {
    await productDetailPage.variantPicker.waitFor()
    await productDetailPage.variantPicker.click({ force: true })
    await productDetailPage.getVariant(eligibleVariant!.id.toString()).click()

    await expect(productDetailPage.addToBasketButtonSubscribe).toBeVisible()

    await productDetailPage.addToBasketButtonSubscribe.click()
    await header.basketNumItems.waitFor()

    await expect(header.basketNumItems).toHaveText('1')
  })
})

/**
 * Verifies that the PDP URL correctly contains the variant ID parameter when navigating
 * to a multi-size product with a sold-out variant, and that the add to basket button
 * is disabled for the sold-out variant.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must have multiple variants (more than 1)
 * - Product must have at least one sold-out variant (stock quantity = 0)
 *
 * The test finds a product meeting these criteria, navigates to its PDP with a sold-out
 * variant ID in the URL, and verifies that the URL contains the variantId parameter
 * and the add to basket button is disabled.
 */
test('C2181799: Verify PDP for multi-size sold-out variant', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const isVariantSoldOut = (variant: Variant): boolean =>
    variant.stock?.quantity === 0

  const product = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      product.variants!.length > 1 &&
      product.variants!.some(
        (v) => isVariantSoldOut(v) && v.attributes?.size?.values,
      ),
  )

  test.skip(
    !product,
    'No product with multiple variants and sold-out variant with size found - skipping test',
  )

  const soldOutVariant = product!.variants!.find(
    (v) => isVariantSoldOut(v) && v.attributes?.size?.values,
  )!

  const sizeValue = Array.isArray(soldOutVariant.attributes!.size!.values)
    ? soldOutVariant.attributes!.size!.values[0]
    : soldOutVariant.attributes!.size!.values

  test.skip(!sizeValue?.label, 'No size label found - skipping test')

  console.log(
    `[PDP Test] Running test with product ID: ${
      product!.id
    } and sold-out variant ID: ${soldOutVariant.id}`,
  )

  await productDetailPage.navigate(
    page,
    `/p/p-${product!.id}?variantId=${soldOutVariant.id}`,
    'networkidle',
  )
  await countryDetector.closeModal()
  await productDetailPage.variantPicker.waitFor()

  expect(page.url()).toContain('variantId')
  await expect(productDetailPage.addToBasketButton).toBeDisabled()
  await expect(productDetailPage.variantPicker).toContainText(sizeValue.label)
})

/**
 * Verifies that the PDP contains valid SEO product markup (JSON-LD structured data)
 * including BreadcrumbList and ProductGroup with all required fields and variants.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must be in stock (at least one variant with stock > 0)
 */
test('C2179230, C2183601 Verify PDP SEO Product and Breadcrumb markup', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  type JsonLdRecord = Record<string, unknown>
  const isRecord = (value: unknown): value is JsonLdRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false),
  )

  test.skip(!productData, 'No active product in stock found - skipping test')

  console.log(`[PDP Test] Running test with product ID: ${productData!.id}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${productData!.id}`,
    'networkidle',
  )
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  // Extract JSON-LD structured data from the page
  const jsonLdData: unknown[] = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    )
    const allData: unknown[] = []
    scripts.forEach((script) => {
      const parsed: unknown = JSON.parse(script.textContent || '{}')
      if (Array.isArray(parsed)) {
        allData.push(...parsed)
      } else {
        allData.push(parsed)
      }
    })
    return allData
  })

  expect(jsonLdData.length).toBeGreaterThan(0)

  // Find BreadcrumbList and ProductGroup
  const breadcrumbList = jsonLdData.find(
    (item) => isRecord(item) && item['@type'] === 'BreadcrumbList',
  )
  const productGroup = jsonLdData.find(
    (item) => isRecord(item) && item['@type'] === 'ProductGroup',
  )

  await test.step('Validate BreadcrumbList structure', () => {
    expect(breadcrumbList).toBeDefined()
    expect(isRecord(breadcrumbList)).toBe(true)
    if (!isRecord(breadcrumbList)) {
      return
    }

    expect(breadcrumbList['@context']).toBe('https://schema.org')
    expect(breadcrumbList['@type']).toBe('BreadcrumbList')

    const itemListElement = breadcrumbList.itemListElement
    expect(itemListElement).toBeDefined()
    expect(Array.isArray(itemListElement)).toBe(true)
    if (!Array.isArray(itemListElement)) {
      return
    }
    expect(itemListElement.length).toBeGreaterThan(0)

    // Validate each breadcrumb item
    itemListElement.forEach((item, index) => {
      expect(isRecord(item)).toBe(true)
      if (!isRecord(item)) {
        return
      }

      expect(item['@type']).toBe('ListItem')
      expect(item.position).toBe(index + 1)
      expect(item.name).toBeDefined()
      expect(typeof item.name).toBe('string')
      expect(item.item).toBeDefined()
      expect(typeof item.item).toBe('string')
    })
  })

  await test.step('Validate ProductGroup structure', () => {
    expect(productGroup).toBeDefined()
    expect(isRecord(productGroup)).toBe(true)
    if (!isRecord(productGroup)) {
      return
    }

    expect(productGroup['@context']).toBe('https://schema.org')
    expect(productGroup['@type']).toBe('ProductGroup')
    expect(productGroup.productGroupID).toBeDefined()
    expect(productGroup.name).toBeDefined()
    expect(typeof productGroup.name).toBe('string')

    const hasVariant = productGroup.hasVariant
    expect(hasVariant).toBeDefined()
    expect(Array.isArray(hasVariant)).toBe(true)

    const variesBy = productGroup.variesBy
    expect(variesBy).toBeDefined()
    expect(Array.isArray(variesBy)).toBe(true)
  })

  await test.step('Validate Product variants structure', () => {
    expect(isRecord(productGroup)).toBe(true)
    if (!isRecord(productGroup)) {
      return
    }

    const hasVariant = productGroup.hasVariant
    expect(Array.isArray(hasVariant)).toBe(true)
    if (!Array.isArray(hasVariant)) {
      return
    }

    hasVariant.forEach((variant) => {
      expect(isRecord(variant)).toBe(true)
      if (!isRecord(variant)) {
        return
      }

      expect(variant['@context']).toBe('https://schema.org')
      expect(variant['@type']).toBe('Product')
      expect(variant.name).toBeDefined()
      expect(typeof variant.name).toBe('string')

      // Validate offers
      const offers = variant.offers
      expect(isRecord(offers)).toBe(true)
      if (!isRecord(offers)) {
        return
      }

      expect(offers['@type']).toBe('Offer')
      expect(offers.url).toBeDefined()
      expect(typeof offers.url).toBe('string')
      expect(offers.sku).toBeDefined()
      expect(typeof offers.sku).toBe('string')
      expect(offers.price).toBeDefined()
      expect(typeof offers.price).toBe('number')
      expect(offers.priceCurrency).toBeDefined()
      expect(typeof offers.priceCurrency).toBe('string')
      expect(offers.availability).toBeDefined()
      expect(typeof offers.availability).toBe('string')
      expect(offers.itemCondition).toBeDefined()
      expect(typeof offers.itemCondition).toBe('string')
    })
  })
})

/**
 * Verifies that the product information accordion on the PDP is visible, collapsed by default,
 * expands on first click, and collapses again on second click.
 *
 * Test Criteria:
 * - Product must be active
 * - Product must be in stock (at least one variant with stock > 0)
 */
test('C2141476 Verify PDP Product information', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false),
  )

  test.skip(!productData, 'No active product in stock found - skipping test')

  console.log(`[PDP Test] Running test with product ID: ${productData!.id}`)

  await productDetailPage.navigate(
    page,
    `/p/p-${productData!.id}`,
    'networkidle',
  )
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await test.step('Product information accordion is visible and collapsed by default', async () => {
    await productDetailPage.productInfoAccordion.first().waitFor()
    await expect(productDetailPage.productInfoAccordion.first()).toBeVisible()

    const isExpanded =
      (await productDetailPage.productInfoAccordionDetails
        .first()
        .getAttribute('open')) !== null
    expect(isExpanded).toBe(false)
  })

  await test.step('Click first accordion and verify expanded state', async () => {
    await productDetailPage.productInfoAccordion.first().click()
    await page.waitForTimeout(300)

    const isExpanded =
      (await productDetailPage.productInfoAccordionDetails
        .first()
        .getAttribute('open')) !== null
    expect(isExpanded).toBe(true)
  })

  await test.step('Click accordion again and verify collapsed state', async () => {
    await productDetailPage.productInfoAccordion.first().click()
    await page.waitForTimeout(300)

    const isExpanded =
      (await productDetailPage.productInfoAccordionDetails
        .first()
        .getAttribute('open')) !== null
    expect(isExpanded).toBe(false)
  })
})

/**
 * Verifies that the PDP short URL is resolved to the full URL.
 * Visiting /p/p-{id} (short URL) should redirect to /p/{slug}-{id} (full URL).
 *
 * Test Criteria:
 * - Product must be active
 * - Product must be in stock (at least one variant with stock > 0)
 */
test('C2184713: Verify PDP short URL', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false),
  )

  test.skip(!productData, 'No active product in stock found - skipping test')

  const productId = productData!.id
  const nameAttr = productData!.attributes?.name
  let productName: string | undefined
  if (!nameAttr) {
    productName = undefined
  } else if (Array.isArray(nameAttr.values)) {
    productName = nameAttr.values[0]?.label
  } else {
    productName = nameAttr.values?.label
  }
  const expectedSlug = (productName ?? '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[*+~.()'"!:@/#?]/g, '')
  const expectedFullPath = `/p/${expectedSlug}-${productId}`
  const shortUrlPath = `/p/p-${productId}`

  console.log(
    `[PDP Test] Running short URL test with product ID: ${productId}, expected full path: ${expectedFullPath}`,
  )

  await productDetailPage.navigate(page, shortUrlPath, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()

  await expect(async () => {
    expect(page.url()).toContain(expectedFullPath)
  }).toPass({ timeout: 5000 })

  await productDetailPage.h1.waitFor()
  await expect(productDetailPage.productName).toBeVisible()
})

/**
 * Verifies PDP image gallery (picture grid) components: arrow down is visible initially,
 * arrow up is hidden initially, and arrow up becomes visible after clicking arrow down.
 * Desktop only: thumbnail strip with scroll buttons is not shown on mobile.
 *
 * Test Criteria:
 * - Product must be active and have many images (8–10) so the thumbnail strip is scrollable.
 */
test('C2139792 Verify PDP picture grid components - Desktop', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  test.skip(isMobile(page), 'Test only for desktop browsers')

  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      Array.isArray(product.images) &&
      product.images.length >= 8 &&
      product.images.length <= 10,
  )

  test.skip(
    !productData,
    'No active product with 8–10 images found - skipping test',
  )

  const productId = productData!.id
  console.log(
    `[PDP Test] Running picture grid test with product ID: ${productId} (${
      productData!.images!.length
    } images)`,
  )

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  const gallery = page.getByTestId('product-gallery')
  await gallery.waitFor()

  await test.step('Arrow down is visible and arrow up is hidden initially', async () => {
    await expect(productDetailPage.imageGalleryButtonDown).toBeVisible()
    await expect(productDetailPage.imageGalleryButtonUp).toBeHidden()
  })

  await test.step('Click arrow down then arrow up becomes visible', async () => {
    await productDetailPage.imageGalleryButtonDown.click()
    await expect(productDetailPage.imageGalleryButtonUp).toBeVisible()
  })

  await test.step('Right arrow navigates to next image', async () => {
    await expect(productDetailPage.sliderArrowButtonRight).toBeVisible()
    await productDetailPage.sliderArrowButtonRight.click()
    await page.waitForTimeout(400)
    const thumbnail1 = gallery.getByTestId('product-thumbnail-1')
    await expect(thumbnail1).toHaveClass(/bg-primary\/10/)
  })

  await test.step('Left arrow navigates to previous image', async () => {
    await expect(productDetailPage.sliderArrowButtonLeft).toBeVisible()
    await productDetailPage.sliderArrowButtonLeft.click()
    await page.waitForTimeout(400)
    const thumbnail0 = gallery.getByTestId('product-thumbnail-0')
    await expect(thumbnail0).toHaveClass(/bg-primary\/10/)
  })
})

/**
 * Verifies PDP image gallery (picture grid) on mobile: slider dots are displayed,
 * dot count matches image count, and swipe left/right changes the image and active dot.
 * Mobile only: slider dots are hidden on desktop (md:hidden).
 *
 * Test Criteria:
 * - Product must be active and have many images (8–10) so multiple dots are shown.
 */
test('C2139792 Verify PDP picture grid components - Mobile', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  test.skip(!isMobile(page), 'Test only for mobile browsers')

  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      Array.isArray(product.images) &&
      product.images.length >= 8 &&
      product.images.length <= 10,
  )

  test.skip(
    !productData,
    'No active product with 8–10 images found - skipping test',
  )

  const productId = productData!.id
  const imageCount = productData!.images!.length
  console.log(
    `[PDP Test] Running mobile picture grid test with product ID: ${productId} (${imageCount} images)`,
  )

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  const gallery = page.getByTestId('product-gallery')
  await gallery.waitFor()

  await test.step('Slider dots are displayed and count matches number of images', async () => {
    await expect(productDetailPage.imageGallerySliderDots).toBeVisible()
    const dotCount = productDetailPage.imageGallerySliderDots
      .getByTestId(/^image-gallery-slider-dot-\d+$/)
      
    await expect(dotCount).toHaveCount(imageCount)
  })

  await test.step('Initial active dot is dot 0', async () => {
    const dot0 = productDetailPage.getImageGallerySliderDot(0)
    await expect(dot0).toHaveClass(/bg-primary/)
  })

  const mainImage = page.getByTestId('main-product-image')
  await mainImage.waitFor()

  // The slider's active dot is driven by scroll position. Use the scrollable container
  // so that the scroll event fires and activeSlide (and thus the active dot) updates.
  const scrollableSlider = mainImage.locator('.overflow-x-auto').first()

  await test.step('Swipe left loads next image and updates active dot to dot 1', async () => {
    await scrollableSlider.evaluate((el) => {
      const slideWidth = el.scrollWidth / el.children.length
      el.scrollTo({ left: slideWidth, top: 0, behavior: 'auto' })
    })
    await page.waitForTimeout(200)
    const dot1 = productDetailPage.getImageGallerySliderDot(1)
    await expect(dot1).toHaveClass(/bg-primary/)
  })

  await test.step('Swipe right loads previous image and updates active dot to dot 0', async () => {
    await scrollableSlider.evaluate((el) => {
      el.scrollTo({ left: 0, top: 0, behavior: 'auto' })
    })
    await page.waitForTimeout(200)
    const dot0 = productDetailPage.getImageGallerySliderDot(0)
    await expect(dot0).toHaveClass(/bg-primary/)
  })
})

/**
 * Verifies the PDP image gallery overlay: opening via image click, slider dots,
 * navigation (arrows on desktop, swipe on mobile), and closing via the close button.
 *
 * Test Criteria:
 * - Product must be active and in stock
 * - Product must have multiple images (ideally 8–10) for overlay navigation
 */
test('C2139793 Verify PDP image gallery', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false) &&
      Array.isArray(product.images) &&
      product.images.length >= 8 &&
      product.images.length <= 10,
  )

  test.skip(
    !productData,
    'No active product in stock with 8–10 images found - skipping test',
  )

  const productId = productData!.id
  console.log(
    `[PDP Test] Running image gallery overlay test with product ID: ${productId} (${
      productData!.images!.length
    } images)`,
  )

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await productDetailPage.productGallery.waitFor()

  await test.step('Click main image and assert image overlay is displayed', async () => {
    await productDetailPage.productImageMain.click()
    await expect(productDetailPage.getImageGalleryOverlayImage(0)).toBeVisible()
  })

  await test.step('Verify overlay slider dots are visible', async () => {
    await expect(productDetailPage.imageGalleryOverlaySliderDots).toBeVisible()
    await expect(
      productDetailPage.getImageGalleryOverlaySliderDot(0),
    ).toBeVisible()
    await expect(
      productDetailPage.getImageGalleryOverlaySliderDot(1),
    ).toBeVisible()
  })

  // On mobile the full-height slide intercepts dot clicks; dot-click is desktop-only.
  if (!isMobile(page)) {
    await test.step('Verify clicking overlay dot shows respective image', async () => {
      await productDetailPage.getImageGalleryOverlaySliderDot(2).click()
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(2),
      ).toBeVisible()
      await productDetailPage.getImageGalleryOverlaySliderDot(0).click()
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(0),
      ).toBeVisible()
    })
  }

  if (isMobile(page)) {
    await test.step('Swipe left to next image in overlay (mobile)', async () => {
      await productDetailPage.imageGalleryOverlayScrollableSlider.evaluate(
        (el) => {
          const slideWidth = el.scrollWidth / el.children.length
          el.scrollTo({ left: slideWidth, top: 0, behavior: 'auto' })
        },
      )
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(1),
      ).toBeVisible()
    })

    await test.step('Swipe right to previous image in overlay', async () => {
      await productDetailPage.imageGalleryOverlayScrollableSlider.evaluate(
        (el) => {
          el.scrollTo({ left: 0, top: 0, behavior: 'auto' })
        },
      )
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(0),
      ).toBeVisible()
    })
  } else {
    await test.step('Verify right arrow navigates to next image in overlay', async () => {
      await expect(
        productDetailPage.imageGalleryOverlayArrowRight,
      ).toBeVisible()
      await productDetailPage.imageGalleryOverlayArrowRight.click()
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(1),
      ).toBeVisible()
    })

    await test.step('Verify left arrow navigates to previous image in overlay', async () => {
      await expect(productDetailPage.imageGalleryOverlayArrowLeft).toBeVisible()
      await productDetailPage.imageGalleryOverlayArrowLeft.click()
      await page.waitForTimeout(400)
      await expect(
        productDetailPage.getImageGalleryOverlayImage(0),
      ).toBeVisible()
    })
  }

  await test.step('Click close button and verify overlay closes and PDP is shown', async () => {
    await expect(productDetailPage.imageGalleryOverlayCloseButton).toBeVisible()
    await productDetailPage.imageGalleryOverlayCloseButton.click()
    await page.waitForTimeout(300)
    await expect(productDetailPage.getImageGalleryOverlayImage(0)).toBeHidden()
    await expect(productDetailPage.productImageMain).toBeVisible()
    await expect(productDetailPage.productName).toBeVisible()
  })
})

/**
 * Verifies PDP breadcrumb visibility and navigation: breadcrumb shows category levels,
 * clicking the lowest level opens the PLP with expanded navigation and active sub-category,
 * and clicking the middle level opens the parent category PLP.
 *
 * Test Criteria:
 * - Product must be active and in stock
 * - Product must belong to a subcategory with at least 3 levels (e.g. Women/Clothing/Pants)
 *
 * Desktop only; skipped on mobile.
 */
test('C2139794 Verify PDP breadcrumb', async ({
  productDetailPage,
  productListingPage,
  breadcrumb,
  page,
  countryDetector,
  storefrontAPIClient,
}) => {
  test.skip(isMobile(page), 'Test only for desktop browsers')

  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 0) ??
        false) &&
      (product.categories?.some((path) => path.length >= 3) ?? false),
  )

  test.skip(
    !productData,
    'No active product in stock with subcategory (3+ levels) found - skipping test',
  )

  const productId = productData!.id
  const longestPath = productData!.categories!.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    [] as ProductCategory[],
  )

  console.log(
    `[PDP Test] Running breadcrumb test with product ID: ${productId}, category levels: ${longestPath
      .map((c) => c.categoryName)
      .join(' > ')}`,
  )

  await productDetailPage.navigate(page, `/p/p-${productId}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await test.step('PDP loads and breadcrumb shows category levels', async () => {
    await productDetailPage.breadcrumbCategoryLinks.first().waitFor()
    const count = await productDetailPage.breadcrumbCategoryLinks.count()
    expect(count).toBeGreaterThanOrEqual(3)

    for (let i = 0; i < longestPath.length; i++) {
      await expect(productDetailPage.getBreadcrumbCategoryLink(i)).toBeVisible()
      await expect(
        productDetailPage.getBreadcrumbCategoryLink(i),
      ).toContainText(longestPath[i].categoryName)
    }
  })

  await test.step('Click lowest level category in breadcrumb opens PLP with expanded nav and active sub-category', async () => {
    const lowestLevelLink = productDetailPage.breadcrumbCategoryLinks.last()
    await lowestLevelLink.scrollIntoViewIfNeeded()
    await lowestLevelLink.click()
    await page.waitForURL(/\/c\//, { timeout: 10000 })

    expect(page.url()).toContain('/c/')
    await breadcrumb.breadcrumbCategoryActive.waitFor()
    await expect(breadcrumb.breadcrumbCategoryActive).toBeVisible()
    await expect(productListingPage.sideNavigation).toBeVisible()
  })

  await test.step('Click product tile to open PDP again and verify breadcrumb', async () => {
    await page.locator(`#product-${productId}`).click()
    await page.waitForLoadState('networkidle')
    await productDetailPage.h1.waitFor()

    await productDetailPage.breadcrumbCategoryLinks.first().waitFor()
    const count = await productDetailPage.breadcrumbCategoryLinks.count()
    expect(count).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < longestPath.length; i++) {
      await expect(
        productDetailPage.getBreadcrumbCategoryLink(i),
      ).toContainText(longestPath[i].categoryName)
    }
  })

  await test.step('Click middle category level in breadcrumb opens PLP with expanded nav and active sub-category', async () => {
    const middleIndex = Math.floor(
      ((await productDetailPage.breadcrumbCategoryLinks.count()) - 1) / 2,
    )
    const middleLevelLink =
      productDetailPage.getBreadcrumbCategoryLink(middleIndex)
    await middleLevelLink.scrollIntoViewIfNeeded()
    await middleLevelLink.click()
    await page.waitForURL(/\/c\//, { timeout: 10000 })

    expect(page.url()).toContain('/c/')
    await breadcrumb.breadcrumbCategoryActive.waitFor()
    await expect(breadcrumb.breadcrumbCategoryActive).toBeVisible()
    await expect(productListingPage.sideNavigation).toBeVisible()
  })
})

/**
 * Verifies the PDP recently viewed products slider: hidden on first visit,
 * visible on second PDP with first product's card, and on return to first PDP
 * the second product's card is visible in the slider.
 *
 * Test Criteria:
 * - Uses active, in-stock PDPs
 */
test('C2240762 Verify PDP recently viewed products slider', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const product1 = await storefrontAPIClient.findProduct(
    (product) =>
      !!product.isActive &&
      (product.variants?.some(
        (variant) => (variant.stock?.quantity ?? 0) > 0,
      ) ??
        false),
  )
  test.skip(!product1, 'No active product in stock found - skipping test')

  const product2 = await storefrontAPIClient.findProduct(
    (p) =>
      !!p.isActive &&
      (p.variants?.some((v) => (v.stock?.quantity ?? 0) > 0) ?? false) &&
      p.id !== product1!.id,
  )
  test.skip(
    !product2,
    'No second active product in stock found - skipping test',
  )

  await productDetailPage.navigate(page, `/p/p-${product1!.id}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await test.step('1. First PDP: recently viewed slider is not visible', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(productDetailPage.recentlyViewedProductsSlider).toBeHidden()
  })

  await test.step('2. Open second PDP: recently viewed visible and contains first product', async () => {
    await productDetailPage.navigate(
      page,
      `/p/p-${product2!.id}`,
      'networkidle',
    )
    await productDetailPage.h1.waitFor()
    await productDetailPage.recentlyViewedProductsSlider.scrollIntoViewIfNeeded()
    await expect(productDetailPage.recentlyViewedProductsSlider).toBeVisible()
    await expect(
      productDetailPage.getRecentlyViewedProductCard(product1!.id),
    ).toBeVisible()
  })

  await test.step('3. Go back to first PDP: recently viewed contains second product', async () => {
    await productDetailPage.navigate(
      page,
      `/p/p-${product1!.id}`,
      'networkidle',
    )
    await productDetailPage.h1.waitFor()
    await productDetailPage.recentlyViewedProductsSlider.scrollIntoViewIfNeeded()
    await expect(productDetailPage.recentlyViewedProductsSlider).toBeVisible()
    await expect(
      productDetailPage.getRecentlyViewedProductCard(product2!.id),
    ).toBeVisible()
  })
})

/**
 * C2349764: Verifies that the Similar Products slider is visible on the PDP.
 * The Similar Products slider is distinct from other PDP sliders (e.g. recently
 * viewed, main category recommendations) and is identified by data-testid.
 *
 * Test Criteria:
 * - Product must be active and in stock
 * - Similar products must be returned by the API for the slider to be rendered
 */
test('C2349764 Verify PDP Similar Products slider', async ({
  productDetailPage,
  countryDetector,
  page,
  storefrontAPIClient,
}) => {
  const product = await storefrontAPIClient.findProduct(
    (p) =>
      !!p.isActive &&
      (p.variants?.some((v) => (v.stock?.quantity ?? 0) > 0) ?? false),
  )
  test.skip(!product, 'No active product in stock found - skipping test')

  await productDetailPage.navigate(page, `/p/p-${product!.id}`, 'networkidle')
  await page.waitForLoadState('domcontentloaded')
  await countryDetector.closeModal()
  await productDetailPage.h1.waitFor()

  await productDetailPage.similarProductsSlider.scrollIntoViewIfNeeded()
  await expect(productDetailPage.similarProductsSlider).toBeVisible()
})

/**
 * Verifies that the PDP optional URL variant ID parameter is present for multi-size products
 * when a variant is selected via the size selector, and that going back then loads the
 * homepage (not the initial PDP without variantId).
 *
 * Test Criteria:
 * - Product must be active and in stock (at least one variant with stock > 0)
 * - Product must have multiple variants
 *
 * The test navigates to homepage then to PDP, asserts no variantId, selects a variant,
 * then goes back and asserts the homepage is loaded.
 */
test('C2173504 Verify PDP optional URL Variant ID parameter multi size', async ({
  productDetailPage,
  countryDetector,
  page,
  baseURL,
  storefrontAPIClient,
}) => {
  const product = await storefrontAPIClient.findProduct(
    (product) =>
      !!product.isActive &&
      (product.variants?.length ?? 0) > 1 &&
      (product.variants?.some((v) => (v.stock?.quantity ?? 0) > 0) ?? false),
  )

  test.skip(
    !product,
    'No product in stock with multiple variants found - skipping test',
  )

  await productDetailPage.navigate(page, '/', 'networkidle')
  await countryDetector.closeModal()

  await productDetailPage.navigate(page, `/p/p-${product!.id}`, 'networkidle')
  await countryDetector.closeModal()
  await productDetailPage.variantPicker.waitFor()

  expect(page.url()).not.toContain('variantId')

  await productDetailPage.variantPicker.click({ force: true })
  await productDetailPage.getVariant().click()

  await expect(async () => {
    expect(page.url()).toContain('variantId')
  }).toPass({ timeout: 1000 })

  await test.step('Click back and assert homepage is loaded, not initial PDP', async () => {
    await page.goBack()
    await page.waitForLoadState('networkidle')

    await page.waitForTimeout(500)
    expect(page.url()).toEqual(baseURL + ROUTES.homepageDefault)
    expect(page.url()).not.toMatch(/\/p\/p-\d+/)
  })
})
