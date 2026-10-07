import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { VideoComponent as VideoComponentType } from '../types/gen/contentstack'
import Video from './VideoComponent.vue'

/**
 * The Contentstack Video component displays videos with preview images and configurable playback options.
 * It supports different aspect ratios and provides play controls with preview image thumbnails.
 */
interface VideoStoryArgs {
  videoUrl: string
  previewImageDesktopUrl: string
  previewImageMobileUrl: string
  aspectRatio: '1:1' | '16:9' | '4:3'
  autoplay: boolean
  muted: boolean
  loop: boolean
  showControls: boolean
}

const createContentElement = (
  videoUrl: string,
  previewImageDesktopUrl: string,
  previewImageMobileUrl: string,
  aspectRatio: '1:1' | '16:9' | '4:3' = '16:9',
  autoplay = false,
  muted = true,
  loop = true,
  showControls = true,
): VideoComponentType =>
  ({
    video: {
      url: videoUrl,
      title: 'Demo Video',
    },
    previewimagedesktop: {
      url: previewImageDesktopUrl,
    },
    previewimagemobile: previewImageMobileUrl
      ? {
          url: previewImageMobileUrl,
        }
      : undefined,
    aspect_ratio: aspectRatio,
    autoplay,
    muted,
    loop,
    show_controls: showControls,
    $: undefined,
  }) as unknown as VideoComponentType

const meta = {
  title: 'CMS Contentstack/Video',
  component: Video,
  argTypes: {
    videoUrl: {
      control: 'text',
      description: 'Video file URL',
      name: 'contentElement.video.url',
    },
    previewImageDesktopUrl: {
      control: 'text',
      description: 'Desktop preview image URL',
      name: 'contentElement.previewimagedesktop.url',
    },
    previewImageMobileUrl: {
      control: 'text',
      description: 'Mobile preview image URL (optional)',
      name: 'contentElement.previewimagemobile.url',
    },
    aspectRatio: {
      control: 'select',
      options: ['1:1', '16:9', '4:3'],
      description: 'Video aspect ratio',
      name: 'contentElement.aspect_ratio',
    },
    autoplay: {
      control: 'boolean',
      description: 'Whether to autoplay the video',
      name: 'contentElement.autoplay',
    },
    muted: {
      control: 'boolean',
      description: 'Whether the video is muted',
      name: 'contentElement.muted',
    },
    loop: {
      control: 'boolean',
      description: 'Whether to loop the video',
      name: 'contentElement.loop',
    },
    showControls: {
      control: 'boolean',
      description: 'Whether to show video controls',
      name: 'contentElement.show_controls',
    },
  },
  render: (args: VideoStoryArgs) => {
    return {
      components: { Video },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.videoUrl,
            args.previewImageDesktopUrl,
            args.previewImageMobileUrl,
            args.aspectRatio,
            args.autoplay,
            args.muted,
            args.loop,
            args.showControls,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `
        <div>
          <Video :contentElement="contentElement" />
        </div>
      `,
    }
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <VideoComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A video component that displays Contentstack video assets with preview images and configurable aspect ratios and playback controls.',
      },
    },
  },
}

export default meta
type Story = StoryObj<VideoStoryArgs>

const baseVideoUrl = 'video.mp4'
const basePreviewImageUrl = 'desktopImage.avif'
const basePreviewImageMobileUrl = 'mobileImage.avif'

/**
 * Default video with 16:9 aspect ratio and manual play
 */
export const Default: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: basePreviewImageMobileUrl,
    aspectRatio: '16:9',
    autoplay: false,
    muted: true,
    loop: true,
    showControls: true,
  },
}

/**
 * Autoplay video that starts playing immediately
 */
export const Autoplay: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: basePreviewImageMobileUrl,
    aspectRatio: '16:9',
    autoplay: true,
    muted: true,
    loop: true,
    showControls: true,
  },
}

/**
 * Square video with 1:1 aspect ratio
 */
export const SquareVideo: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: basePreviewImageMobileUrl,
    aspectRatio: '1:1',
    autoplay: false,
    muted: true,
    loop: true,
    showControls: true,
  },
}

/**
 * Video with 4:3 aspect ratio
 */
export const FourToThreeRatio: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: basePreviewImageMobileUrl,
    aspectRatio: '4:3',
    autoplay: false,
    muted: true,
    loop: true,
    showControls: true,
  },
}

/**
 * Video without controls and unmuted
 */
export const NoControlsUnmuted: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: basePreviewImageMobileUrl,
    aspectRatio: '16:9',
    autoplay: false,
    muted: false,
    loop: true,
    showControls: false,
  },
}

/**
 * Video that doesn't loop and has no mobile preview
 */
export const NoLoopNoMobile: Story = {
  args: {
    videoUrl: baseVideoUrl,
    previewImageDesktopUrl: basePreviewImageUrl,
    previewImageMobileUrl: '',
    aspectRatio: '16:9',
    autoplay: false,
    muted: true,
    loop: false,
    showControls: true,
  },
}
