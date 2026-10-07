import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { ImageComponent as ImageComponentType } from '../types/gen/contentstack'
import Image from './ImageComponent.vue'

/**
 * The Contentstack Image component displays responsive images with support for different
 * aspect ratios on desktop and mobile devices.
 */

type AspectRatio = 'original' | '1:1' | '16:9' | '4:3' | '3:4'
interface ImageStoryArgs {
  desktopImageUrl: string
  mobileImageUrl: string
  altText: string
  aspectRatioDesktop: AspectRatio
  aspectRatioMobile: AspectRatio
}

const createContentElement = (
  desktopImageUrl: string,
  mobileImageUrl: string,
  altText: string,
  aspectRatioDesktop: AspectRatio = 'original',
  aspectRatioMobile: AspectRatio = 'original',
): ImageComponentType =>
  ({
    image_desktop: desktopImageUrl
      ? {
          url: desktopImageUrl,
          dimension: {
            width: 1280,
            height: 1455,
          },
        }
      : undefined,
    image_mobile: mobileImageUrl
      ? {
          url: mobileImageUrl,
          dimension: {
            width: 1280,
            height: 1455,
          },
        }
      : undefined,
    alt_text: altText,
    aspect_ratio_desktop: aspectRatioDesktop,
    aspect_ratio_mobile: aspectRatioMobile,
    $: undefined,
  }) as unknown as ImageComponentType

const meta = {
  title: 'CMS Contentstack/Image',
  component: Image,
  argTypes: {
    desktopImageUrl: {
      control: 'text',
      description: 'Desktop image URL',
      name: 'contentElement.image_desktop.url',
    },
    mobileImageUrl: {
      control: 'text',
      description: 'Mobile image URL (optional)',
      name: 'contentElement.image_mobile.url',
    },
    altText: {
      control: 'text',
      description: 'Alternative text for accessibility',
      name: 'contentElement.alt_text',
    },
    aspectRatioDesktop: {
      control: 'select',
      options: ['original', '1:1', '16:9', '4:3', '3:4'],
      description: 'Aspect ratio for desktop display',
      name: 'contentElement.aspect_ratio_desktop',
    },
    aspectRatioMobile: {
      control: 'select',
      options: ['original', '1:1', '16:9', '4:3', '3:4'],
      description: 'Aspect ratio for mobile display',
      name: 'contentElement.aspect_ratio_mobile',
    },
  },
  render: (args: ImageStoryArgs) => {
    return {
      components: { Image },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.desktopImageUrl,
            args.mobileImageUrl,
            args.altText,
            args.aspectRatioDesktop,
            args.aspectRatioMobile,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `
        <div class="w-1/2 mx-auto">
          <Image :contentElement="contentElement" />
        </div>
      `,
    }
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <ImageComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A responsive image component that displays Contentstack assets with configurable aspect ratios for desktop and mobile viewports.',
      },
    },
  },
}

export default meta
type Story = StoryObj<ImageStoryArgs>

const desktopImageUrl = 'desktopImage.avif'
const mobileImageUrl = 'mobileImage.avif'

/**
 * Overview of all available aspect ratios and configurations
 */
export const Default: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Original aspect ratio demo',
    aspectRatioDesktop: 'original',
    aspectRatioMobile: 'original',
  },
}

/**
 * Desktop-only image with 16:9 aspect ratio
 */
export const DesktopWidescreen: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Hero image in widescreen format',
    aspectRatioDesktop: '16:9',
    aspectRatioMobile: '16:9',
  },
}

/**
 * Square image with 1:1 aspect ratio
 */
export const SquareImage: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Profile photo in square format',
    aspectRatioDesktop: '1:1',
    aspectRatioMobile: '1:1',
  },
}

/**
 * Standard image with 4:3 aspect ratio
 */
export const StandardRatio: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Product photo in standard 4:3 format',
    aspectRatioDesktop: '4:3',
    aspectRatioMobile: '4:3',
  },
}

/**
 * Image with original aspect ratio preserved
 */
export const OriginalRatio: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Image with natural aspect ratio preserved',
    aspectRatioDesktop: 'original',
    aspectRatioMobile: 'original',
  },
}

/**
 * Image without mobile variant (desktop image used as fallback)
 */
export const DesktopOnly: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl: '',
    altText: 'Banner image (desktop only)',
    aspectRatioDesktop: '16:9',
    aspectRatioMobile: '16:9',
  },
}

/**
 * Different aspect ratios for desktop and mobile
 */
export const MixedAspectRatios: Story = {
  args: {
    desktopImageUrl,
    mobileImageUrl,
    altText: 'Mixed aspect ratios - 16:9 desktop, 1:1 mobile',
    aspectRatioDesktop: '16:9',
    aspectRatioMobile: '1:1',
  },
}
