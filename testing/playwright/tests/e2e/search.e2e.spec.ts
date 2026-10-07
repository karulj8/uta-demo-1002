import { expect } from '@playwright/test'
import type { Product } from '@scayle/storefront-api'
import { test } from '../../fixtures/fixtures'
import { SEARCH } from '../../support/constants'
import { executeSearch } from '../../support/utils'

/**
 * Verifies that when a search term with no matching results is entered,
 * the user is navigated to a no results page with the correct URL and headline
 * that contains entered search term.
 */
test('C2139814: Verify Search no results page', async ({
  search,
  page,
  mobileNavigation,
  homePage,
  countryDetector,
}) => {
  await homePage.navigate(page, '/', 'networkidle')
  await page.waitForLoadState('networkidle')
  await countryDetector.closeModal()

  await expect(async () => {
    await executeSearch(
      page,
      mobileNavigation,
      search,
      'noresultstest',
      'enter',
    )
    await page.waitForLoadState('domcontentloaded')
    await search.h1.first().waitFor()

    expect(page.url()).toContain(`${SEARCH.searchParamUrl}noresultstest`)
    await search.assertHeadlineSearchResults('noresultstest')
  }).toPass()
})

/**
 * Verifies that when a valid product search term is entered,
 * the user is navigated to a search results page that contains returned products.
 * Search term is fetched using the Storefront API client and it contains a product brand.
 */
