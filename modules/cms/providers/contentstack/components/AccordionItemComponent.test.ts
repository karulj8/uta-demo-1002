import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type {
  AccordionItemComponent,
  TextComponent,
} from '../types/gen/contentstack'
import AccordionItem from './AccordionItemComponent.vue'

describe('Contentstack AccordionItem Component', () => {
  const createWrapper = (contentElement: Partial<AccordionItemComponent>) => {
    return mount(AccordionItem, {
      props: {
        contentElement: {
          uid: 'test-item-uid',
          _content_type_uid: 'accordion_item-component',
          display_title: 'Test Title',
          content: [],
          ...contentElement,
        } as AccordionItemComponent,
      },
      global: {
        stubs: {
          ContentstackComponent: {
            name: 'ContentstackComponent',
            template:
              '<div data-testid="contentstack-component">{{ contentElement.uid }}</div>',
            props: ['contentElement'],
          },
        },
      },
    })
  }

  it('renders SFAccordionEntry with correct id and title', () => {
    const wrapper = createWrapper({
      display_title: 'Custom Title',
    })

    const title = wrapper.find('[data-testid="mobile-nav-accordion"]')
    expect(title.exists()).toBe(true)
    expect(title.text()).toContain('Custom Title')
  })

  it('renders child components inside SFAccordionEntry', () => {
    const mockContent = [
      {
        uid: 'child-1',
        _content_type_uid: 'text-component',
      } as TextComponent,
      {
        uid: 'child-2',
        _content_type_uid: 'text-component',
      } as TextComponent,
    ]

    const wrapper = createWrapper({
      display_title: 'Test Title',
      content: mockContent,
    })

    const childComponents = wrapper.findAll(
      '[data-testid="contentstack-component"]',
    )
    expect(childComponents).toHaveLength(2)
    expect(childComponents?.[0]?.text()).toBe('child-1')
    expect(childComponents?.[1]?.text()).toBe('child-2')
  })

  it('handles empty title', () => {
    const wrapper = createWrapper({
      display_title: '',
    })
    const title = wrapper.find('[data-testid="mobile-nav-accordion"]')
    expect(title.exists()).toBe(true)
  })

  it('handles empty content array', () => {
    const wrapper = createWrapper({
      display_title: 'Test Title',
      content: [],
    })

    expect(wrapper.find('[data-testid="mobile-nav-accordion"]').exists()).toBe(
      true,
    )
    expect(
      wrapper.findAll('[data-testid="contentstack-component"]'),
    ).toHaveLength(0)
  })
})
