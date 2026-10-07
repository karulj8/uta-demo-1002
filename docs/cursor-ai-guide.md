# Cursor AI Editor Guide

This guide provides comprehensive information on using [Cursor](https://cursor.sh/),
an AI-powered code editor, to accelerate development of the SCAYLE Storefront Application.
Cursor provides context-aware code suggestions, refactoring assistance,
and automated code generation while following the project's established patterns and best practices.

## Table of Contents

- [Why Use Cursor for SCAYLE Storefront Development?](#why-use-cursor-for-scayle-storefront-development)
- [Cursor Rules](#cursor-rules)
- [Getting Started with Cursor](#getting-started-with-cursor)
- [Understanding Cursor Chat Modes](#understanding-cursor-chat-modes)
- [Best Practices for Using Cursor](#best-practices-for-using-cursor)
- [Common Use Cases](#common-use-cases)
- [Managing Context for Complex Changes](#managing-context-for-complex-changes)
- [Tips for Maximum Productivity](#tips-for-maximum-productivity)
- [Common Pitfalls to Avoid](#common-pitfalls-to-avoid)
- [Troubleshooting](#troubleshooting)

## Why Use Cursor for SCAYLE Storefront Development?

The SCAYLE Storefront Application is a sophisticated e-commerce platform built with modern technologies. Cursor AI provides intelligent assistance that helps developers of all skill levels work effectively with this codebase through 13+ project-specific rules that ensure code quality and consistency.

### Core Benefits

**Accelerated Development:**

- Generate boilerplate code for components, composables, and RPC methods instantly.
- Refactor existing code while preserving functionality and patterns.
- Write comprehensive tests following project conventions.
- Get instant answers about architecture and implementation patterns.

**Consistent Quality:**

- Automatic adherence to Vue 3 Composition API, Nuxt 3, TypeScript, and Tailwind CSS best practices.
- Built-in validation against project standards before code review.
- Proper error handling, loading states, and accessibility compliance.
- Maintain consistency across the codebase regardless of developer experience.

**Interactive Learning:**

- Understand complex patterns through AI-generated examples with explanations.
- Learn SCAYLE-specific concepts like RPC methods and basket management.
- Discover performance optimization and accessibility best practices.
- Validate approaches against project standards automatically.

### Benefits by Developer Level

**Junior Developers:**

- Focus on business logic while AI handles syntax and boilerplate.
- Learn Vue 3 Composition API and TypeScript patterns through correct implementations.
- Build confidence by experimenting with AI assistance before asking seniors.

**Mid-Level Developers:**

- Implement features quickly following established patterns.
- Expand knowledge of advanced TypeScript and Nuxt 3 optimization techniques.
- Generate comprehensive test coverage efficiently.

**Senior Developers:**

- Ensure team follows architectural patterns through AI-enforced standards.
- Scale knowledge across distributed teams with consistent AI-generated examples.
- Identify deviations from project standards during code review.

**External Developers & Agencies:**

- Understand SCAYLE architecture quickly without deep platform knowledge.
- Follow best practices automatically, reducing dependency on SCAYLE support.
- Minimize rework and technical debt from the start.

### SCAYLE Storefront Advantages

**Project-Specific Intelligence:**

- Cursor Rules tailored for SCAYLE Storefront patterns and `@scayle/storefront-nuxt` conventions.
- Understanding of e.g., RPC methods, session handling and basket workflows.

**Framework Expertise:**

- Nuxt 3 server-side rendering, Vue 3 Composition API, Tailwind CSS utilities, and TypeScript type safety.

**Quality Assurance:**

- Consistent code style, proper error handling, WCAG accessibility compliance, and comprehensive test coverage.

By leveraging Cursor AI, teams deliver high-quality SCAYLE storefronts faster with fewer bugs and more maintainable code—regardless of individual experience levels.

## Cursor Rules

The project includes a comprehensive set of Cursor Rules located in `.cursor/rules/`
that guide the AI to follow project-specific conventions. These rules are automatically
loaded by Cursor and provide context-aware guidance when writing code.

### Available Rule Files

The following rule files are available to guide AI-assisted development:

| Rule File                  | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| `imports.mdc`              | Import patterns and `@scayle/storefront-nuxt` preference guidelines |
| `javascript-standards.mdc` | Modern JavaScript and TypeScript best practices                     |
| `vue-components.mdc`       | Vue 3 component guidelines with Composition API patterns            |
| `composables.mdc`          | Vue composable creation and usage patterns                          |
| `tailwind-css.mdc`         | Tailwind CSS utility-first styling guidelines                       |
| `base-components.mdc`      | Base UI component usage and customization                           |
| `rpc-methods.mdc`          | RPC method implementation patterns                                  |
| `middleware.mdc`           | Nuxt middleware creation guidelines                                 |
| `translations.mdc`         | i18n translation and localization patterns                          |
| `testing.mdc`              | Testing standards and best practices                                |
| `accessibility.mdc`        | WCAG compliance and accessibility guidelines                        |
| `performance.mdc`          | Performance optimization techniques                                 |
| `stories.mdc`              | Storybook component documentation patterns                          |

These rules ensure that AI-generated code follows the project's established patterns and maintains consistency across the codebase.

## Getting Started with Cursor

### 1. Install Cursor

Download and install Cursor from [cursor.sh](https://cursor.sh/). Cursor is available for macOS, Windows, and Linux.

### 2. Open the Project

```bash
# Navigate to the storefront application
cd path/to/your/storefront-application-project

# Open in Cursor
cursor .
```

Alternatively, open Cursor and use `File > Open Folder` to open the Storefront Application directory.

### 3. Verify Cursor Rules

Cursor will automatically detect and load the rules from `.cursor/rules/`. You can verify this by:

- Opening the Cursor settings
- Navigating to the "Cursor Rules" section
- Confirming that the project rules are loaded

### 4. Add Documentation (Recommended)

Enhance Cursor's context awareness by adding relevant documentation sources:

1. Open Cursor Settings (`Cmd+,` on macOS, `Ctrl+,` on Windows/Linux)
2. Navigate to `Features` > `Docs`
3. Click `Add new doc`
4. Add the following documentation URLs (one at a time):
   - **SCAYLE Storefront**: `https://scayle.dev/`
   - **Nuxt 3**: `https://nuxt.com/docs/3.x/`
   - **Vue 3**: `https://vuejs.org/guide/`
   - **Tailwind CSS**: `https://v3.tailwindcss.com/docs/`
   - **Vitest**: `https://vitest.dev/guide/`
   - **Playwright**: `https://playwright.dev/docs/`
5. Depending on your selected CMS provider:
   - **Storyblok**: `https://www.storyblok.com/docs`
   - **Contentful**: `https://www.contentful.com/developers/docs/`
6. Wait for each to complete indexing.

Once indexed, you can reference these documentation sources using `@Docs` in the Cursor chat.

**Note:** Currently, Cursor does not support team-wide documentation configuration files.
Each developer needs to add documentation sources individually. This is a one-time setup per machine.

## Understanding Cursor Chat Modes

Cursor provides three distinct chat modes, each optimized for different development scenarios. Understanding when to use each mode will help you work more effectively with the SCAYLE Storefront Application.

### Ask Mode

Best for quick questions, explanations, and code reviews.
For more details check the [official Cursor documentation for "Modes > Ask"](https://cursor.com/docs/agent/modes#ask).

**Use in SCAYLE Storefront for:**

- **Understanding Code**: Ask questions about existing patterns and implementations
- **Code Review**: Get feedback on specific code sections
- **Quick Fixes**: Solve specific problems without modifying files
- **Learning**: Understand SCAYLE-specific concepts

**Characteristics:**

- Provides answers and code suggestions in the chat panel
- Does not automatically modify files
- Good for exploration and learning
- Fast responses for quick questions
- Lightweight context - ideal for multiple quick queries

**Context Management:**

- Keep questions focused and specific
- Start fresh after 3-5 prompts if switching topics
- Use `@filename` to provide relevant context
- Good for creating plans that can be saved to files

### Plan Mode

Best for multi-file changes and feature implementation.
For more details check the [official Cursor documentation for "Planning"](https://cursor.com/docs/agent/planning).

**Use in SCAYLE Storefront for:**

- **Feature Implementation**: Build complete features across multiple files
- **Refactoring**: Make coordinated changes across components
- **Bug Fixes**: Fix issues that span multiple files
- **Adding Tests**: Create comprehensive test coverage
- **Planning**: Create detailed implementation plans before coding

**Characteristics:**

- Can edit multiple files simultaneously
- Shows proposed changes before applying
- Maintains context across related files
- Best for coordinated, multi-file changes

**Context Management:**

- Provide clear, detailed requirements upfront
- List all files that need changes using `@filename`
- Review proposed changes before accepting
- Start fresh context for each major phase of work
- Use `@PLAN_FILE.md` to reference saved plans

### Agent Mode

Best for complex tasks requiring autonomous planning and execution.
For more details check the [official Cursor documentation for "Modes > Agent"](https://cursor.com/docs/agent/modes#agent).

**Use in SCAYLE Storefront for:**

- **Complex Features**: Implement features requiring research and planning
- **Architecture Changes**: Make significant structural improvements
- **Investigation**: Debug complex issues
- **Documentation**: Generate comprehensive documentation

**Characteristics:**

- Autonomous decision-making and planning
- Can run terminal commands and tests
- Iterates on solutions until completion
- Best for complex, multi-step tasks

**Context Management:**

- Most context-intensive mode - monitor for context overload
- Give high-level goals and let agent plan the approach
- Monitor progress and provide feedback
- Consider breaking into phases if output quality degrades
- Watch for signs of hallucination or drift from requirements

### Choosing the Right Mode

| Task Type                     | Recommended Mode |
| ----------------------------- | ---------------- |
| Understanding existing code   | Ask              |
| Quick code review             | Ask              |
| Creating a single component   | Plan             |
| Implementing a feature        | Plan             |
| Multi-file refactoring        | Plan             |
| Complex feature with planning | Agent            |
| Performance optimization      | Agent            |
| Debugging complex issues      | Agent            |

### Best Practices by Mode

**Ask:**

- Keep questions focused and specific
- Reference specific files or components
- Use for learning and understanding
- Good for code review feedback

**Plan:**

- Provide clear, detailed requirements
- List all files that need changes
- Review proposed changes before accepting
- Use for coordinated multi-file work

**Agent:**

- Give high-level goals and constraints
- Let the agent plan the approach
- Monitor progress and provide feedback
- Use for complex, autonomous tasks

## Best Practices for Using Cursor

1. **Be Specific**: Provide clear, detailed requirements in your prompts.
2. **Use Context**: Keep relevant files open and use `@` references to provide context.
3. **Reference Patterns**: Point to existing code that demonstrates desired patterns with `@filename`.
4. **Plan Before Implementing**: For complex changes, create detailed plans in Ask mode first.
5. **Manage Context**: Keep tasks small and independently verifiable. Start fresh after 3-5 prompts.
6. **Iterate Thoughtfully**: Start simple and refine, but know when to start over with a better prompt.
7. **Review Everything**: Always review and test AI-generated code before committing.
8. **Follow Rules**: Trust the Cursor Rules to maintain code quality and consistency.
9. **Learn Continuously**: Use Cursor as a learning tool to understand the codebase better.
10. **Break Down Tasks**: Divide complex features into phases with fresh context per phase.

### Avoid Assumptions and Guesswork

```text
Ignore any assumptions and reason from facts only, don't guess missing information.
```

### Ask Specific Questions

Instead of vague requests, provide specific context and requirements:

- ❌ Bad:

  ```test
  Create a product component.
  ```

- ✅ Good:

  ```text
  Create a ProductCard component that displays product image, name, price, and add-to-cart button using Tailwind CSS and the Composition API
  ```

### Reference Existing Patterns

Point Cursor to existing code when asking for similar functionality:

- ❌ Bad - No Reference Point:

  ```text
  Create a composable for managing wishlist state.
  ```

- ✅ Good - Clear Reference to Existing Pattern:

  ```text
  Create a new useWishlist composable in app/composables/ that manages wishlist state.
  Follow the same pattern as useBasket() including:
  - State management with ref() for items array
  - Methods for add, remove, and clear operations
  - RPC method integration for API calls
  - Error handling and loading states
  - TypeScript types for wishlist items

  The composable should integrate with the existing wishlist RPC methods in rpcMethods/wishlist/.
  Use the same state persistence approach as the basket (session storage).
  ```

### Request Explanations

Ask Cursor to explain complex code or patterns:

- ❌ Bad - Too Broad:

  ```text
  How does this work?
  ```

- ✅ Good - Specific Questions:

  ```text
  Explain how the RPC method pattern works in this codebase, specifically:
  - How defineRpcHandler utility is used to create RPC methods
  - How session data is passed to RPC methods
  - How caching is implemented for RPC responses
  - How error handling is standardized across RPC methods

  Reference the implementation in rpcMethods/getProduct.ts as an example.
  ```

- ✅ Good - Contextual Comparison:

  ```text
  In the useProductFilters composable, I see both ref() and reactive() being used.
  Explain the difference between these two approaches in this specific context:
  - Why is ref() used for the loading state?
  - Why is reactive() used for the filters object?
  - What are the performance implications of each choice?
  - When should I use one over the other in similar scenarios?
  ```

### Iterative Refinement

Start with a basic implementation and refine iteratively:

- ❌ Bad - Everything at Once:

  ```text
  Create a complete product filter component with all features, accessibility, and tests.
  ```

- ✅ Good - Step-by-Step Approach:

  ```text
  Step 1: Create a basic SFProductFilters component in app/components/product/ that displays:
  - Category filter (checkboxes)
  - Price range filter (min/max inputs)
  - Apply and Clear buttons

  Use Tailwind CSS for styling. Accept a filters prop and emit filter-change events.
  ```

  Then after reviewing:

  ```text
  Step 2: Add price range validation to the SFProductFilters component:
  - Ensure min price is less than max price
  - Show validation error messages
  - Disable Apply button when validation fails

  Follow the validation pattern used in the basket promotion code input.
  ```

  Then after reviewing:

  ```text
  Step 3: Add accessibility attributes to SFProductFilters:
  - ARIA labels for all inputs
  - Keyboard navigation support (Tab, Enter, Escape)
  - Screen reader announcements for filter changes
  - Focus management when filters are applied

  Follow WCAG 2.1 AA standards and reference the accessibility patterns in SFSearchInput.
  ```

### Leverage Context

Cursor understands the files you have open. Open related files before asking questions:

- Open the component you're working on
- Open related composables or utilities
- Open test files when writing tests

### Code Review Assistance

Ask Cursor to review code for improvements:

- ❌ Bad - Generic Review Request:

  ```text
  Review this component.
  ```

- ✅ Good - Performance Review:

  ```text
  Review the SFProductGrid component (app/components/product/SFProductGrid.vue) for performance issues.
  Specifically check:
  - Are there unnecessary re-renders when product data updates?
  - Is the component properly using Vue 3 reactivity (ref vs reactive)?
  - Are computed properties used efficiently for derived state?
  - Should any child components use v-memo for optimization?
  - Are there any memory leaks (event listeners, timers not cleaned up)?

  The component renders 50+ product cards and users report lag when scrolling.
  Suggest specific optimizations following Vue 3 performance best practices.
  ```

- ✅ Good - Code Standards Review:

  ```text
  Review the imports in app/composables/useProductRecommendations.ts and check if they follow the project's import guidelines:
  - Are we importing from @scayle/storefront-nuxt instead of @scayle/storefront-core?
  - Are Nuxt composables imported from #app/composables/{name} instead of #imports?
  - Are type imports using "import type" for better tree-shaking?
  - Are imports grouped correctly (external, internal, relative)?
  - Are there any unused imports that should be removed?

  Reference the import guidelines in .cursor/rules/imports.mdc.
  ```

- ✅ Good - Accessibility Review:

  ```text
  Review the checkout form (app/components/checkout/SFCheckoutForm.vue) for accessibility improvements:
  - Are all form inputs properly labeled with <label> elements or aria-label?
  - Do error messages have proper ARIA attributes (aria-invalid, aria-describedby)?
  - Is keyboard navigation working correctly (Tab order, Enter to submit)?
  - Are validation errors announced to screen readers?
  - Does the form have proper focus management (focus on first error)?
  - Are required fields marked with aria-required?

  Follow WCAG 2.1 AA standards and reference the accessibility patterns in .cursor/rules/accessibility.mdc.
  Suggest specific improvements with code examples.
  ```

- ✅ Good - Security Review:

  ```text
  Review the user input handling in app/components/search/SFSearchInput.vue for security issues:
  - Is user input properly sanitized before being used in API calls?
  - Are there any XSS vulnerabilities in how search results are displayed?
  - Is the search query properly encoded for URL parameters?
  - Are API errors handled without exposing sensitive information?
  - Is rate limiting needed for search requests?

  Suggest specific security improvements following OWASP best practices.
  ```

---

## Common Use Cases

### Creating New Components

- ❌ Bad - Vague Requirements:

  ```text
  Create a product reviews component.
  ```

- ✅ Good - Detailed Specifications:

  ```text
  Create a SFProductReviews component in app/components/product/ that displays a list of product reviews. Each review should show:
  - Star rating (1-5 stars) using the existing SFRating component
  - Review title and text content
  - Reviewer name and date
  - Helpful/not helpful voting buttons

  Use Tailwind CSS for styling following the existing design system.
  The component should accept a productId prop and fetch reviews using the useProductReviews composable.
  Include loading and empty states. Follow the patterns used in SFProductDetails.vue.
  ```

### Implementing RPC Methods

- ❌ Bad - Missing Context:

  ```text
  Create an RPC method for product recommendations.
  ```

- ✅ Good - Complete Implementation with API Specs:

  ```text
  Create a new custom RPC method in rpcMethods/getFilteredProducts.ts that fetches products with filters.

  SCAYLE Storefront API Endpoint: GET /products
  Reference: https://scayle.dev/en/api-guides/storefront-api/resources/products/list-products

  Query Parameters:
  - with (optional): Include additional data (e.g., "variants", "attributes:legacy", "priceRange")
  - where[categoryId] (optional): Filter by category ID
  - where[brandId] (optional): Filter by brand ID
  - filters[color] (optional): Filter by color attribute
  - sort (optional): Sort order (e.g., "price:asc", "new")
  - page (optional): Page number for pagination
  - perPage (optional): Items per page (default: 100, max: 100)

  Expected Response Structure:
  {
    "entities": [
      {
        "id": 12345,
        "name": "Product Name",
        "isActive": true,
        "isSoldOut": false,
        "isNew": true,
        "images": [
          {
            "hash": "image-hash",
            "attributes": { "imageType": "model" }
          }
        ],
        "priceRange": {
          "min": { "withTax": 9999, "withoutTax": 8403, "currencyCode": "EUR" },
          "max": { "withTax": 9999, "withoutTax": 8403, "currencyCode": "EUR" }
        },
        "attributes": {
          "brand": { "id": 1, "label": "Brand Name" }
        }
      }
    ],
    "pagination": {
      "current": 1,
      "total": 10,
      "perPage": 100,
      "page": 1,
      "first": 1,
      "last": 10
    }
  }

  The RPC method should:
  - Accept parameters: categoryId, brandId, filters (color, size), sort, page, perPage
  - Default perPage to 10 items for optimal performance (max: 100 per API limits)
  - Use the SCAYLE Storefront API SDK from @scayle/storefront-nuxt
  - Call the products.get() method with proper query parameters
  - Return typed ProductsResponse with entities and pagination
  - Include proper error handling for 400 (invalid parameters) and 500 (server error)
  - Implement caching with 5 minutes TTL using the storage driver from RpcContext
  - Use TypeScript types from @scayle/storefront-nuxt/types

  Implementation requirements:
  - Use defineRpcHandler utility from @scayle/storefront-nuxt
  - Access SAPI client via context.storefrontApiClient
  - Implement proper JSDoc comments with @param and @returns tags
  - Handle pagination metadata in the response
  - Follow the RPC method patterns from @scayle/storefront-nuxt package
  - Reference .cursor/rules/rpc-methods.mdc for implementation guidelines

  Note: RPC methods from @scayle/storefront-nuxt are reference implementations.
  Custom RPC methods should be placed in the local rpcMethods/ directory.
  See SCAYLE Storefront API documentation for complete parameter details.
  ```

### Writing Unit Tests

- ❌ Bad - No Specific Target:

  ```text
  Write tests for the basket functionality.
  ```

- ❌ Bad - Too Vague (Will Generate Too Many Tests):

  ```text
  Write comprehensive tests for the useProductFilters composable covering all edge cases.
  ```

- ✅ Good - Explicit Test Cases to Avoid Bloat:

  ```text
  Write unit tests for the useProductFilters composable in app/composables/useProductFilters.ts.

  Test ONLY these SPECIFIC cases:
  1) Setting category filter updates URL query params correctly
  2) Setting price range with min > max shows validation error
  3) Clearing all filters resets state to default values
  4) Multiple filters applied simultaneously - verify combined query object

  Use Vitest and Fishery factories from @scayle/storefront-nuxt/test/factories
  Follow assertion patterns in @app/composables/useWishlist.test.ts
  Mock the router using vi.mock('#app/composables/router')

  DO NOT generate tests for all parameter permutations.
  DO NOT test individual utility functions if they have their own test files.
  ONLY test the 4 cases listed above.
  ```

- ✅ Good - Targeted Test Requirements:

  ```text
  Create unit tests for the useBasket composable in app/composables/useBasket.ts.

  Test these SPECIFIC cases:
  1) Adding item to empty basket - verify API call and state update
  2) Removing item from basket - verify item count decreases
  3) Updating quantity to 0 - verify item is removed
  4) API error during add - verify error state and user-facing message
  5) Calculating total with promotion code applied - verify discount calculation

  Use Vitest and Fishery test data factories from @scayle/storefront-nuxt/test/factories
  Follow the test structure pattern in @app/composables/useWishlist.test.ts
  Mock RPC calls using vi.mock() and verify proper error handling

  DO NOT test all combinations of quantities and products.
  Focus on the 5 specific cases above.
  ```

- ✅ Good - Extending Existing Tests:

  ```text
  Extend the existing unit tests in test/composables/useProductFilters.test.ts to
  cover the new price range filter functionality.

  Add ONLY these test cases:
  1) Setting min/max price values updates filter state
  2) Validating that min is less than max
  3) Clearing price filters while keeping other filters active
  4) Combining price filters with category filter - verify query object

  Use the existing test data factories and follow the AAA (Arrange-Act-Assert) pattern.
  Avoid redundant tests if the utility functions are already covered in their own test files.
  ```

### Refactoring Code

- ❌ Bad - No Context or Goals:

  ```text
  Refactor this component.
  ```

- ✅ Good - Clear Refactoring Objectives:

  ```text
  Refactor the SFProductCard component (app/components/product/SFProductCard.vue)
  to use the Composition API instead of Options API.
  Extract the following reusable logic into composables:
  - Product price formatting → useProductPrice composable
  - Wishlist add/remove functionality → useWishlist composable (already exists, integrate it)
  - Product availability checking → useProductAvailability composable

  Maintain the same props interface and emitted events to avoid breaking existing usage.
  Use ref() for reactive state and computed() for derived values.
  Follow the patterns used in SFProductDetails.vue.
  Ensure all TypeScript types are properly defined.
  ```

- ✅ Good - Performance Optimization:

  ```text
  Refactor the product listing component (app/pages/c/[...categories]/[...slug]-[id].vue)
  to improve performance with large product lists (100+ items).
  Current issues:
  - Entire grid re-renders when filters change
  - Images load eagerly causing slow initial render
  - Filter state causes unnecessary reactivity

  Implement these optimizations:
  - Use v-memo on product cards to prevent unnecessary re-renders
  - Add lazy loading for product images using the loading="lazy" attribute
  - Optimize filter reactivity using shallowRef where appropriate
  - Consider virtualizing the product grid if more than 50 products

  Follow Vue 3 performance best practices and maintain existing functionality.
  Test with 100+ products to verify improvements.
  ```

### Adding Translations

- ❌ Bad - Unclear Scope:

```text
Add German translations.
```

- ✅ Good - Specific Translation Scope:

  ```text
  Add German (de-DE) translations for the product detail page. Translate the following keys in i18n/locales/de-DE.json:
  - Product details section (product.details.*)
  - Size and color selection labels
  - Add to cart button and messages
  - Shipping and return information
  - Product specifications table headers

  Follow the existing translation structure and formatting used in the English (en-GB) locale file.
  Use formal German ("Sie" form) consistent with the rest of the translations.
  Include proper formatting for currency (€) and measurements (cm, kg).
  Reference the existing translations in i18n/locales/en-GB.json for the complete key structure.
  ```

- ✅ Good - Adding New Translation Keys:

  ```text
  Add new translation keys for the recently implemented promotion code feature in the basket.
  Add translations for all configured locales (en-GB, de-DE, fr-FR):
  - Promotion code input placeholder
  - Apply button text
  - Success message when code is applied
  - Error messages (invalid code, expired code, minimum order value not met)
  - Remove promotion code button

  Place the keys under basket.promotionCode.* following the existing i18n structure.
  Use the same tone and style as existing basket translations.
  Include proper pluralization rules where needed (e.g., "1 item" vs "2 items").
  ```

### Debugging Issues

- ❌ Bad - Too Generic:

  ```text
  This component isn't rendering correctly. Identify the issue and suggest a fix.
  ```

- ✅ Good - Specific Problem Description:

  ```text
  The SFProductCard component shows the product image and name correctly,
  but the price is displaying as "undefined" even though the product data includes a price object.
  The price should display formatted with currency symbol.
  Identify why the price isn't rendering and suggest a fix following the project's price formatting patterns.
  ```

- ✅ Good - With Context and Expected Behavior:

  ```text
  In the basket page, the promotion code input field is not showing validation errors when an invalid code is entered.
  The API returns a 400 error with error details, but the error message doesn't appear below the input field.
  Other form fields in the project show validation errors correctly.
  Identify why the error state isn't being displayed and implement proper error handling following the existing form validation patterns.
  ```

- ✅ Good - Performance Issue:

  ```text
  The product listing page (c/[...categories]/[...slug]-[id].vue) is re-rendering
  the entire product grid every time a filter is applied, causing noticeable lag with 50+ products.
  The filter state is managed in a reactive object.
  Identify the cause of unnecessary re-renders and optimize the component to only update affected products,
  following Vue 3 performance best practices.
  ```

---

## Tips for Maximum Productivity

### 1. Use Cursor's Chat Feature

- Press `Cmd+L` (macOS) or `Ctrl+L` (Windows/Linux) to open the chat panel.
- Ask questions about the codebase, request code generation, or get explanations.

### 2. Use Cursor's Inline Edit

- Press `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux) to edit code inline.
- Select code and ask Cursor to refactor, improve, or fix it.

### 3. Use Cursor's Codebase Search

- Press `Cmd+Shift+F` (macOS) or `Ctrl+Shift+F` (Windows/Linux) to search the codebase.
- Ask Cursor to find examples of specific patterns or implementations.

### 4. Use @ File References Effectively

Cursor's `@` reference system is powerful for providing precise context:

**Reference Specific Files:**

```text
@app/composables/useBasket.ts Explain how basket state is managed in this composable
```

**Reference Multiple Files for Pattern Context:**

```text
Create a new useWishlist composable following these patterns:

@app/composables/useBasket.ts (for state management)
@app/composables/useProductFilters.ts (for API integration)
```

**Reference Folders for Broader Context:**

```text
@app/components/product/ Review all product components for consistent prop naming
```

**Reference Cursor Rules:**

```text
@.cursor/rules/vue-components.mdc Create a new product card component following these guidelines
```

**Reference Plan Files Across Phases:**

```text
@CHECKOUT_PLAN.md Implement Phase 2: Payment integration
```

**Combine Multiple References:**

```text
Create a new promotion banner component:

@app/components/basket/SFBasketPromotionCode.vue (for similar pattern)
@.cursor/rules/vue-components.mdc (for component guidelines)
@.cursor/rules/accessibility.mdc (for a11y requirements)
```

**Best Practices for @ References:**

- Use specific file paths, not wildcards
- Reference pattern files when asking for similar functionality
- Combine with indexed docs using `@Docs` when available
- Reference plan files to maintain continuity across chat sessions

### 5. Reference Documentation with @Docs

If you've indexed documentation (see [Getting Started](#getting-started-with-cursor)),
you can reference it using `@Docs` in the Cursor chat:

```text
@Docs Using the SCAYLE Storefront API documentation, show me how to implement product filtering
```

Or combine with file references:

```text
@Docs @app/composables/useProductFilters.ts

Based on SCAYLE documentation, is this filter implementation following best practices?
```

**Tip:** The `@Docs` feature allows Cursor to search through indexed documentation.
Combine this with `@filename` references for the most effective assistance.

### 6. Maintain Context

Keep relevant files open in tabs to provide Cursor with better context for your questions.

### 7. Follow the Rules

The Cursor Rules in `.cursor/rules/` are designed to maintain code quality and consistency.
Trust the AI's suggestions when they reference these rules.

### 8. Verify Generated Code

Always review AI-generated code before committing:

- Check that imports are correct
- Verify TypeScript types are accurate
- Ensure Tailwind classes are appropriate
- Test the functionality works as expected

### 9. Learn from the AI

Use Cursor as a learning tool to understand patterns and best practices used in the codebase.

---

## Common Pitfalls to Avoid

### Don't

- Accept code without reviewing it for correctness and style.
- Ask Cursor to generate entire features without breaking them into smaller tasks.
- Ignore linter errors or TypeScript warnings in generated code.
- Use generated code that doesn't follow the project's established patterns.
- Forget to test AI-generated code thoroughly.
- Continue iterating on a bad start - recognize when to reset.
- Let Cursor decide test cases - explicitly specify which cases to test.
- Keep adding context indefinitely - start fresh after 3-5 prompts.

### Do

- Break large tasks into smaller, manageable pieces.
- Review and understand all generated code before using it.
- Ask follow-up questions if something is unclear.
- Reference existing patterns and components when requesting new code with `@filename`.
- Use Cursor's suggestions as a starting point and refine as needed.
- Start fresh with a refined prompt if first output is off-track.
- Explicitly list test cases to avoid test bloat.
- Create plans for complex changes before implementing.

## Managing Context for Complex Changes

Effective context management is crucial for maintaining output quality. Know when to iterate, when to reset, and when to use Plan Mode for complex features.

### Context Overload: When to Start Fresh

**Signs to Start a New Chat:**

- Responses drift from requirements or ignore Cursor Rules
- Hallucinations, contradictions, or degrading output quality
- After 3-5 prompts on same topic or 2-3 failed refinement attempts
- When switching to unrelated tasks

**Iterate When:** Good foundation, measurable progress, minor refinements needed

**Reset When:** Off-track responses, wrong patterns, no improvement after 2-3 attempts

**Reset Strategy:** Analyze what went wrong → Start fresh chat → Add `@` file references → Be more specific

**Example:**

❌ `Create a product comparison feature.`

✅ `Create a product comparison feature for SCAYLE Storefront. Display up to 4 products side-by-side with images, names, prices. Persist in session storage. Reference: @app/composables/useWishlist.ts @.cursor/rules/vue-components.mdc`

### Using Plan Mode for Large Features

Cursor's [Plan Mode](https://docs.cursor.com/agent/planning) autonomously researches your codebase and creates structured to-do lists for multi-step tasks.

**Activation:** Press `Shift + Tab` or let Cursor suggest it for complex tasks

**How It Works:**

1. Researches codebase and finds relevant files
2. Reviews indexed docs and Cursor Rules
3. Asks clarifying questions
4. Generates Markdown to-do list with file references

**Working with Plans:**

- Edit the generated plan directly (Markdown with checkboxes)
- Save optionally: `Save this plan as FEATURE_PLAN.md`
- Review each change before accepting
- Note: Manual edits to saved files may not sync—start fresh Plan Mode session if needed

**Best Practices:**

1. **Clear Goals**: ✅ "Add product comparison with side-by-side display and session persistence" ❌ "Add comparison"
2. **Reference Patterns**: Use `@app/composables/useWishlist.ts` to help Cursor find relevant code
3. **Review First**: Edit to-dos to match project conventions before execution
4. **Phase Large Features**: Execute Phase 1 → Review → Fresh Plan Mode for Phase 2

**SCAYLE Example:**

```text
Implement multi-step checkout flow for SCAYLE Storefront.

Requirements:
- 4 steps: Shipping, Payment, Review, Confirmation
- Form validation, basket integration, progress indicator
- WCAG 2.1 AA compliance

Reference:
@app/composables/useBasket.ts
@.cursor/rules/vue-components.mdc
@.cursor/rules/accessibility.mdc
```

**Continuing Across Sessions:**

```text
Continuing product comparison implementation.
Completed: ✅ Component ✅ Composable
Current: Add unit tests

@PRODUCT_COMPARISON_PLAN.md
@app/composables/useWishlist.test.ts
```

**Troubleshooting:**

- **Not activating**: Update Cursor, press `Shift + Tab`, check Agent mode enabled
- **To-dos not updating**: Restart Cursor or start fresh Plan Mode session
- **Edits not syncing**: Edit in Plan Mode interface, not saved `.md` files

---

## Troubleshooting

### Cursor isn't following the project rules

**Problem:** Generated code doesn't match project conventions or patterns.

**Solutions:**

- Verify the `.cursor/rules/` directory exists and contains the rule files.
- Restart Cursor to reload the rules.
- Explicitly reference the rule file in your prompt using `@.cursor/rules/vue-components.mdc`.
- Use `@` to reference existing code that follows the correct pattern.

### Generated code has errors

**Problem:** AI-generated code contains TypeScript errors, linting issues, or runtime errors.

**Solutions:**

- Provide more context about the specific requirements.
- Use `@filename` to reference existing working examples in your prompt.
- Ask Cursor to fix the specific error you're encountering.
- Break down complex requests into smaller, more manageable tasks.
- If errors persist after 2-3 attempts, start fresh with a refined prompt.

### AI suggestions don't match the project style

**Problem:** Generated code uses different patterns or conventions than the rest of the codebase.

**Solutions:**

- Reference the specific Cursor Rule file using `@.cursor/rules/imports.mdc`.
- Use `@filename` to point to existing code that demonstrates the desired pattern.
- Provide explicit style requirements in your request.
- Open related files to provide better context for the AI.

### Cursor isn't producing good outputs

**Problem:** Code doesn't match expectations or follow patterns despite clear prompts.

**Solutions:**

- Add more context with `@` file references to pattern examples.
- Reference Cursor Rules explicitly: `@.cursor/rules/rpc-methods.mdc`.
- Break into smaller, clearer tasks with specific requirements.
- Start fresh chat with refined prompt instead of continuing to iterate.
- Verify you're using the right chat mode (Ask, Plan, or Agent) for the task.

### Too many test cases generated

**Problem:** LLM generates unnecessary permutation tests, creating test bloat.

**Solutions:**

- Explicitly list exact test cases in your prompt: "Test ONLY these 4 cases: 1) ... 2) ... 3) ... 4) ..."
- Add instruction: "DO NOT test all permutations of parameters."
- Specify: "ONLY test the N cases listed above."
- Use `@` to reference existing test file for assertion patterns: `@app/composables/useWishlist.test.ts`.

### Context seems too large / responses degrading

**Problem:** Hallucinations, off-script responses, or quality degradation after multiple prompts.

**Solutions:**

- Start fresh chat after 3-5 prompts, especially for unrelated tasks.
- Summarize previous work when starting new chat if needed.
- Break large changes into phases with fresh context per phase.
- Use `@` to reference plan files to maintain continuity: `@FEATURE_PLAN.md`.
- Close unnecessary open files to reduce context size.

### Cursor is slow or unresponsive

**Problem:** Long wait times for responses or the editor becomes sluggish.

**Solutions:**

- Close unnecessary files and tabs to reduce context size.
- Break large requests into smaller, focused questions.
- Restart Cursor if performance issues persist.
- Check your internet connection if using cloud-based features.
- Consider switching to Ask mode for simpler queries instead of Agent mode.

---

By following these guidelines and best practices, you'll be able to leverage Cursor AI effectively
to accelerate your development workflow while maintaining high code quality and
consistency with the SCAYLE Storefront Application's established patterns.
