import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { DividerComponent as DividerComponentType } from '../types/gen/contentstack'
import DividerComponent from './DividerComponent.vue'

/**
 * The Contentstack Divider component provides visual and spacing separation between content sections.
 * It supports different height options for spacing and can optionally display a horizontal line.
 * This component is designed to work with Contentstack CMS content structure.
 */
interface DividerStoryArgs {
  height: 'small' | 'medium' | 'large'
  showLine: boolean
}

const createContentElement = (
  height: 'small' | 'medium' | 'large' = 'small',
  showLine = true,
): DividerComponentType =>
  ({
    height,
    show_line: showLine,
    $: undefined,
  }) as unknown as DividerComponentType

const meta = {
  title: 'CMS Contentstack/Divider',
  component: DividerComponent,
  argTypes: {
    height: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Vertical spacing size for the divider',
      name: 'contentElement.height',
    },
    showLine: {
      control: 'boolean',
      description: 'Whether to show a horizontal line',
      name: 'contentElement.show_line',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <DividerComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A flexible divider component that creates spacing and optional visual separation between content sections.',
      },
    },
  },
  render: (args: DividerStoryArgs) => {
    return {
      components: { DividerComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(args.height, args.showLine),
        )
        return {
          contentElement,
        }
      },
      template: `
        <DividerComponent :contentElement="contentElement" />
      `,
    }
  },
}

export default meta
type Story = StoryObj<DividerStoryArgs>

export const SmallWithLine: Story = {
  args: {
    height: 'small',
    showLine: true,
  },
}

export const MediumWithLine: Story = {
  args: {
    height: 'medium',
    showLine: true,
  },
}

export const LargeWithLine: Story = {
  args: {
    height: 'large',
    showLine: true,
  },
}

export const SmallWithoutLine: Story = {
  args: {
    height: 'small',
    showLine: false,
  },
}

export const MediumWithoutLine: Story = {
  args: {
    height: 'medium',
    showLine: false,
  },
}

export const LargeWithoutLine: Story = {
  args: {
    height: 'large',
    showLine: false,
  },
}
