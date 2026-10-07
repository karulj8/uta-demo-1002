import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { TextComponent } from '../types/gen'
import Text from './TextComponent.vue'

describe('Amplience Text Component', () => {
  const createWrapper = (contentElement: Partial<TextComponent>) => {
    return mount(Text, {
      props: {
        contentElement: {
          content: contentElement.content || '',
          textType: contentElement.textType,
          ...contentElement,
        } as TextComponent,
      },
    })
  }

  it('renders paragraph by default when no textType is specified', () => {
    const wrapper = createWrapper({
      content: 'Test content',
    })

    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toBe('Test content')
  })

  it('renders h1 element when textType is h1', () => {
    const wrapper = createWrapper({
      content: 'Heading 1 content',
      textType: 'h1',
    })

    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.text()).toBe('Heading 1 content')
  })
})
