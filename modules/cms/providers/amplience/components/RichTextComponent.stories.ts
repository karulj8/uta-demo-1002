import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { RichTextComponent as RichTextComponentType } from '../types/gen'
import RichText from './RichTextComponent.vue'

/**
 * Amplience Rich Text component renders markdown content with custom styling for headings, lists, and links.
 * It uses `marked` to convert Amplience markdown into HTML with Tailwind CSS classes.
 *
 * Key features:
 * - Custom heading styles (H1, H2, H3) with semantic markup and font-semibold
 * - Styled hyperlinks with font-semibold class
 * - Custom list styling with appropriate indentation and bullet/number styles
 * - Markdown rich text support with HTML sanitization
 */
interface RichTextStoryArgs {
  content: string
}

const createContentElement = (content: string): RichTextComponentType =>
  ({
    _meta: {
      schema: 'https://scayle.com/rich-text-component',
    },
    content,
  }) as RichTextComponentType

const meta = {
  title: 'CMS Amplience/RichText',
  component: RichText,
  argTypes: {
    content: {
      control: 'text',
      description: 'Markdown rich text content',
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
      description: {
        component:
          'A rich text renderer component with custom styles for headings, lists, links and markdown content.',
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
    content:
      'This is a simple paragraph of rich text content that will be rendered with default styling.',
  },
}

/**
 * Rich text with headings demonstrating the custom heading styles
 */
export const WithHeadings: Story = {
  args: {
    content: `# Main Heading (H1)

Some introductory text after the main heading.

## Section Heading (H2)

Content under the section heading with additional details.

### Subsection Heading (H3)`,
  },
}

/**
 * Rich text with lists showing both ordered and unordered list styling
 */
export const WithLists: Story = {
  args: {
    content: `## Shopping List

- Organic vegetables
- Fresh bread
- Local dairy products

## Setup Instructions

1. Download and install the application
2. Create your account and verify email
3. Configure your preferences and start using`,
  },
}

/**
 * Rich text with hyperlinks demonstrating custom link styling
 */
export const WithLinks: Story = {
  args: {
    content:
      'Visit our [main website](https://example.com) for more information about our products and services.',
  },
}

/**
 * Complex rich text content combining all features: headings, lists, and links
 */
export const ComplexContent: Story = {
  args: {
    content: `# Getting Started Guide

Welcome to our comprehensive guide! This document will help you understand all the features available.

## Prerequisites

Before you begin, please ensure you have the following:

- A modern web browser
- Internet connection
- Access to the [admin panel](https://admin.example.com)

### Next Steps

Once you have everything set up, visit our [documentation](https://docs.example.com) for detailed instructions.`,
  },
}
