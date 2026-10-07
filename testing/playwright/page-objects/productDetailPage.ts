import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { Base } from './base/base'

/**
 * Page Object Model for the Product Detail Page (PDP).
 * Encapsulates locators and methods for interacting with and asserting states on
 * individual product pages, including variant selection, basket/wishlist actions,
 * and store availability.
 */
export class ProductDetailPage extends Base {
  // --- Core Product Information Locators ---
  readonly productImage: Locator
  readonly productImageMain: Locator
  readonly productBrand: Locator
  readonly productName: Locator
  readonly priceRegular: Locator
  readonly taxInfo: Locator
  readonly h1: Locator
  readonly pageTitle: Locator

  // --- Variant Selection Locators ---
  readonly variantPicker: Locator
  readonly itemStatus: Locator

  // --- Quantity Selector Locators ---
  readonly quantityValue: Locator
  readonly quantityMinus: Locator
  readonly quantityPlus: Locator

  // --- Basket / Wishlist Actions Locators ---
  readonly addToBasketButton: Locator
  readonly addToBasketButtonMobile: Locator
  readonly buttonAddToWishlistMobile: Locator
  readonly buttonAddToWishlistDesktop: Locator
  readonly buttonRemoveFromWishlistMobile: Locator
  readonly buttonRemoveFromWishlistDesktop: Locator

  // --- Subscription Service Locators ---
  readonly subscriptionService: Locator
  readonly addToBasketButtonSubscribe: Locator

  // --- Store Availability / Store Selector Locators ---
  readonly variantAvailabilityComponent: Locator
  readonly storeAvailabilityHeadline: Locator
  readonly storeAvailabilitySubline: Locator
  readonly buttonOpenStoreFlyout: Locator
  readonly storeSelectorSlideIn: Locator
  readonly storeInput: Locator
  readonly buttonSearchStore: Locator
  readonly locationStoreList: Locator
  readonly locationStoreListItem: Locator
  readonly buttonChooseStore: Locator
  readonly storeName: Locator

  // --- Product Siblings Locators ---
  readonly productSiblingImage: Locator
  readonly productSiblingLink: Locator

  // --- Product Breadcrumb Locators (PDP category breadcrumb links) ---
  /** All category-level breadcrumb links (e.g. women, clothing, pants). Use .nth(i) or .last() for specific level. */
  readonly breadcrumbCategoryLinks: Locator

  // --- Product Information Accordion Locators ---
  readonly productInfoAccordion: Locator
  readonly productInfoAccordionDetails: Locator

  // --- Image Gallery Locators ---
  /** Product gallery container (thumbnails + main image). */
  readonly productGallery: Locator
  /** Arrow down button to scroll the thumbnail strip down. Visible when more thumbnails exist below. */
  readonly imageGalleryButtonDown: Locator
  /** Arrow up button to scroll the thumbnail strip up. Visible when user has scrolled down. */
  readonly imageGalleryButtonUp: Locator

  // --- Image Gallery (main image left/right arrows, desktop) Locators ---
  /** Left arrow button to go to previous image in the main product image slider. */
  readonly sliderArrowButtonLeft: Locator
  /** Right arrow button to go to next image in the main product image slider. */
  readonly sliderArrowButtonRight: Locator

  // --- Image Gallery (mobile slider dots) Locators ---
  /** Container of the slider dots shown on mobile below the main product image. */
  readonly imageGallerySliderDots: Locator

  // --- Image Gallery (zoom overlay / lightbox) Locators ---
  /** Open dialog element when the image zoom overlay is visible. */
  readonly imageGalleryOverlayDialog: Locator
  /** Left arrow button inside the zoom overlay to go to previous image. */
  readonly imageGalleryOverlayArrowLeft: Locator
  /** Right arrow button inside the zoom overlay to go to next image. */
  readonly imageGalleryOverlayArrowRight: Locator
  /** Close button inside the zoom overlay. */
  readonly imageGalleryOverlayCloseButton: Locator
  /** Container of the slider dots inside the zoom overlay. */
  readonly imageGalleryOverlaySliderDots: Locator
  /** Scrollable slider container inside the zoom overlay (for swipe navigation on mobile). */
  readonly imageGalleryOverlayScrollableSlider: Locator

  // --- Recently Viewed Products Slider Locators ---
  /** Container of the recently viewed products slider. Only present in DOM when there are recently viewed products. */
  readonly recentlyViewedProductsSlider: Locator

