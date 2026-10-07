import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type { TextComponent as TextComponentType } from '../types/gen'
import Text from './TextComponent.vue'

interface TextStoryArgs {
  content: string
  textType: 'p' | 'h1' | 'h2' | 'h3' | 'h4'
}

const createContentElement = (
  content: string,
  textType: 'p' | 'h1' | 'h2' | 'h3' | 'h4' = 'p',
): TextComponentType =>
  ({
    content,
    text_type: textType,
  }) as TextComponentType

const meta = {
  title: 'CMS Amplience/Text',
  component: Text,
  render: (args: TextStoryArgs) => ({
    components: { Text },
    setup() {
      const contentElement = computed(() =>
        createContentElement(args.content, args.textType),
      )
      return { contentElement }
    },
    template: '<Text :contentElement="contentElement" />',
  }),
}

export default meta
type Story = StoryObj<TextStoryArgs>

export const Paragraph: Story = {
  args: {
    content: 'Amplience paragraph text.',
    textType: 'p',
  },
}

export const Heading1: Story = {
  args: {
    content: 'Amplience heading',
    textType: 'h1',
  },
}
