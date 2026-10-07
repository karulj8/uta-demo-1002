import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { LinkComponent as LinkComponentType } from '../types/gen'
import LinkComponent from './LinkComponent.vue'

/**
 * Amplience Link component wraps text or image content in a navigation link.
 * It supports internal and external URLs and can open in a new tab.
 */
interface LinkStoryArgs {
  urlType: 'internal' | 'external'
  link: string
  openInNewTab: boolean
  content: LinkComponentType['content']
}

const createContentElement = (
  urlType: 'internal' | 'external' = 'internal',
  link: string = '/example-page',
  openInNewTab: boolean = false,
  content: LinkComponentType['content'] = [],
): LinkComponentType =>
  ({
    url_type: urlType,
    link,
    open_in_new_tab: openInNewTab,
    content,
  }) as unknown as LinkComponentType

const meta = {
  title: 'CMS Amplience/Link',
  component: LinkComponent,
  argTypes: {
    urlType: {
      control: 'select',
      options: ['internal', 'external'],
      description: 'Whether the destination is internal or external',
      name: 'contentElement.url_type',
    },
    link: {
      control: 'text',
      description: 'URL for the link',
      name: 'contentElement.link',
    },
    openInNewTab: {
      control: 'boolean',
      description: 'Whether to open the link in a new tab',
      name: 'contentElement.open_in_new_tab',
    },
    content: {
      control: 'object',
      description: 'Content block displayed inside the link',
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
          createContentElement(
            args.urlType,
            args.link,
            args.openInNewTab,
            args.content,
          ),
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

const mockTextContent = [
  {
    componentType: 'text',
    text: {
      content: 'Clickable Link Text',
      textType: 'p',
    },
  },
] as unknown as LinkComponentType['content']

/**
 * Basic internal link with text content
 */
export const Default: Story = {
  args: {
    urlType: 'internal',
    link: '/example-page',
    openInNewTab: false,
    content: mockTextContent,
  },
}

/**
 * External link opening in a new tab
 */
export const ExternalNewTab: Story = {
  args: {
    urlType: 'external',
    link: 'https://example.com',
    openInNewTab: true,
    content: [
      {
        componentType: 'text',
        text: {
          content: 'External Link (New Tab)',
          textType: 'p',
        },
      },
    ] as unknown as LinkComponentType['content'],
  },
}
