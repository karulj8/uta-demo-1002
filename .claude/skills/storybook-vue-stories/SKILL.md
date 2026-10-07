---
name: storybook-vue-stories
description: Creates and updates Storybook stories for Vue components in Storefront Application V2 (Nuxt), following file structure, meta and JSDoc, story naming and variants, args and argTypes, render functions, play functions, and factory conventions. Use when creating or editing .stories.ts files or when asked to add or update a Storybook story.
---

# Storybook Story Guidelines for Vue Components (Nuxt)

## Framework and Imports

- **Framework:** Storybook with Nuxt via `@storybook-vue/nuxt`
- **Types:** Import `Meta`, `StoryObj`, `ComponentPropsAndSlots` from `@storybook-vue/nuxt`
- **Test utilities:** Use `@storybook/test` for `userEvent`, `within`, and `fn()` for action mocks
- **Testing:** Play functions should demonstrate meaningful interactions

## File Structure and Naming

- Place each component's stories file (`.stories.ts`) next to the component file for easy discoverability
- Use the component's name as the story file name (e.g., `SFButton.vue` → `SFButton.stories.ts`)
- Use TypeScript (`.stories.ts`) for all story files
- Import types from `@storybook-vue/nuxt`: `Meta`, `StoryObj`, `ComponentPropsAndSlots`

## Meta Definition and Documentation

- Create the story meta using the `Meta` type
- Optionally use `satisfies Meta<typeof ComponentName>` on the default export for type safety (not required, but recommended)
- Add a comprehensive JSDoc comment directly above the `export default` meta definition
- The JSDoc should describe:
  - The component's purpose and primary use cases
  - Key features and capabilities
  - Notable behaviors or implementation details
  - Usage context and examples when helpful
- Add JSDoc comments above individual story exports to explain what each story demonstrates
- Story JSDoc should describe the specific scenario, state, or use case being shown
- Use the `title` property to organize stories under clear categories (e.g., `"Base Components/SFButton"`, `"Product/SFProductCard"`)

## Component Props Documentation

- Document each prop with JSDoc directly inside the `defineProps` block in the component file (following the `SFButton` style)
- JSDoc comments should explain the prop's purpose, behavior, and usage context
- Props are documented in the component file, not in the story file
- If a prop comment doesn't add information beyond the prop name, omit it

## Story Naming and Organization

- Name stories clearly to reflect the state, variant, or use case they represent
- Use PascalCase for story names (e.g., `Primary`, `WithIcon`, `Loading`, `MultipleImages`, `ButtonWithAppendedIcon`)
- Simple names like `Default` are acceptable when they represent the most common or basic usage
- Use descriptive names that indicate the story's purpose
- Names should be self-explanatory and help developers quickly understand what the story demonstrates

## Story Variants - When to Add Them

- **Only add story variants** if they show meaningful visual or functional differences based on real-world use cases
- Examples of good variants:
  - A `PromotionCard` with types like `"discount"`, `"bonus"`, or `"expired"` that display different layouts or visuals
  - A `TabNavigation` with selected/unselected states showing different behaviors
  - A `SFButton` with different variants (Primary, Secondary, Raw) that have distinct visual styles
  - A `SFProductCard` with different states (Sale, Campaign, Promotions) that show different badges or pricing
- Do not add variants that cannot be visually or functionally distinguished in Storybook
- Do not create variants for prop toggles that don't result in UI changes
- Each story should showcase a single, clear use case or state of the component

## Args and Default Values

- Use the `args` property to define default props for each story
- Provide realistic, meaningful default values that demonstrate the component's behavior
- For complex objects (like products), use factory functions (e.g., `productFactory.build()`) to create test data
- Use TypeScript type assertions when necessary (e.g., `as CentAmount`, `as CampaignType`)

## ArgTypes Configuration

- Configure `argTypes` in the meta definition to improve Storybook controls and documentation
- Define `argTypes` manually when:
  - A prop accepts a fixed set of values (use `control: { type: 'select' }` or `control: 'select'` with `options`)
  - The automatically generated controls don't match the intended usage
  - You want to provide better descriptions for complex props
- Both `control: { type: 'select' }` (object notation) and `control: 'select'` (string) are valid; use consistently within a file
- Use `options: Object.values(EnumType)` for enum props
- Add `description` fields to argTypes for props that need additional context
- For event handlers, use `action: 'event-name'` with descriptive `description` fields
- For CMS components with complex data structures, you may need custom interfaces and argTypes that map to nested properties

## Render Functions

- Use the `render` function in the meta definition to provide a consistent template wrapper for all stories
- Use `ComponentPropsAndSlots<typeof ComponentName>` for type safety in render functions
- The render function should use Vue's Composition API `setup()` pattern
- Include necessary wrapper elements or classes for proper visual presentation (e.g., container classes, spacing)
- For stories that need custom templates (e.g., slots, complex layouts, multiple components), override the `render` function in individual stories
- When overriding render in a story, use `satisfies Meta<typeof ComponentName>` for type safety
- Use `ref()` from Vue when you need reactive state in render functions (e.g., for `v-model` bindings)
- For CMS components, you may need computed properties to transform args into the expected component props

## TypeScript Usage

- Optionally use `satisfies Meta<typeof ComponentName>` on the default export (recommended but not required)
- Use `satisfies Meta<typeof ComponentName>` on individual story exports that have custom render functions
- Define `type Story = StoryObj<typeof ComponentName>` for story type annotations when you have multiple stories (optional but recommended for consistency)
- Use explicit type annotations for story exports: `export const StoryName: Story` or `export const StoryName: StoryObj<typeof ComponentName>`
- For CMS components with custom data structures, define custom interfaces (e.g., `ButtonStoryArgs`) and use `StoryObj<CustomInterface>`
- Leverage TypeScript's type inference where possible, but be explicit for complex types

## Interactive Stories and Play Functions

- Use `play` functions from `@storybook/test` for interactive demonstrations
- Import `userEvent` and `within` from `@storybook/test` for user interaction testing
- Play functions should demonstrate meaningful interactions (e.g., hovering, clicking, form interactions)
- Use play functions to show component behavior that requires user interaction to observe

## Accessibility

- Accessibility checking is enabled by default in Storybook
- Ensure components are accessible by:
  - Providing proper ARIA labels in test data
  - Testing with screen readers when possible
  - Following accessibility best practices in component implementation
- Use the accessibility tab in Storybook to verify component accessibility

## Complex Data and Factories

- For components requiring complex data structures (products, prices, campaigns), use factory functions
- Import factories from `@scayle/storefront-nuxt/dist/test/factories` (e.g., `productFactory`, `priceFactory`)
- Create reusable test data objects at the module level for stories that share similar data
- Use object spread syntax to create variations of base test data

## Best Practices

- Keep stories focused; each story should demonstrate one clear use case or state
- Update stories and documentation whenever the component's API or design changes
- Remove outdated stories and add new ones for new features or variants
- Use meaningful, realistic test data that represents actual usage scenarios
- Group related stories together logically
- Add JSDoc comments above story exports to explain what each story demonstrates
- For stories with complex render functions or multiple components, add JSDoc to explain the setup
- Create reusable test data objects at the module level when multiple stories share similar data
- Use factory functions for complex data structures to keep stories maintainable
