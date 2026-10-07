import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { AccordionComponent } from '../types/gen/contentstack'
import Accordion from './AccordionComponent.vue'

describe('Contentstack Accordion Component', () => {
  const createWrapper = (contentElement: Partial<AccordionComponent>) => {
    return mount(Accordion, {
      props: {
        contentElement: {
          uid: 'test-uid',
          _content_type_uid: 'accordion-component',
          display_title: undefined,
          content: [],
          ...contentElement,
        } as AccordionComponent,
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

  it('renders without title when title is not provided', () => {
    const wrapper = createWrapper({
      content: [],
    })

    expect(wrapper.find('.text-xl.font-semibold').exists()).toBe(false)
  })

  it('renders title when title is provided', () => {
    const wrapper = createWrapper({
      display_title: 'Test Accordion Title',
      content: [],
    })

    const titleElement = wrapper.find('.text-xl.font-semibold')
    expect(titleElement.exists()).toBe(true)
    expect(titleElement.text()).toBe('Test Accordion Title')
  })

  it('renders child components', () => {
    const mockContent = [
      {
        uid: 'child-1',
        _content_type_uid: 'text-component',
      } as AccordionComponent['content'][0],
      {
        uid: 'child-2',
        _content_type_uid: 'text-component',
      } as AccordionComponent['content'][0],
    ]

    const wrapper = createWrapper({
      content: mockContent,
    })

    const childComponents = wrapper.findAll(
      '[data-testid="contentstack-component"]',
    )
    expect(childComponents).toHaveLength(2)
    expect(childComponents?.[0]?.text()).toBe('child-1')
    expect(childComponents?.[1]?.text()).toBe('child-2')
  })

  it('handles empty content array', () => {
    const wrapper = createWrapper({
      display_title: 'Test Title',
      content: [],
    })

    expect(wrapper.find('.text-xl.font-semibold').text()).toBe('Test Title')
    expect(
      wrapper.findAll('[data-testid="contentstack-component"]'),
    ).toHaveLength(0)
  })
})
