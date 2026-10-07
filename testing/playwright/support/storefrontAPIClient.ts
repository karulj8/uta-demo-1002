import {
  StorefrontAPIClient as SapiClient,
  type ProductsSearchEndpointResponseData,
  type Product,
  type Category,
} from '@scayle/storefront-api'

export class StorefrontAPIClient {
  private readonly client: SapiClient

  /**
   * Creates a new StorefrontAPIClient instance for testing purposes.
   *
   * This constructor initializes the underlying SAPI client with the provided
   * configuration for connecting to a specific shop's API.
   *
   * @param {string} host - The API host URL (e.g., 'https://api.scayle.com')
   * @param {number} shopId - The unique identifier for the shop
   * @param {string} token - The authentication token for API access
   *
   * @example
   * const client = new StorefrontAPIClient(
   *   'https://api.scayle.com',
   *   12345,
   *   'your-api-token'
   * )
   */
  constructor(host: string, shopId: number, token: string) {
    this.client = new SapiClient({
      host: host,
      shopId: shopId,
      auth: {
        type: 'token',
        token: token,
      },
    })
  }

  /**
   * Finds the first product that matches the given predicate function.
   * It searches through pages of products until a match is found.
   *
   * @param {(product: Product) => boolean} predicate - Predicate function to test against each product.
   * @returns {Promise<Product | undefined>} A product that matches the criteria, or undefined if none found.
   */
  async findProduct(
    predicate: (product: Product) => boolean,
  ): Promise<Product | undefined> {
    const MAX_PAGES_TO_CHECK = 25
    const PRODUCTS_PER_PAGE = 25

    for (let page = 1; page <= MAX_PAGES_TO_CHECK; page++) {
      console.log(
        `Searching for a product on page ${page}... Using predicate function`,
      )

      const response: ProductsSearchEndpointResponseData =
        await this.client.products.query({
          with: {
            variants: {
              attributes: 'all',
            },
            siblings: 'all',
            attributes: 'all',
            categories: 'all',
          },
          pagination: { page, perPage: PRODUCTS_PER_PAGE },
        })

      const currentBatch = response.entities
      if (!currentBatch || currentBatch.length === 0) {
        break
      }

      const product = currentBatch.find(predicate)

      if (product) {
        console.log(`[SUCCESS] Found matching product with ID: ${product.id}`)
        return product
      }
    }

    return undefined
  }

  /**
   * Gets root categories from the API.
   *
   * @param parameters Optional parameters for retrieving root categories
   * @returns {Promise<Category[]>} Array of root categories
   */
  async getRootCategories(
    parameters: Parameters<typeof this.client.categories.getRoots>[0] = {},
  ) {
    return await this.client.categories.getRoots(parameters)
  }

  /**
   * Gets search suggestions for a given term.
   *
   * @param term The search term to get suggestions for
   * @returns {Promise<TypeaheadSuggestionsEndpointResponseData>} Search suggestions
   */
  async getSearchSuggestions(term: string) {
    return await this.client.typeahead.suggestions(term)
  }

  /**
   * Gets the product count for a specific category.
   *
   * @param categoryId The ID of the category to check
   * @returns {Promise<number>} The total number of products in the category
   */
  async getCategoryProductCount(categoryId: number): Promise<number> {
    const response = await this.client.products.query({
      where: { categoryId },
      pagination: { page: 1, perPage: 1 },
    })
    return response.pagination.total
  }

  /**
   * Finds a category with more than the specified minimum number of products.
   * Searches through root categories and their children recursively.
   *
   * @param minProducts The minimum number of products required
   * @returns {Promise<Category | undefined>} A category with enough products, or undefined if none found
   */
  async findCategoryWithProducts(
    minProducts: number,
  ): Promise<Category | undefined> {
    const rootCategories = await this.getRootCategories()

    for (const rootCategory of rootCategories) {
      // Check the root category itself
      const rootProductCount = await this.getCategoryProductCount(
        rootCategory.id,
      )
      if (rootProductCount >= minProducts) {
        console.log(
          `Found root category "${rootCategory.name}" with ${rootProductCount} products`,
        )
        return rootCategory
      }

      // Check children if they exist
      if (rootCategory.children && rootCategory.children.length > 0) {
        for (const childCategory of rootCategory.children) {
          const childProductCount = await this.getCategoryProductCount(
            childCategory.id,
          )
          if (childProductCount >= minProducts) {
            console.log(
              `Found child category "${childCategory.name}" with ${childProductCount} products`,
            )
            return childCategory
          }
        }
      }
    }

    console.log(`No category found with at least ${minProducts} products`)
    return undefined
  }

