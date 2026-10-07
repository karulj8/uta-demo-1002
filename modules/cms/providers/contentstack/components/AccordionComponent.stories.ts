import { computed } from 'vue'
import type { StoryObj } from '@storybook-vue/nuxt'
import type {
  AccordionComponent as AccordionComponentType,
  AccordionItemComponent as AccordionItemComponentType,
  SectionComponent as SectionComponentType,
  TextComponent as TextComponentType,
} from '../types/gen/contentstack'
import AccordionComponent from './AccordionComponent.vue'

/**
 * Contentstack Accordion component displays a collapsible container with a title and multiple accordion items.
 * It renders accordion entries using ContentstackComponent instances with expandable/collapsible behavior.
 *
 * Key features:
 * - Optional accordion title displayed above items
 * - Dynamic rendering of accordion items from Contentstack content
 * - Supports any number of accordion items
 * - Seamless integration with ContentstackComponent for nested content rendering
 */
interface AccordionStoryArgs {
  display_title?: string
  content: AccordionComponentType['content']
}

const createContentElement = (
  title?: string,
  content: unknown[] = [],
): AccordionComponentType =>
  ({
    title,
    content,
    $: undefined,
  }) as unknown as AccordionComponentType

const meta = {
  title: 'CMS Contentstack/Accordion',
  component: AccordionComponent,
  argTypes: {
    display_title: {
      control: 'text',
      description: 'Optional title displayed above accordion items',
      name: 'contentElement.display_title',
    },
    content: {
      control: 'object',
      description: 'Array of accordion items to display',
      name: 'contentElement.content',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `
          <template>
            <AccordionComponent :contentElement="contentElement" />
          </template>
        `,
      },
      description: {
        component:
          'A collapsible accordion container with optional title and multiple expandable items.',
      },
    },
  },
  render: (args: AccordionStoryArgs) => {
    return {
      components: { AccordionComponent },
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
          <AccordionComponent :contentElement="contentElement" />
        </div>
      `,
    }
  },
}

export default meta
type Story = StoryObj<AccordionStoryArgs>

const mockAccordionItem1 = {
  uid: 'accordion-item-1',
  _content_type_uid: 'accordion_item-component',
  display_title: 'Shipping Information',
  $: undefined,
  content: [
    {
      uid: 'section-1',
      _content_type_uid: 'section-component',
      background_color: '#f0f9ff',
      padding: 'medium',
      $: undefined,
      content: [
        {
          uid: 'text-1',
          _content_type_uid: 'text-component',
          content:
            'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days, while express shipping delivers within 1-2 business days.',
          text_type: 'p',
          $: undefined,
        } as unknown as TextComponentType,
      ],
    } as unknown as SectionComponentType,
  ],
} as unknown as AccordionItemComponentType

const mockAccordionItem2 = {
  uid: 'accordion-item-2',
  _content_type_uid: 'accordion_item-component',
  display_title: 'Return Policy',
  $: undefined,
  content: [
    {
      uid: 'section-2',
      _content_type_uid: 'section-component',
      background_color: '#fef3c7',
      padding: 'medium',
      $: undefined,
      content: [
        {
          uid: 'text-2',
          _content_type_uid: 'text-component',
          content:
            'Returns are accepted within 30 days of purchase. Items must be unused and in original packaging. Return shipping costs are covered by the customer.',
          text_type: 'p',
          $: undefined,
        } as unknown as TextComponentType,
      ],
    } as unknown as SectionComponentType,
  ],
} as unknown as AccordionItemComponentType

const mockAccordionItem3 = {
  uid: 'accordion-item-3',
  _content_type_uid: 'accordion_item-component',
  display_title: 'Product Care',
  $: undefined,
  content: [
    {
      uid: 'section-3',
      _content_type_uid: 'section-component',
      background_color: '#f0fdf4',
      padding: 'medium',
      $: undefined,
      content: [
        {
          uid: 'text-3',
          _content_type_uid: 'text-component',
          content:
            'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron on medium heat if needed. Do not dry clean.',
          text_type: 'p',
          $: undefined,
        } as unknown as TextComponentType,
      ],
    } as unknown as SectionComponentType,
  ],
} as unknown as AccordionItemComponentType

/**
 * Accordion with title and multiple items
 */
export const WithTitle: Story = {
  args: {
    display_title: 'Product FAQ',
    content: [mockAccordionItem1, mockAccordionItem2, mockAccordionItem3],
  },
}

/**
 * Accordion without title, just the collapsible items
 */
export const WithoutTitle: Story = {
  args: {
    content: [mockAccordionItem1, mockAccordionItem2],
  },
}

/**
 * Single accordion item
 */
export const SingleItem: Story = {
  args: {
    display_title: 'Contact Information',
    content: [mockAccordionItem1],
  },
}
