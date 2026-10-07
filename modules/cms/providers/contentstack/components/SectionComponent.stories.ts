import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  SectionComponent as SectionComponentType,
  TextComponent as TextComponentType,
  DividerComponent as DividerComponentType,
} from '../types/gen/contentstack'
import SectionComponent from './SectionComponent.vue'

/**
 * The Contentstack Section component provides a container with customizable padding, background color,
 * and background images for desktop and mobile. It renders child content elements.
 */
interface SectionStoryArgs {
  padding: 'small' | 'medium' | 'large' | 'none'
  backgroundColor?: string
  backgroundImageDesktopUrl?: string
  backgroundImageMobileUrl?: string
  minHeightDesktop?: number
  minHeightMobile?: number
  content: SectionComponentType['content']
}

const createContentElement = (
  padding: 'small' | 'medium' | 'large' | 'none' = 'medium',
  backgroundColor?: string,
  backgroundImageDesktopUrl?: string,
  backgroundImageMobileUrl?: string,
  minHeightDesktop?: number,
  minHeightMobile?: number,
  content: SectionComponentType['content'] = [],
): SectionComponentType =>
  ({
    padding,
    background_color: backgroundColor,
    background_image_desktop: backgroundImageDesktopUrl
      ? { url: backgroundImageDesktopUrl }
      : undefined,
    background_image_mobile: backgroundImageMobileUrl
      ? { url: backgroundImageMobileUrl }
      : undefined,
    min_height_desktop: minHeightDesktop,
    min_height_mobile: minHeightMobile,
    content,
    $: undefined,
  }) as unknown as SectionComponentType

const meta = {
  title: 'CMS Contentstack/Section',
  component: SectionComponent,
  argTypes: {
    padding: {
      control: 'select',
      options: ['small', 'medium', 'large', 'none'],
      description: 'Padding size for the section',
      name: 'contentElement.padding',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color of the section',
      name: 'contentElement.background_color',
    },
    backgroundImageDesktopUrl: {
      control: 'text',
      description: 'Background image URL for desktop',
      name: 'contentElement.background_image_desktop.url',
    },
    backgroundImageMobileUrl: {
      control: 'text',
      description: 'Background image URL for mobile',
      name: 'contentElement.background_image_mobile.url',
    },
    minHeightDesktop: {
      control: 'number',
      description: 'Minimum height for desktop',
      name: 'contentElement.min_height_desktop',
    },
    minHeightMobile: {
      control: 'number',
      description: 'Minimum height for mobile',
      name: 'contentElement.min_height_mobile',
    },
    content: {
      control: 'object',
      description: 'Array of content items to display in the section',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <SectionComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A flexible container component that can hold other CMS components with configurable styling options including padding, background colors, and background images.',
      },
    },
  },
  render: (args: SectionStoryArgs) => {
    return {
      components: { Section: SectionComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.padding,
            args.backgroundColor,
            args.backgroundImageDesktopUrl,
            args.backgroundImageMobileUrl,
            args.minHeightDesktop,
            args.minHeightMobile,
            args.content,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `
        <div class="w-full">
          <Section :contentElement="contentElement" />
        </div>
      `,
    }
  },
}

export default meta

type Story = StoryObj<SectionStoryArgs>

const backgroundImageUrl = 'desktopImage.avif'
const mobileBackgroundImageUrl = 'mobileImage.avif'

const mockTextContent = {
  uid: 'text-content-1',
  _content_type_uid: 'text-component',
  content: 'This is sample text content within the section.',
  text_type: 'p',
} as unknown as TextComponentType

/**
 * Basic section with default styling and sample content
 */
export const Default: Story = {
  args: {
    padding: 'medium',
    content: [mockTextContent],
  },
}

/**
 * Section with background color only
 */
export const WithBackgroundColor: Story = {
  args: {
    backgroundColor: '#f3f4f6',
    padding: 'large',
    content: [mockTextContent],
  },
}

/**
 * Section with background image for desktop
 */
export const WithBackgroundImage: Story = {
  args: {
    backgroundImageDesktopUrl: backgroundImageUrl,
    padding: 'large',
    content: [
      {
        ...mockTextContent,
        content: 'This section has a background image on desktop.',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with different background images for desktop and mobile
 */
export const WithResponsiveBackgroundImages: Story = {
  args: {
    backgroundImageDesktopUrl: backgroundImageUrl,
    backgroundImageMobileUrl: mobileBackgroundImageUrl,
    backgroundColor: '#1f2937',
    padding: 'large',
    content: [
      {
        ...mockTextContent,
        content:
          'This section has different background images for desktop and mobile.',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with small padding
 */
export const SmallPadding: Story = {
  args: {
    backgroundColor: '#e5e7eb',
    padding: 'small',
    content: [
      {
        ...mockTextContent,
        content: 'This section has small padding (p-5).',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with medium padding (default)
 */
export const MediumPadding: Story = {
  args: {
    backgroundColor: '#ddd6fe',
    padding: 'medium',
    content: [
      {
        ...mockTextContent,
        content: 'This section has medium padding (p-9).',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with large padding
 */
export const LargePadding: Story = {
  args: {
    backgroundColor: '#fed7d7',
    padding: 'large',
    content: [
      {
        ...mockTextContent,
        content: 'This section has large padding (p-12).',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with no padding
 */
export const NoPadding: Story = {
  args: {
    backgroundColor: '#fef3c7',
    padding: 'none',
    content: [
      {
        ...mockTextContent,
        content: 'This section has no padding (p-0).',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Section with multiple child components
 */
export const WithMultipleChildren: Story = {
  args: {
    backgroundColor: '#f0f9ff',
    padding: 'medium',
    content: [
      {
        ...mockTextContent,
        content: 'First text element in the section.',
      } as unknown as TextComponentType,
      {
        ...mockTextContent,
        uid: 'text-content-2',
        content: 'Second text element after the image.',
      } as unknown as TextComponentType,
      {
        uid: 'divider-1',
        component: 'DividerComponent',
        height: 'medium',
        show_line: true,
      } as unknown as DividerComponentType,
      {
        ...mockTextContent,
        uid: 'text-content-3',
        content: 'Final text element after the divider.',
      } as unknown as TextComponentType,
    ],
  },
}

/**
 * Empty section (no content)
 */
export const Empty: Story = {
  args: {
    backgroundColor: '#f9fafb',
    padding: 'medium',
    content: [],
  },
}