  // --- Similar Products Slider Locators ---
  /** Container of the similar products slider. Only present in DOM when there are similar products. */
  readonly similarProductsSlider: Locator

  /**
   * Initializes the ProductDetailPage Page Object.
   * @param page - The Playwright Page object.
   */
  constructor(page: Page) {
    super(page)

    // Core Product Information
    this.addToBasketButton = page.getByTestId('add-item-to-basket-button')
    this.productImage = page.getByTestId('product-image')
    this.productImageMain = page.getByTestId('product-image-0')
    this.productBrand = page.getByTestId('pdp-product-brand')
    this.productName = page.getByTestId('pdp-product-name')
    this.priceRegular = page.getByTestId('price')
    this.taxInfo = page.getByTestId('tax-info')
    this.h1 = page.locator('h1')
    this.pageTitle = page.getByTestId('pdp-product-brand')

    // Variant Selection
    this.variantPicker = page.getByTestId('variant-picker').getByRole('button')
    this.itemStatus = page.getByTestId('item-status')

    // Quantity Selector
    this.quantityValue = page.getByTestId('quantity-value')
    this.quantityMinus = page.getByTestId('quantity-minus')
    this.quantityPlus = page.getByTestId('quantity-plus')

    // Basket / Wishlist Actions
    this.addToBasketButtonMobile = page.getByTestId(
      'add-to-basket-button-mobile',
    )
    this.buttonAddToWishlistMobile = page
      .getByTestId('add-item-to-wishlist-button')
      .nth(0)
    this.buttonAddToWishlistDesktop = page
      .getByTestId('add-item-to-wishlist-button')
      .nth(1)
    this.buttonRemoveFromWishlistMobile = page
      .getByTestId('remove-item-from-wishlist-button')
      .nth(0)
    this.buttonRemoveFromWishlistDesktop = page
      .getByTestId('remove-item-from-wishlist-button')
      .nth(1)

    // Subscription Service
    this.subscriptionService = page.getByTestId('subscription-service')
    this.addToBasketButtonSubscribe = page.getByTestId(
      'add-item-to-basket-button-subscribe',
    )

    // Store Availability / Store Selector
    this.variantAvailabilityComponent = page.getByTestId(
      'store-variant-availability-component',
    )
    this.storeAvailabilityHeadline = page.getByTestId(
      'store-availability-headline',
    )
    this.storeAvailabilitySubline = page.getByTestId(
      'store-availability-subline',
    )
    this.buttonOpenStoreFlyout = page.getByTestId('button-open-store-flyout')
    this.storeSelectorSlideIn = page.getByTestId('slide-in-overflow')
    this.storeInput = page.getByTestId('store-input')
    this.buttonSearchStore = page.getByTestId('search-store-button')
    this.locationStoreList = page.getByTestId('location-store-list')
    this.locationStoreListItem = page.getByTestId('location-store-list-item')
    this.buttonChooseStore = page.getByTestId('choose-store-button')
    this.storeName = page.getByTestId('store-name')

    // Product Siblings Selectors
    this.productSiblingImage = page.getByTestId('product-sibling-image')
    this.productSiblingLink = page.getByTestId('product-sibling-link')

    // Product Breadcrumb (PDP category levels, e.g. women | clothing | pants)
    this.breadcrumbCategoryLinks = page.getByTestId(/^category-breadcrumb-\d+$/)

    // Product Information Accordion (uses mobile-nav-accordion test id on PDP)
    this.productInfoAccordion = page.getByTestId('mobile-nav-accordion')
    this.productInfoAccordionDetails = this.productInfoAccordion.locator(
      'xpath=ancestor::details[1]',
    )

    // Image Gallery (thumbnail strip scroll buttons, shown on desktop when many images)
    this.productGallery = page.getByTestId('product-gallery')
    this.imageGalleryButtonDown = page.getByTestId('image-gallery-button-down')
    this.imageGalleryButtonUp = page.getByTestId('image-gallery-button-up')

    // Image Gallery (main image slider left/right arrows, scoped to product gallery)
    this.sliderArrowButtonLeft = this.productGallery.getByTestId(
      'slider-arrow-button-left',
    )
    this.sliderArrowButtonRight = this.productGallery.getByTestId(
      'slider-arrow-button-right',
    )

    // Image Gallery (mobile slider dots, shown on mobile below main image)
    this.imageGallerySliderDots = page.getByTestId('image-gallery-slider-dots')

    // Image Gallery (zoom overlay modal, only present when overlay is open)
    this.imageGalleryOverlayDialog = page.locator('dialog[open]')
    this.imageGalleryOverlayArrowLeft =
      this.imageGalleryOverlayDialog.getByTestId('slider-arrow-button-left')
    this.imageGalleryOverlayArrowRight =
      this.imageGalleryOverlayDialog.getByTestId('slider-arrow-button-right')
    this.imageGalleryOverlayCloseButton =
      this.imageGalleryOverlayDialog.getByTestId('close-button')
    this.imageGalleryOverlaySliderDots =
      this.imageGalleryOverlayDialog.getByTestId(
        'image-gallery-overlay-slider-dots',
      )
    this.imageGalleryOverlayScrollableSlider = this.imageGalleryOverlayDialog
      .locator('.overflow-x-auto')
      .first()

    // Recently Viewed Products Slider (only in DOM when there are recently viewed products)
    this.recentlyViewedProductsSlider = page.getByTestId(
      'recently-viewed-products-slider',
    )

    // Similar Products Slider (only in DOM when there are similar products)
    this.similarProductsSlider = page.getByTestId('similar-products-slider')
  }

