import { computed, toRaw } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { RichtextComponent as RichtextComponentType } from '../types/gen/contentstack'
import RichText from './RichTextComponent.vue'

/**
 * Contentstack Rich Text component renders rich text content with custom styling for headings, lists, and links.
 * It uses the Contentstack Utils JSON to HTML converter.
 *
 * Key features:
 * - Custom heading styles (H1, H2, H3)
 * - Styled hyperlinks
 * - Custom list styling
 * - JSON RTE support
 */
interface RichTextStoryArgs {
  content: unknown
}

const createContentElement = (content: unknown): RichtextComponentType =>
  ({
    title: 'TEMP',
    tags: [],
    locale: 'de-de',
    created_at: '2026-01-06T08:35:09.343Z',
    updated_at: '2026-01-06T08:35:09.343Z',
    _content_type_uid: 'richtext-component',
    ACL: [],
    _version: 1,
    _in_progress: false,
    content: toRaw(content),
  }) as unknown as RichtextComponentType

const meta = {
  title: 'CMS Contentstack/RichText',
  component: RichText,
  argTypes: {
    content: {
      control: 'object',
      description: 'Rich text content JSON structure',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <RichTextComponent :contentElement="contentElement" />
          </template>
        `,
      },
    },
  },
  render: (args: RichTextStoryArgs) => {
    return {
      components: { RichText },
      setup() {
        const contentElement = computed(() =>
          createContentElement(args.content),
        )
        return {
          contentElement,
        }
      },
      template: `<RichText :contentElement="contentElement" />`,
    }
  },
}

export default meta

type Story = StoryObj<RichTextStoryArgs>

/**
 * Simple paragraph text with basic formatting
 */
export const SimpleParagraph: Story = {
  args: {
    content: {
      type: 'doc',
      children: [
        {
          type: 'p',
          attrs: {},
          children: [
            {
              text: 'This is a simple paragraph of rich text content that will be rendered with default styling.',
            },
          ],
        },
      ],
    },
  },
}

/**
 * Rich text with headings demonstrating the custom heading styles
 */
export const WithHeadings: Story = {
  args: {
    content: {
      type: 'doc',
      uid: 'doc-2',
      children: [
        {
          type: 'h1',
          children: [
            {
              text: 'Main Heading (H1)',
            },
          ],
        },
        {
          type: 'p',
          children: [
            {
              text: 'Some introductory text after the main heading.',
            },
          ],
        },
        {
          type: 'h2',
          children: [
            {
              text: 'Section Heading (H2)',
            },
          ],
        },
        {
          type: 'p',
          children: [
            {
              text: 'Content under the section heading with additional details.',
            },
          ],
        },
        {
          type: 'h3',
          children: [
            {
              text: 'Subsection Heading (H3)',
            },
          ],
        },
      ],
    },
  },
}

/**
 * Rich text with lists showing both ordered and unordered list styling
 */
export const WithLists: Story = {
  args: {
    content: {
      type: 'doc',
      uid: 'doc-3',
      children: [
        {
          type: 'h2',
          children: [{ text: 'Shopping List' }],
        },
        {
          type: 'ul',
          children: [
            {
              type: 'li',
              children: [
                { type: 'p', children: [{ text: 'Organic vegetables' }] },
              ],
            },
            {
              type: 'li',
              children: [{ type: 'p', children: [{ text: 'Fresh bread' }] }],
            },
            {
              type: 'li',
              children: [
                { type: 'p', children: [{ text: 'Local dairy products' }] },
              ],
            },
          ],
        },
        {
          type: 'h2',
          children: [{ text: 'Setup Instructions' }],
        },
        {
          type: 'ol',
          children: [
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [{ text: 'Download and install the application' }],
                },
              ],
            },
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [{ text: 'Create your account and verify email' }],
                },
              ],
            },
            {
              type: 'li',
              children: [
                {
                  type: 'p',
                  children: [
                    { text: 'Configure your preferences and start using' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
}

/**
 * Rich text with hyperlinks demonstrating custom link styling
 */
export const WithLinks: Story = {
  args: {
    content: {
      type: 'doc',
      uid: 'doc-4',
      children: [
        {
          type: 'p',
          children: [
            { text: 'Visit our ' },
            {
              type: 'a',
              attrs: {
                url: 'https://example.com',
                target: '_blank',
              },
              children: [{ text: 'main website' }],
            },
            {
              text: ' for more information about our products and services.',
            },
          ],
        },
      ],
    },
  },
}
