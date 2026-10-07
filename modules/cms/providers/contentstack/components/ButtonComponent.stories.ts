import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { ButtonComponent as ButtonComponentType } from '../types/gen/contentstack'
import Button from './ButtonComponent.vue'

/**
 * Contentstack Button component renders interactive button elements from Contentstack CMS data.
 * It supports multiple visual styles and can function as both action buttons and navigation links.
 *
 * Key features:
 * - Multiple button variants (primary, secondary, tertiary/outline, accent)
 * - URL navigation
 * - Contentstack field-based data structure (text, style, url)
 * - Automatic route localization for internal links
 */
interface ButtonStoryArgs {
  text: string
  style: 'primary' | 'secondary' | 'outline' | 'accent'
  url: string
  openInNewTab: boolean
}

const createContentElement = (
  text: string,
  style: 'primary' | 'secondary' | 'outline' | 'accent' = 'primary',
  url = '/example-page',
  openInNewTab = false,
): ButtonComponentType =>
  ({
    uid: 'button-1',
    _content_type_uid: 'button-component',
    text,
    style,
    url,
    open_in_new_tab: openInNewTab,
    $: undefined,
  }) as unknown as ButtonComponentType

const meta = {
  title: 'CMS Contentstack/Button',
  component: Button,
  argTypes: {
    text: {
      control: 'text',
      description: 'Button text content',
      name: 'contentElement.text',
    },
    style: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'accent'],
      description: 'Visual style variant of the button',
      name: 'contentElement.style',
    },
    url: {
      control: 'text',
      description: 'URL for the button link',
      name: 'contentElement.url',
    },
    openInNewTab: {
      control: 'boolean',
      description: 'Whether to open the link in a new tab',
      name: 'contentElement.open_in_new_tab',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <ButtonComponent :contentElement="contentElement" />
          </template>
        `,
      },
    },
  },
  render: (args: ButtonStoryArgs) => {
    return {
      components: { Button },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.text,
            args.style,
            args.url,
            args.openInNewTab,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `
        <Button :contentElement="contentElement" />
      `,
    }
  },
}

export default meta
type Story = StoryObj<ButtonStoryArgs>

/**
 * Primary button for main call-to-action
 */
export const Primary: Story = {
  args: {
    text: 'Primary Button',
    style: 'primary',
    url: '/example-page',
    openInNewTab: false,
  },
}

/**
 * Secondary button for supporting actions
 */
export const Secondary: Story = {
  args: {
    text: 'Secondary Button',
    style: 'secondary',
    url: '/example-page',
    openInNewTab: false,
  },
}

/**
 * Outline/tertiary button with transparent background
 */
export const Outline: Story = {
  args: {
    text: 'Outline Button',
    style: 'outline',
    url: '/example-page',
    openInNewTab: false,
  },
}

/**
 * Accent button for special emphasis
 */
export const Accent: Story = {
  args: {
    text: 'Accent Button',
    style: 'accent',
    url: '/example-page',
    openInNewTab: false,
  },
}

/**
 * Button opening in new tab
 */
export const NewTab: Story = {
  args: {
    text: 'Open in New Tab',
    style: 'primary',
    url: 'https://example.com',
    openInNewTab: true,
  },
}