  /**
   * Returns a locator for a product card within the recently viewed products slider.
   * @param productId - The product ID of the recently viewed item.
   * @returns Locator for the product card (article) in the recently viewed slider.
   */
  getRecentlyViewedProductCard(productId: number): Locator {
    return this.recentlyViewedProductsSlider.locator(
      `[data-testid="article-${productId}"]`,
    )
  }

  /**
   * Returns the breadcrumb category link at the given index (0 = root level, e.g. women; last = lowest level, e.g. pants).
   */
  getBreadcrumbCategoryLink(index: number): Locator {
    return this.page.getByTestId(`category-breadcrumb-${index}`)
  }

  /**
   * Returns the slider dot locator at the given index (mobile image gallery).
   * Active dot has class containing bg-primary.
   */
  getImageGallerySliderDot(index: number): Locator {
    return this.page.getByTestId(`image-gallery-slider-dot-${index}`)
  }

  /**
   * Returns the zoom overlay image locator at the given index.
   * Only present when the image gallery zoom overlay is open.
   */
  getImageGalleryOverlayImage(index: number): Locator {
    return this.page.getByTestId(`product-image-zoom-${index}`)
  }

  /**
   * Returns the zoom overlay slider dot locator at the given index.
   * Only present when the image gallery zoom overlay is open and has multiple images.
   */
  getImageGalleryOverlaySliderDot(index: number): Locator {
    return this.imageGalleryOverlayDialog.getByTestId(
      `image-gallery-overlay-slider-dot-${index}`,
    )
  }

  // --- Getter functions ---

  /**
   * Getter for the "add to wishlist" button, handles mobile and desktop viewports.
   */
  private get buttonAddToWishlist(): Locator {
    return this.isMobileViewport
      ? this.buttonAddToWishlistMobile
      : this.buttonAddToWishlistDesktop
  }

  /**
   * Getter for the "add to wishlist" button, handles mobile and desktop viewports.
   */
  private get buttonRemoveFromWishlist(): Locator {
    return this.isMobileViewport
      ? this.buttonRemoveFromWishlistMobile
      : this.buttonRemoveFromWishlistDesktop
  }

  // --- Private Helper Methods ---

  /**
   * Returns a Locator for a specific product variant option (e.g., a size).
   * @param variantId - Optional: The data-testid of the specific variant option (e.g., 'variant-option-123').
   * If not provided, selects the first non-disabled variant option.
   * @returns A Playwright Locator for the product variant option.
   */
  getVariant(variantId?: string): Locator {
    const selector = variantId
      ? `button[data-testid="variant-option-${variantId}"]`
      : 'button[data-testid^="variant-option-"]:not([disabled])'

    return this.page.locator(selector).first()
  }

