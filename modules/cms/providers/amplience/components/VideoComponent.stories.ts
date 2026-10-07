import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { VideoComponent as VideoComponentType } from '../types/gen'
import Video from './VideoComponent.vue'

/**
 * The Amplience Video component displays videos with preview images and configurable playback options.
 * It supports different aspect ratios and provides play controls with preview image thumbnails.
 */
interface VideoStoryArgs {
  aspectRatio: '1:1' | '16:9' | '4:3'
  autoplay: boolean
  muted: boolean
  loop: boolean
  showControls: boolean
}

const createContentElement = (
  aspectRatio: '1:1' | '16:9' | '4:3' = '16:9',
  autoplay = false,
  muted = true,
  loop = true,
  showControls = true,
): VideoComponentType =>
  ({
    video: {
      id: 'video-1',
      name: 'hero-video',
      endpoint: 'test',
      defaultHost: 'cdn.media.amplience.net',
    },
    poster_image: {
      id: 'poster-1',
      name: 'hero-poster',
      endpoint: 'test',
      defaultHost: 'cdn.media.amplience.net',
    },
    aspect_ratio: aspectRatio,
    autoplay,
    muted,
    loop,
    controls: showControls,
  }) as unknown as VideoComponentType

const meta = {
  title: 'CMS Amplience/Video',
  component: Video,
  argTypes: {
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
      description: 'Whether the video loops',
      name: 'contentElement.loop',
    },
    showControls: {
      control: 'boolean',
      description: 'Whether to show video controls',
      name: 'contentElement.controls',
    },
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
    },
  },
  render: (args: VideoStoryArgs) => {
    return {
      components: { Video },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
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
        <Video :contentElement="contentElement" />
      `,
    }
  },
}

export default meta
type Story = StoryObj<VideoStoryArgs>

/**
 * Default video with preview image and play button
 */
export const Default: Story = {
  args: {
    aspectRatio: '16:9',
    autoplay: false,
    muted: true,
    loop: true,
    showControls: true,
  },
}

/**
 * Autoplaying muted video
 */
export const Autoplay: Story = {
  args: {
    aspectRatio: '16:9',
    autoplay: true,
    muted: true,
    loop: true,
    showControls: false,
  },
}
