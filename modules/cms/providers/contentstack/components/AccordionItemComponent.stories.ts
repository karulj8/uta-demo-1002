import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  AccordionItemComponent as AccordionItemComponentType,
  SectionComponent as SectionComponentType,
} from '../types/gen/contentstack'
import AccordionItemComponent from './AccordionItemComponent.vue'

/**
 * Contentstack AccordionItem component renders a single collapsible accordion entry with a title and content.
 * Uses SFAccordionEntry to provide expandable/collapsible behavior.
 *
 * Key features:
 * - Collapsible/expandable behavior via SFAccordionEntry
 * - Dynamic title from Contentstack fields
 * - Integration with ContentstackComponent for content rendering
 */
interface AccordionItemStoryArgs {
  display_title: string
  content: AccordionItemComponentType['content']
}

const createContentElement = (
  display_title: string = 'Default Title',
  content: AccordionItemComponentType['content'] = [],
): AccordionItemComponentType =>
  ({
    uid: 'accordion-item-basic',
    display_title,
    content,
    $: undefined,
  }) as unknown as AccordionItemComponentType

const meta = {
  title: 'CMS Contentstack/AccordionItem',
  component: AccordionItemComponent,
  argTypes: {
    display_title: {
      control: 'text',
      description: 'Title of the accordion item',
      name: 'contentElement.display_title',
    },
    content: {
      control: 'object',
      description: 'Array of content items to display when expanded',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <AccordionItemComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A single accordion item with collapsible content and a clickable title.',
      },
    },
  },
  render: (args: AccordionItemStoryArgs) => {
    return {
      components: { AccordionItemComponent },
      setup() {
        const contentElement = computed(() =>
          createContentElement(args.display_title, args.content),
        )
        return {
          contentElement,
        }
      },
      template: `
        <div class="w-full max-w-2xl">
          <AccordionItemComponent :contentElement="contentElement" />
        </div>
      `,
    }
  },
}

type Story = StoryObj<AccordionItemStoryArgs>

export default meta

/**
 * Basic accordion item with section content containing background color and text
 */
export const BasicItem: Story = {
  args: {
    display_title: 'Shipping Information',
    content: [
      {
        uid: 'section-basic',
        _content_type_uid: 'section-component',
        background_color: '#f0f9ff',
        padding: 'medium',
        content: [
          {
            uid: 'text-basic',
            _content_type_uid: 'text-component',
            content:
              'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days, while express shipping delivers within 1-2 business days.',
            text_type: 'p',
          },
        ],
      } as unknown as SectionComponentType,
    ],
  },
}
