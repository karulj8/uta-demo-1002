import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  SliderComponent as SliderComponentType,
  SectionComponent as SectionComponentType,
  TextComponent as TextComponentType,
} from '../types/gen/contentstack'
import SliderComponent from './SliderComponent.vue'

/**
 * Contentstack Slider component displays a horizontal carousel of content with navigation controls.
 * It provides an interactive slider interface with configurable navigation arrows and pagination indicators.
 *
 * Key features:
 * - Horizontal scrolling carousel with snap-to-slide behavior
 * - Optional navigation arrows for previous/next navigation
 * - Optional pagination indicators showing current slide position
 * - Supports any Contentstack content entries within slides
 * - Responsive design with mobile-friendly touch interactions
 */
interface SliderStoryArgs {
  content: SliderComponentType['content']
  showNavigationArrows: boolean
  showPaginationIndicators: boolean
}

const createContentElement = (
  content: SliderComponentType['content'] = [],
  showNavigationArrows = true,
  showPaginationIndicators = true,
): SliderComponentType =>
  ({
    content,
    show_navigation_arrows: showNavigationArrows,
    show_pagination_indicators: showPaginationIndicators,
    $: undefined,
  }) as unknown as SliderComponentType

const meta = {
  title: 'CMS Contentstack/Slider',
  component: SliderComponent,
  argTypes: {
    content: {
      control: 'object',
      description: 'Array of content items to display in the slider',
      name: 'contentElement.content',
    },
    showNavigationArrows: {
      control: 'boolean',
      description: 'Whether to show navigation arrows',
      name: 'contentElement.show_navigation_arrows',
    },
    showPaginationIndicators: {
      control: 'boolean',
      description: 'Whether to show pagination indicators',
      name: 'contentElement.show_pagination_indicators',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <SliderComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A horizontal carousel component with configurable navigation controls and pagination indicators.',
      },
    },
  },
  render: (args: SliderStoryArgs) => {
    return {
      components: { SliderComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(
            args.content,
            args.showNavigationArrows,
            args.showPaginationIndicators,
          ),
        )
        return {
          contentElement,
        }
      },
      template: `<SliderComponent :contentElement="contentElement" />`,
    }
  },
}

export default meta

type Story = StoryObj<SliderStoryArgs>

const createTextComponent = (
  content: string,
  textType: 'h1' | 'h2' | 'h3' | 'h4' | 'p' = 'p',
  uid: string,
): TextComponentType =>
  ({
    uid,
    _content_type_uid: 'text-component',
    content,
    text_type: textType,
  }) as unknown as TextComponentType

const createSectionSlide = (
  content: string,
  textType: 'h1' | 'h2' | 'h3' | 'h4' | 'p' = 'p',
  backgroundColor: string,
  uid: string,
): SectionComponentType =>
  ({
    uid,
    _content_type_uid: 'section-component',
    background_color: backgroundColor,
    padding: 'large',
    content: [createTextComponent(content, textType, `text-${uid}`)],
  }) as unknown as SectionComponentType

/**
 * Default slider with section content and full navigation controls
 */
export const Default: Story = {
  args: {
    showNavigationArrows: true,
    showPaginationIndicators: true,
    content: [
      createSectionSlide(
        'Welcome to our amazing collection',
        'h1',
        '#fef2f2',
        'slide-1',
      ),
      createSectionSlide(
        'Discover premium products crafted with care',
        'h2',
        '#f0f9ff',
        'slide-2',
      ),
      createSectionSlide(
        'Experience quality that speaks for itself',
        'h2',
        '#f0fdf4',
        'slide-3',
      ),
      createSectionSlide(
        'Join thousands of satisfied customers worldwide',
        'p',
        '#fefce8',
        'slide-4',
      ),
    ],
  },
}

/**
 * Slider without navigation arrows, pagination indicators only
 */
export const PaginationOnly: Story = {
  args: {
    showNavigationArrows: false,
    showPaginationIndicators: true,
    content: [
      createSectionSlide('Slide One', 'h2', '#fdf2f8', 'slide-1'),
      createSectionSlide('Slide Two', 'h2', '#f0f4ff', 'slide-2'),
      createSectionSlide('Slide Three', 'h2', '#f7fee7', 'slide-3'),
    ],
  },
}

/**
 * Slider with navigation arrows only, no pagination indicators
 */
export const ArrowsOnly: Story = {
  args: {
    showNavigationArrows: true,
    showPaginationIndicators: false,
    content: [
      createSectionSlide('Navigate with arrows', 'h2', '#fff1f2', 'slide-1'),
      createSectionSlide(
        'Previous and next buttons available',
        'p',
        '#eff6ff',
        'slide-2',
      ),
      createSectionSlide(
        'Clean interface without dots',
        'p',
        '#f0fdfa',
        'slide-3',
      ),
    ],
  },
}

/**
 * Minimal slider without any navigation controls
 */
export const Minimal: Story = {
  args: {
    showNavigationArrows: false,
    showPaginationIndicators: false,
    content: [
      createSectionSlide('Swipe to navigate', 'h2', '#faf5ff', 'slide-1'),
      createSectionSlide(
        'Touch and drag interaction',
        'p',
        '#fefce8',
        'slide-2',
      ),
      createSectionSlide('Clean minimal design', 'p', '#ecfdf5', 'slide-3'),
    ],
  },
}
