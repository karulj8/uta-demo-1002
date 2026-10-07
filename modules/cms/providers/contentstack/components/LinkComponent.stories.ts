import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  LinkComponent as LinkComponentType,
  TextComponent as TextComponentType,
} from '../types/gen/contentstack'
import LinkComponent from './LinkComponent.vue'

/**
 * Contentstack Link component renders a navigation link wrapper around content.
 * It supports internal and external URLs and can be configured to open in a new tab.
 */
interface LinkStoryArgs {
  url: string
  openInNewTab: boolean
  content: LinkComponentType['content']
}

const createContentElement = (
  url: string = '/example-page',
  openInNewTab: boolean = false,
  content: LinkComponentType['content'] = [],
): LinkComponentType =>
  ({
    uid: 'link-1',
    _content_type_uid: 'link-component',
    url,
    open_in_new_tab: openInNewTab,
    content,
    $: undefined,
  }) as unknown as LinkComponentType

const meta = {
  title: 'CMS Contentstack/Link',
  component: LinkComponent,
  argTypes: {
    url: {
      control: 'text',
      description: 'URL for the link',
      name: 'contentElement.url',
    },
    openInNewTab: {
      control: 'boolean',
      description: 'Whether to open the link in a new tab',
      name: 'contentElement.open_in_new_tab',
    },
    content: {
      control: 'object',
      description: 'Array of content items to display inside the link',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <LinkComponent :contentElement="contentElement" />
          </template>
        `,
      },
    },
  },
  render: (args: LinkStoryArgs) => {
    return {
      components: { LinkComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(args.url, args.openInNewTab, args.content),
        )
        return {
          contentElement,
        }
      },
      template: `
        <LinkComponent :contentElement="contentElement" />
      `,
    }
  },
}

export default meta
type Story = StoryObj<LinkStoryArgs>

const mockTextContent = {
  uid: 'text-1',
  _content_type_uid: 'text-component',
  component: 'TextComponent',
  content: 'Clickable Link Text',
  text_type: 'p',
  $: undefined,
} as unknown as TextComponentType

/**
 * Basic link with text content
 */
export const Default: Story = {
  args: {
    url: '/example-page',
    openInNewTab: false,
    content: [mockTextContent],
  },
}

/**
 * External link opening in new tab
 */
export const ExternalNewTab: Story = {
  args: {
    url: 'https://example.com',
    openInNewTab: true,
    content: [
      {
        ...mockTextContent,
        content: 'External Link (New Tab)',
      } as unknown as TextComponentType,
    ],
  },
}
