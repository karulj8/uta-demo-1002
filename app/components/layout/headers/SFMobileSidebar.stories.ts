import type { StoryObj, ComponentPropsAndSlots } from '@storybook-vue/nuxt'
import {
  navigationItemCategoryFactory,
  navigationItemPageFactory,
} from '@scayle/storefront-nuxt/test/factories'
import type { NavigationV2TreeItem } from '@scayle/storefront-nuxt'
import SFMobileSidebar from './SFMobileSidebar.vue'

/**
 * SFMobileSidebar provides a mobile navigation sidebar with search, navigation items,
 * and additional features like store locator and shop switcher.
 */
export default {
  title: 'Layout/SFMobileSidebar',
  component: SFMobileSidebar,
  render: (args: ComponentPropsAndSlots<typeof SFMobileSidebar>) => ({
    components: { SFMobileSidebar },
    setup() {
      return { args }
    },
    template: `
      <div class="w-full max-w-md h-96 overflow-y-auto border border-gray-200 rounded-lg p-6">
        <SFMobileSidebar v-bind="args" />
      </div>
    `,
  }),
}

type Story = StoryObj<typeof SFMobileSidebar>

const rootA: NavigationV2TreeItem = navigationItemCategoryFactory.build({
  name: 'Women',
}) as unknown as NavigationV2TreeItem
const rootB: NavigationV2TreeItem = navigationItemCategoryFactory.build({
  name: 'Men',
}) as unknown as NavigationV2TreeItem

rootA.children = [
  navigationItemPageFactory.build({
    name: 'New In',
  }) as unknown as NavigationV2TreeItem,
  navigationItemPageFactory.build({
    name: 'Clothing',
  }) as unknown as NavigationV2TreeItem,
]

/**
 * Shows the mobile sidebar with navigation items and search functionality.
 * Displays the complete mobile navigation interface with all features.
 */
export const Default: Story = {
  args: {
    isOpen: true,
    navigationItems: [rootA, rootB],
  },
}
