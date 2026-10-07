import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './AccordionComponent.vue'

describe('Amplience Accordion Component', () => {
  it('mounts with minimal content element', () => {
    const wrapper = mount(Component, {
      props: {
        contentElement: {
          _meta: { schema: 'https://scayle.com/accordion-component.json' },
          content: [
            {
              _meta: {
                schema: 'https://scayle.com/accordion-item-component.json',
              },
              title: 'Item',
            },
          ],
        },
      },
      global: {
        stubs: {
          SFAccordionEntry: true,
          AccordionItemComponent: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
