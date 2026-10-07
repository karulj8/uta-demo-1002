/**
 * @file This file serves as an Artillery test processor, containing various user flow functions
 * executed by the Playwright engine. Each exported function represents a distinct user journey
 * that can be called from an Artillery scenario defined in a .yml configuration file.
 * The functions use Playwright to control a browser and simulate real user interactions
 * with the web application.
 */

import { join } from 'node:path'
import { readFileSync } from 'node:fs'

import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

import { HomePage } from '@scayle/storefront-application-playwright/page-objects/homePage'
import { CountryDetector } from '@scayle/storefront-application-playwright/page-objects/components/countryDetector'
import { ProductListingPage } from '@scayle/storefront-application-playwright/page-objects/productListingPage'
import { Search } from '@scayle/storefront-application-playwright/page-objects/components/search'
import { Header } from '@scayle/storefront-application-playwright/page-objects/components/header'
import { ProductDetailPage } from '@scayle/storefront-application-playwright/page-objects/productDetailPage'
import { BasketPage } from '@scayle/storefront-application-playwright/page-objects/basketPage'
import { RPC } from '@scayle/storefront-application-playwright/page-objects/components/rpc'
import { executeSearch } from '@scayle/storefront-application-playwright/support/utils'
import { MobileNavigation } from '@scayle/storefront-application-playwright/page-objects/components/mobileNavigation'
import { withErrorHandling } from '../utils/debug'

// --- File Paths (Constants) ---
const PATHS_FILE = join(__dirname, '../../test-data/paths.json')
const SEARCH_TERMS_FILE = join('./test-data/search-terms.json')

// --- Synchronous Data Helpers (Cached) ---
const RAW_PATHS_DATA = readFileSync(PATHS_FILE, 'utf-8')
const ALL_PATHS = JSON.parse(RAW_PATHS_DATA)
const RAW_SEARCH_TERMS_DATA = readFileSync(SEARCH_TERMS_FILE, 'utf-8')
const ALL_SEARCH_TERMS = Object.values(JSON.parse(RAW_SEARCH_TERMS_DATA))

/**
 * Returns a random URL path for a specified page type from the cached data.
 *
 * @param pageType - The type of page to get a random path for ('plp' or 'pdp').
 *
 * @returns A random URL path string.
 */
function getRandomPath(pageType: 'plp' | 'pdp'): string {
  const paths = ALL_PATHS.map(
    (item: { [key: string]: string }) => item[pageType],
  )
  // eslint-disable-next-line sonarjs/pseudo-random
  const randomIndex = Math.floor(Math.random() * paths.length)

  return paths[randomIndex]
}

/**
 * Returns a random search term from the cached data.
 *
 * @returns A random search term string.
 */
function getRandomSearchTerm(): string {
  // eslint-disable-next-line sonarjs/pseudo-random
  const randomIndex = Math.floor(Math.random() * ALL_SEARCH_TERMS.length)

  return ALL_SEARCH_TERMS[randomIndex] as string
}

/**
 * Navigates to a URL and closes the country detector modal.
 *
 * @param page The Playwright Page object.
 * @param path The URL path to navigate to.
 * @param waitUntil The load state to wait for.
 */
async function navigateAndCloseModal(
  page: Page,
  path: string,
  waitUntil: 'commit' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
) {
  const countryDetector = new CountryDetector(page)

  try {
    // Use domcontentloaded instead of networkidle for faster navigation
    const navigationPromise = page.goto(path, { waitUntil })

    await navigationPromise

    await page.waitForLoadState('networkidle')

    await countryDetector.closeModal()

    // Small delay to ensure page is stable after modal interaction
    // TODO: Test if we actually need this delay or if we can remove it.
    // If we remove it, we need to ensure that the page is stable after the modal interaction.
    await page.waitForTimeout(1000)
  } catch (error) {
    console.warn(`Navigation timeout for ${path}:`, error)
    // Continue execution even if navigation times out
    throw error
  }
}

// --- User Flow Functions (Test Scenarios) ---