test('C2130650: Verify Search results page', async ({
  search,
  page,
  mobileNavigation,
  storefrontAPIClient,
  countryDetector,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productBrand = (productData as Product)?.attributes?.brand?.values
    ?.label

  await countryDetector.closeModal()

  await executeSearch(page, mobileNavigation, search, productBrand, 'enter')
  await page.waitForLoadState('networkidle')

  await search.h1.first().waitFor()
  await search.searchResultsProductImage.first().waitFor()

  expect(page.url()).toContain(
    SEARCH.searchParamUrl + productBrand.replace(/\s+/g, '+'),
  )
  await expect(search.searchResultsProductImage.first()).toBeVisible()
  await search.assertHeadlineSearchResults(productBrand)
})

/**
 * Verifies that when typing a category-related search term,
 * relevant suggestions appear and clicking a suggestion navigates to the correct PLP.
 * Search term is fetched using the Storefront API client and it contains a category name.
 */
test('C2130721: Verify Search suggestions', async ({
  search,
  mobileNavigation,
  page,
  productListingPage,
  storefrontAPIClient,
  countryDetector,
}) => {
  const rootCategories = await storefrontAPIClient.getRootCategories()

  test.skip(
    !rootCategories || rootCategories.length === 0,
    'No categories found - skipping test',
  )

  // Use the first root category name for search
  const categoryName = rootCategories[0].name

  await countryDetector.closeModal()

  await expect(async () => {
    await executeSearch(
      page,
      mobileNavigation,
      search,
      categoryName,
      'clickSuggestion',
    )
    await productListingPage.h1.waitFor()
    expect(page.url()).toContain(categoryName.toLowerCase())
  }).toPass()
})

/**
 * Verifies that when typing a search term with suggestions, clicking the
 * "See all results" button navigates to the search results page
 * with visible product stream and headline containing the search term.
 * Search term is fetched using the Storefront API client and it contains a product brand.
 */
test('C2132124: Verify Search suggestions "See all results" button', async ({
  search,
  mobileNavigation,
  page,
  storefrontAPIClient,
  countryDetector,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productBrand = (productData as Product)?.attributes?.brand?.values
    ?.label

  await countryDetector.closeModal()
  await executeSearch(
    page,
    mobileNavigation,
    search,
    productBrand,
    'clickMoreResults',
  )
  await search.searchResultsProductImage.first().waitFor()
  await page.waitForLoadState('networkidle')

  await expect(search.searchResultsProductImage.first()).toBeVisible()
  await search.assertHeadlineSearchResults(productBrand)
})

/**
 * Verifies that when typing an exact product ID,
 * a suggestion appears, and clicking it navigates directly to the product detail page (PDP).
 * Search term is fetched using the Storefront API client and it contains a product ID.
 */
test('C2132173: Verify Search suggestions exact product match', async ({
  search,
  page,
  mobileNavigation,
  storefrontAPIClient,
  countryDetector,
  productDetailPage,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productId = String((productData as Product).id)

  await countryDetector.closeModal()

  await executeSearch(
    page,
    mobileNavigation,
    search,
    productId,
    'clickSuggestion',
  )

  await productDetailPage.productName.waitFor()
  expect(page.url()).toContain(productId)
  await expect(productDetailPage.productName).toBeVisible()
})

/**
 * Verifies the initial state of filters on the search results page,
 * applies a price filter, checks the filter counter, applies a color filter,
 * checks the updated filter counter, and then resets the filters.
 * Search term is fetched using the Storefront API client and it contains a product brand.
 */
test('C2140718: Verify Search results page Filters', async ({
  search,
  page,
  mobileNavigation,
  filters,
  productListingPage,
  storefrontAPIClient,
  countryDetector,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productBrand = (productData as Product)?.attributes?.brand?.values
    ?.label

  await countryDetector.closeModal()

  await test.step('Search for a term and check Filter initial state', async () => {
    await executeSearch(page, mobileNavigation, search, productBrand, 'enter')
    await productListingPage.h1.waitFor()
    await expect(filters.filterCounter).toBeHidden()
  })

  await test.step('Apply price filter and check filter counter', async () => {
    await filters.buttonOpenFilters.click()
    await filters.closeFiltersButton.waitFor()
    await expect(filters.closeFiltersButton).toBeVisible()

    await filters.filterPriceInput.nth(1).focus()
    await filters.filterPriceInput.nth(1).clear()
    await filters.filterPriceInput.nth(1).fill('100')
    await filters.filterPriceInput.nth(1).press('Enter')
    await filters.filterApplyButton.click()

    await filters.filterCounter.waitFor()
    await expect(filters.filterCounter).toHaveText('1')
  })

  await test.step('Apply color filter and check filter counter', async () => {
    await filters.buttonOpenFilters.click()
    await filters.closeFiltersButton.waitFor()
    await filters.filterColorChip.first().scrollIntoViewIfNeeded()
    await page.waitForLoadState('domcontentloaded')
    await filters.filterColorChip.first().setChecked(true)
    await filters.filterApplyButton.waitFor()
    await filters.filterApplyButton.scrollIntoViewIfNeeded()
    await filters.filterApplyButton.click()
    await filters.filterCounter.waitFor()

    await expect(filters.filterCounter).toBeVisible()
    await expect(filters.filterCounter).toHaveText('2')
  })

  await test.step('Reset filters and check filter counter', async () => {
    await filters.buttonOpenFilters.click()
    await filters.filterResetButton.scrollIntoViewIfNeeded()
    await filters.filterResetButton.click()
    await page.waitForLoadState('domcontentloaded')
    await filters.closeFiltersButton.click()

    await expect(filters.filterCounter).toBeHidden()
  })
})

/**
 * Verifies that when typing a search term that matches tags,
 * relevant tags are displayed in the suggestions, and clicking a tag
 * applies a corresponding filter.
 * Search term is fetched using the Storefront API client and it contains a combination of product category, color, and size.
 * Example search term: "white jacket 32".
 */
test('C2162007: Verify Search suggestions tags', async ({
  search,
  page,
  mobileNavigation,
  filters,
  storefrontAPIClient,
  countryDetector,
}) => {
  // Get a product to extract structured search terms
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive &&
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  // Extract category name from the product data
  const categoryValues = Array.isArray(
    productData?.attributes?.category?.values,
  )
    ? productData.attributes.category.values
    : []
  const categoryName =
    categoryValues.length >= 2
      ? (categoryValues[categoryValues.length - 2]?.label?.split('|').pop() ??
        '')
      : ''
  const color =
    (productData?.attributes?.color?.values as { label: string }[])?.[0]
      ?.label ?? ''
  const size =
    (
      productData?.variants?.[0]?.attributes?.size?.values as {
        label: string
      }[]
    )?.[0]?.label ?? ''

  // Build search term: "category color size" (e.g., "white jacket 32")
  // In case of no product data, use a fallback search term (white shirt L)
  const searchTerm =
    [color, categoryName, size].filter(Boolean).join(' ').toLowerCase() ||
    'white shirt L'

  await countryDetector.closeModal()

  await expect(async () => {
    await executeSearch(page, mobileNavigation, search, searchTerm, 'typeOnly')
    await expect(search.searchSuggestionsTagGroup.first()).toBeVisible()

    // Count the actual filter tags that will be applied
    const filterTags = await search.searchSuggestionsTagGroup
      .first()
      .locator(search.searchSuggestionsTag)
      .all()
    const expectedFilterCount = filterTags.length

    await search.searchSuggestionsItem.first().click()
    await page.waitForLoadState('domcontentloaded')

    // Assert the filter counter matches the actual number of filter tags
    if (expectedFilterCount > 0) {
      // eslint-disable-next-line playwright/no-conditional-expect
      await expect(filters.filterCounter).toHaveText(
        expectedFilterCount.toString(),
      )
    } else {
      // eslint-disable-next-line playwright/no-conditional-expect
      await expect(filters.filterCounter).toBeHidden()
    }
  }).toPass()
})

/**
 * Verifies that when an exact product ID is entered into the
 * search input and Enter is pressed, the user is redirected to the
 * corresponding Product Detail Page (PDP).
 * Search term is fetched using the Storefront API client and it contains a product ID.
 */
test('C2170825 Verify Search returns PDP on exact product ID pressing Enter', async ({
  search,
  page,
  mobileNavigation,
  productListingPage,
  storefrontAPIClient,
  countryDetector,
  productDetailPage,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productId = String((productData as Product).id)

  await countryDetector.closeModal()
  await executeSearch(page, mobileNavigation, search, productId, 'enter')
  await page.waitForLoadState('networkidle')
  await productListingPage.h1.waitFor()
  await productDetailPage.productName.waitFor()

  await expect(productDetailPage.productName).toBeVisible()
  expect(page.url()).toContain(productId)
})

/**
 * Verifies that when a valid Reference Key of a product is
 * entered into the search input and Enter is pressed, the user is
 * redirected to the corresponding Product Detail Page (PDP).
 * Search term is fetched using the Storefront API client and it contains a product reference key.
 */
test('C2171031 Verify Search returns product for matching Reference Key', async ({
  search,
  page,
  mobileNavigation,
  storefrontAPIClient,
  countryDetector,
  productDetailPage,
}) => {
  const productData = await storefrontAPIClient.findProduct(
    (product) =>
      product.isActive && // must be active
      (product.variants?.some((variant) => variant.stock?.quantity > 1) ??
        false),
  )

  test.skip(!productData, 'No product found - skipping test')

  const productReferenceKey = String((productData as Product).referenceKey)

  await countryDetector.closeModal()

  await executeSearch(
    page,
    mobileNavigation,
    search,
    productReferenceKey,
    'enter',
  )
  await page.waitForLoadState('networkidle')
  await productDetailPage.productName.waitFor()

  await expect(productDetailPage.productName).toBeVisible()
})