  /**
   * Returns a random, non-disabled product variant option from a given locator.
   *
   * @param availableVariantsLocator - A locator that has already found all available variants.
   * @returns A Playwright Locator for a randomly selected available variant.
   */
  async getRandomVariant(availableVariantsLocator: Locator): Promise<Locator> {
    const count = await availableVariantsLocator.count()

    if (count === 0) {
      throw new Error('No available product variants found to select from.')
    }

    // eslint-disable-next-line sonarjs/pseudo-random
    const randomIndex = Math.floor(Math.random() * count)
    return availableVariantsLocator.nth(randomIndex)
  }

  /**
   * Returns the correct "Add to Wishlist" button Locator based on device type.
   * @returns A Playwright Locator for the Add to Wishlist button.
   */
  private getAddToWishlistButton(): Locator {
    return this.buttonAddToWishlist
  }

  // --- Action Methods ---

  /**
   * Adds the currently displayed product to the basket via UI interaction.
   * Chooses the appropriate "Add to Basket" button based on device type.
   */
  async addProductToBasket() {
    const targetButton = this.isMobileViewport
      ? this.addToBasketButtonMobile
      : this.addToBasketButton

    await this.page.evaluate(() => window.scrollTo(0, 1000))
    await this.page.waitForTimeout(500)
    await targetButton.click({ force: true })
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Adds the current product to the wishlist.
   */
  async addProductToWishlist() {
    await this.getAddToWishlistButton().click()
  }

  /**
   * Removes the current product from the wishlist.
   */
  async removeProductFromWishlist() {
    await this.buttonRemoveFromWishlist.click()
  }

  /**
   * Types a store name into the store search input field within the store selector flyout.
   * @param store - The name of the store to type.
   */
  async typeStoreName(store: string) {
    await this.storeInput.waitFor()
    await this.storeInput.focus()
    await this.storeInput.fill(store)
    await this.page.waitForTimeout(100)
  }

  /**
   * Determines and selects a product variant based on the state of the variant picker.
   * If the variant picker is disabled (implying a single, pre-selected variant like one-size),
   * no action is taken. If it's enabled, the method clicks the picker to open the dropdown
   * and selects the first available (non-disabled) product variant.
   */
  async chooseProductVariant() {
    const isVariantPickerDisabled = await this.variantPicker.isDisabled()

    if (!isVariantPickerDisabled) {
      await this.variantPicker.click({ force: true })
      await this.getVariant().click()
    }
  }

  /**
   * Handles the logic for choosing and selecting a product variant.
   * It checks if the variant picker is enabled and then selects a random, available variant.
   */
  async chooseRandomProductVariant() {
    const isVariantPickerDisabled = await this.variantPicker.isDisabled()

    if (!isVariantPickerDisabled) {
      await this.variantPicker.click({ force: true })

      const availableVariantsLocator = this.page.locator(
        'button[data-testid^="variant-option-"]:not([disabled])',
      )
      await availableVariantsLocator.first().waitFor({ state: 'visible' })

      const randomVariantLocator = await this.getRandomVariant(
        availableVariantsLocator,
      )
      await randomVariantLocator.click()
    }
  }
  // --- Assertion Methods ---

  /**
   * Asserts the visibility of the "Add to Wishlist" icon and the non-visibility
   * of the "Remove from Wishlist" icon, based on device type.
   */
  async assertAddToWishlistIconVisibility() {
    await this.buttonAddToWishlist.waitFor()

    await expect(this.buttonAddToWishlist).toBeVisible()
    await expect(this.buttonRemoveFromWishlist).toBeHidden()
  }

  /**
   * Asserts the visibility of the "Remove from Wishlist" icon and the non-visibility
   * of the "Add to Wishlist" icon, based on device type.
   */
  async assertRemoveFromWishlistIconVisibility() {
    await this.buttonRemoveFromWishlist.waitFor()

    await expect(this.buttonRemoveFromWishlist).toBeVisible()
  }

  /**
   * Asserts the visibility of the main store selector component.
   * @param visible - True if the component is expected to be visible, false otherwise.
   */
  async assertStoreSelectorIsVisible(visible: boolean) {
    await expect(this.variantAvailabilityComponent).toBeVisible({ visible })
  }

  /**
   * Asserts the visibility of the store selector flyout/slide-in panel.
   * @param visible - True if the flyout is expected to be visible, false otherwise.
   */
  async assertStoreSelectorFlyoutIsVisible(visible: boolean) {
    await this.storeSelectorSlideIn.first().waitFor()
    await expect(this.storeSelectorSlideIn.first()).toBeVisible({ visible })
  }
}