/**
 * Navigates to the homepage, closes the country selection modal, and asserts
 * that the main content of the homepage is visible.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function openHomepage(page: Page) {
  await withErrorHandling(page, 'openHomepage', '/', async () => {
    const homePage = new HomePage(page)

    await navigateAndCloseModal(page, '/', 'commit')
    await homePage.homepageMainContent.waitFor({ timeout: 10000 })

    await expect(homePage.homepageContent).toBeVisible()
  })
}

/**
 * Navigates to a random Product Listing Page (PLP) and verifies it has loaded.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function openPlp(page: Page) {
  const randomPath = getRandomPath('plp')

  await withErrorHandling(page, 'openPlp', randomPath, async () => {
    const plp = new ProductListingPage(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for product cards to be visible and interactive
    await plp.productCard.first().waitFor({ state: 'visible', timeout: 10000 })

    await expect(plp.productCard.first()).toBeVisible()
  })
}

/**
 * Navigates to a random Product Detail Page (PDP) and verifies it has loaded.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function openPdp(page: Page) {
  const randomPath = getRandomPath('pdp')

  await withErrorHandling(page, 'openPdp', randomPath, async () => {
    const pdp = new ProductDetailPage(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for variant picker to be visible and interactive
    await pdp.variantPicker.waitFor({ state: 'visible', timeout: 10000 })

    await expect(pdp.variantPicker).toBeVisible()
  })
}

/**
 * Simulates a journey where a user lands on a random PDP, selects a random product variant
 * from available variants, and adds it to the basket.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function fromPdpToBasket(page: Page) {
  const randomPath = getRandomPath('pdp')

  await withErrorHandling(page, 'fromPdpToBasket', randomPath, async () => {
    const pdp = new ProductDetailPage(page)
    const header = new Header(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for variant picker to be visible and interactive
    await pdp.variantPicker.waitFor({ state: 'visible', timeout: 10000 })

    // Wait for variant options to be available and visible
    await pdp.chooseRandomProductVariant()

    // Wait for add to basket button to be available
    await pdp.addProductToBasket()

    // Wait for basket count to update with a longer timeout
    await header.basketNumItems.waitFor({ state: 'visible', timeout: 10000 })

    await expect(header.basketNumItems).toHaveText('1')
  })
}

/**
 * Simulates a journey where a user lands on a random PDP and adds the product to Wishlist.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function fromPdpToWishlist(page: Page) {
  const randomPath = getRandomPath('pdp')

  await withErrorHandling(page, 'fromPdpToWishlist', randomPath, async () => {
    const pdp = new ProductDetailPage(page)
    const header = new Header(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for variant picker to be visible and interactive
    await pdp.variantPicker.waitFor({ state: 'visible', timeout: 10000 })

    // Wait for wishlist button to be available and visible
    await pdp.buttonAddToWishlistDesktop.waitFor({
      state: 'visible',
      timeout: 10000,
    })
    await pdp.addProductToWishlist()

    await header.wishlistNumItems.waitFor({ state: 'visible', timeout: 10000 })

    await expect(header.wishlistNumItems).toHaveText('1')
  })
}

/**
 * Simulates a journey where a user lands on a random PLP, selects the first available
 * product card, and adds it to the wishlist.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function fromPlpToWishlist(page: Page) {
  const randomPath = getRandomPath('plp')

  await withErrorHandling(page, 'fromPlpToWishlist', randomPath, async () => {
    const plp = new ProductListingPage(page)
    const header = new Header(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for product cards to be visible and interactive
    await plp.productCard.first().waitFor({ state: 'visible', timeout: 10000 })

    // Wait for wishlist button to be available and visible
    await plp.wishlistButton.first().waitFor({
      state: 'visible',
      timeout: 10000,
    })
    await plp.wishlistButton.first().click()

    await header.wishlistNumItems.waitFor({ state: 'visible', timeout: 10000 })

    await expect(header.wishlistNumItems).toHaveText('1')
  })
}

/**
 * Simulates a user journey from a random Product Listing Page (PLP) to a Product Detail Page (PDP).
 * It navigates to a random PLP, clicks a random sub-category to refine the listing,
 * then clicks a random product image to navigate to the PDP, and finally asserts
 * that the PDP has loaded by checking for the variant picker element.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function navigatePlpToPdp(page: Page) {
  const randomPath = getRandomPath('plp')

  await withErrorHandling(page, 'navigatePlpToPdp', randomPath, async () => {
    const plp = new ProductListingPage(page)
    const pdp = new ProductDetailPage(page)

    await navigateAndCloseModal(page, randomPath, 'domcontentloaded')

    // Wait for product cards to be visible and interactive
    await plp.productCard.first().waitFor({ state: 'visible', timeout: 10000 })

    // Click a random sub-category if available
    const subCategoryCount = await plp.menuSubCategory.count()
    if (subCategoryCount > 0) {
      const randomSubCategoryIndex = Math.floor(
        // eslint-disable-next-line sonarjs/pseudo-random
        Math.random() * subCategoryCount,
      )
      await plp.menuSubCategory.nth(randomSubCategoryIndex).click()
    }

    // Wait for the product list to be ready after filtering
    await plp.productImage.first().waitFor({ state: 'visible', timeout: 10000 })

    // Click a random product image if available
    const productImageCount = await plp.productImage.count()
    if (productImageCount > 0) {
      // eslint-disable-next-line sonarjs/pseudo-random
      const randomProductIndex = Math.floor(Math.random() * productImageCount)
      await plp.productImage.nth(randomProductIndex).click()
    }

    // Wait for PDP to load and variant picker to be visible
    await pdp.variantPicker.waitFor({ state: 'visible', timeout: 10000 })

    await expect(pdp.variantPicker).toBeVisible()
  })
}

/**
 * Simulates a user journey starting from the homepage and searching for a product.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function searchFromHomepage(page: Page) {
  const countryDetector = new CountryDetector(page)
  const search = new Search(page)
  const homePage = new HomePage(page)
  const plp = new ProductListingPage(page)
  const mobileNavigation = new MobileNavigation(page)

  const searchTerm = getRandomSearchTerm()

  await homePage.navigate(page, '/', 'commit')
  await countryDetector.closeModal()

  await executeSearch(page, mobileNavigation, search, searchTerm, 'enter')
  await plp.productCard.first().waitFor({ state: 'visible', timeout: 10000 })

  await expect(plp.productCard.first()).toBeVisible()
}

/**
 * Simulates a user adding a product to the wishlist from a PLP.
 * Assumes the user is already on a PLP.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function addProductToWishlistFromPlp(page: Page) {
  const plp = new ProductListingPage(page)
  const header = new Header(page)

  await plp.addProductToWishlist()
  await header.wishlistNumItems.waitFor()

  await expect(header.wishlistNumItems).toBeVisible()
  await expect(header.wishlistNumItems).toHaveText('1')
}

/**
 * Simulates a user adding a product to the basket from a PDP.
 * Assumes the user is already on a PDP.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function addProductToBasketFromPdp(page: Page) {
  const pdp = new ProductDetailPage(page)
  const header = new Header(page)

  await pdp.variantPicker.waitFor({ state: 'visible', timeout: 10000 })
  await pdp.chooseRandomProductVariant()
  await pdp.addProductToBasket()
  await header.basketNumItems.waitFor()

  await expect(header.basketNumItems).toBeVisible()
  await expect(header.basketNumItems).toHaveText('1')
}

/**
 * Simulates a full user journey starting from the homepage. The user searches for a product,
 * navigates to the PDP, adds the item to the basket. Finally, it navigates to the basket
 * page and verifies the correct product is present.
 *
 * @param page The Playwright Page object provided by the Artillery engine.
 *
 * @returns {Promise<void>}
 */
export async function fromHomeToBasket(page: Page) {
  const plp = new ProductListingPage(page)
  const countryDetector = new CountryDetector(page)
  const pdp = new ProductDetailPage(page)
  const search = new Search(page)
  const homePage = new HomePage(page)
  const header = new Header(page)
  const rpc = new RPC(page)
  const basket = new BasketPage(page, rpc)
  const mobileNavigation = new MobileNavigation(page)

  const searchTerm = getRandomSearchTerm()

  await homePage.navigate(page, '/', 'commit')
  await countryDetector.closeModal()

  await executeSearch(page, mobileNavigation, search, searchTerm, 'enter')
  await plp.menuRootCategory.waitFor()

  await plp.productImage.first().click()
  await pdp.variantPicker.waitFor()
  await pdp.chooseRandomProductVariant()
  await pdp.addProductToBasket()
  await header.basketNumItems.waitFor()

  await expect(header.basketNumItems).toHaveText('1')

  const basketProductBrandText = await pdp.productBrand.textContent()
  const basketProductNameText = await pdp.productName.textContent()

  await header.visitBasketPage()
  await basket.assertProductIsInBasket(
    basketProductBrandText as string,
    basketProductNameText as string,
  )
}
