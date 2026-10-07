import type { Meta } from '@storybook-vue/nuxt'
import { useNuxtApp } from '#app'

/**
 * Icon Library
 *
 * This story displays all available icons in the application.
 * Icons are auto-imported from the `app/assets/icons` directory and are available
 * as Vue components with the `Icon` prefix.
 *
 * Icon naming convention:
 * - Path: `input/hide-password.svg` → Component: `<IconInputHidePassword />`
 * - Path: `empty-basket.svg` → Component: `<IconEmptyBasket />`
 */
export default {
  title: 'Assets/Icons',
  parameters: {
    docs: {
      description: {
        component:
          'All available icons in the application. Icons are auto-imported and can be used directly as Vue components.',
      },
    },
  },
} satisfies Meta

export const AllIcons = {
  render: () => ({
    setup() {
      const nuxtApp = useNuxtApp()
      const vueApp = nuxtApp.vueApp

      const groups = [
        'availability',
        'checkmark',
        'commerce',
        'increment',
        'input',
        'logo',
        'navigation',
        'notify',
        'payment',
        'user',
        'utility',
      ]

      const allComponents = Object.keys(
        vueApp._context?.components || {},
      ).filter((component) => component.startsWith('Icon'))

      // Create a lowercase set of group names for easy comparison
      const groupSet = new Set(groups.map((g) => g.toLowerCase()))

      // Sort components into a group-to-component-list mapping
      const componentsByGroup: Record<string, string[]> = {}

      for (const group of groups) {
        componentsByGroup[group] = []
      }
      componentsByGroup['other'] = []

      for (const component of allComponents) {
        // Extract the group: IconAvailabilityCheck → 'availability'
        const match = component.match(/^Icon([A-Z][a-z]*)/)
        const groupName = match && match[1] ? match[1].toLowerCase() : undefined

        if (groupName && groupSet.has(groupName)) {
          componentsByGroup[groupName]?.push(component)
        } else {
          componentsByGroup['other'].push(component)
        }
      }

      return {
        componentsByGroup,
      }
    },
    template: `
      <div>
        <div v-for="(components, group) in componentsByGroup" :key="group" class="mb-8">
          <h3 class="text-lg font-semibold mb-3 capitalize">
            {{ group }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div
              v-for="component in components"
              :key="component"
              class="flex flex-col items-center justify-center border-2 border-gray-200 rounded-lg p-4 shrink-0"
            >
              <component :is="component" class="size-8 mb-2" />
              <code class="text-sm text-gray-500">&lt;{{ component }} /&gt;</code>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
} satisfies Meta