  /**
   * Finds a subcategory (child category) with its parent category.
   * Searches through root categories and their children to find a child category
   * that has at least the specified minimum number of products.
   *
   * @param minProducts The minimum number of products required in the subcategory
   * @returns {Promise<{ parent: Category; child: Category } | undefined>} An object containing the parent and child categories, or undefined if none found
   */
  async findSubcategoryWithParent(
    minProducts: number,
  ): Promise<{ parent: Category; child: Category } | undefined> {
    const rootCategories = await this.getRootCategories({
      with: { children: 1 },
    })

    for (const rootCategory of rootCategories) {
      // Check children if they exist
      for (const childCategory of rootCategory.children ?? []) {
        const childProductCount = await this.getCategoryProductCount(
          childCategory.id,
        )
        if (childProductCount >= minProducts) {
          console.log(
            `Found subcategory "${childCategory.name}" (parent: "${rootCategory.name}") with ${childProductCount} products`,
          )
          return { parent: rootCategory, child: childCategory }
        }
      }
    }

    console.log(
      `No subcategory found with at least ${minProducts} products and a parent category`,
    )
    // eslint-disable-next-line sonarjs/no-redundant-jump
    return
  }

  /**
   * Finds a product with siblings from a list of product IDs.
   * This is useful when you have product IDs from the DOM and need to find one with siblings.
   *
   * Uses a two-pass approach to optimize resource usage:
   * 1. First pass: Query lightweight data (siblings only) to identify matching product
   * 2. Second pass: Fetch full details only for the matching product
   *
   * @param productIds Array of product IDs to check
   * @param predicate Optional predicate function to filter products. Defaults to finding products with siblings.
   * @returns {Promise<Product | undefined>} A product with siblings, or undefined if none found
   */
  async findProductWithSiblingsFromIds(
    productIds: number[],
    predicate: (product: Product) => boolean = (product) =>
      Boolean(
        product.isActive && product.siblings && product.siblings.length > 1,
      ),
  ): Promise<Product | undefined> {
    if (productIds.length === 0) {
      return
    }

    // First pass: Query lightweight data to find matching product
    const lightweightProducts = await this.client.products.getByIds(
      productIds,
      {
        with: {
          siblings: 'all',
        },
      },
    )

    const matchingProduct = lightweightProducts.find(predicate)

    if (!matchingProduct) {
      return
    }

    // Second pass: Fetch full details only for the matching product
    const fullProduct = await this.client.products.getById(matchingProduct.id, {
      with: {
        variants: {
          attributes: 'all',
        },
        siblings: 'all',
        attributes: 'all',
        categories: 'all',
      },
    })

    console.log(
      `[SUCCESS] Found product with siblings (ID: ${fullProduct.id}) from provided product IDs`,
    )

    return fullProduct
  }

  /**
   * Finds a product with multiple images from a list of product IDs.
   * Used when you have product IDs from the PLP DOM and need one that has an image slider (2+ images).
   *
   * @param productIds Array of product IDs to check
   * @returns {Promise<Product | undefined>} A product with multiple images, or undefined if none found
   */
  async findProductWithMultipleImagesFromIds(
    productIds: number[],
  ): Promise<Product | undefined> {
    if (productIds.length === 0) {
      return
    }

    const products = await this.client.products.getByIds(productIds, {
      with: {},
    })

    const matchingProduct = products.find(
      (p) => Array.isArray(p.images) && p.images.length > 1,
    )

    if (!matchingProduct) {
      return
    }

    console.log(
      `[SUCCESS] Found product with multiple images (ID: ${matchingProduct.id}, ${
        matchingProduct.images!.length
      } images) from provided product IDs`,
    )

    return matchingProduct
  }

  /**
   * Gets the URL path for a category to navigate to it in the storefront.
   *
   * @param category The category to get the path for
   * @returns {string} The URL path for the category
   */
  getCategoryPath(category: Category): string {
    // Build the path from the category's slug
    return `/c/${category.slug}-${category.id}`
  }
}
