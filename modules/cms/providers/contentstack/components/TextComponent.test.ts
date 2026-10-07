import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { TextComponent } from '../types/gen/contentstack'
import Text from './TextComponent.vue'

describe('Contentstack Text Component', () => {
  const createWrapper = (contentElement: Partial<TextComponent>) => {
    return mount(Text, {
      props: {
        contentElement: {
          uid: 'test-text',
          _content_type_uid: 'text-component',
          content: contentElement.content || '',
          text_type: contentElement.text_type,
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
      text_type: 'h1',
    })

    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.text()).toBe('Heading 1 content')
    expect(wrapper.find('h1').classes()).toContain('text-3xl')
    expect(wrapper.find('h1').classes()).toContain('font-semibold')
  })

  it('renders h2 element when textType is h2', () => {
    const wrapper = createWrapper({
      content: 'Heading 2 content',
      text_type: 'h2',
    })

    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.text()).toBe('Heading 2 content')
    expect(wrapper.find('h2').classes()).toContain('text-2xl')
    expect(wrapper.find('h2').classes()).toContain('font-semibold')
  })

  it('renders h3 element when textType is h3', () => {
    const wrapper = createWrapper({
      content: 'Heading 3 content',
      text_type: 'h3',
    })

    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.text()).toBe('Heading 3 content')
    expect(wrapper.find('h3').classes()).toContain('text-xl')
    expect(wrapper.find('h3').classes()).toContain('font-semibold')
  })

  it('renders h4 element when textType is h4', () => {
    const wrapper = createWrapper({
      content: 'Heading 4 content',
      text_type: 'h4',
    })

    expect(wrapper.find('h4').exists()).toBe(true)
    expect(wrapper.text()).toBe('Heading 4 content')
    expect(wrapper.find('h4').classes()).toContain('text-lg')
    expect(wrapper.find('h4').classes()).toContain('font-semibold')
  })

  it('renders p element when textType is p', () => {
    const wrapper = createWrapper({
      content: 'Paragraph content',
      text_type: 'p',
    })

    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toBe('Paragraph content')
    expect(wrapper.find('p').classes()).toContain('text-wrap')
  })

  it('handles empty content', () => {
    const wrapper = createWrapper({
      content: '',
      text_type: 'h1',
    })

    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })

  it('handles undefined content', () => {
    const wrapper = createWrapper({
      content: undefined,
      text_type: 'h2',
    })

    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })

  it('handles undefined textType', () => {
    const wrapper = createWrapper({
      content: 'Default paragraph content',
      text_type: undefined,
    })

    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toBe('Default paragraph content')
    expect(wrapper.find('p').classes()).toContain('text-wrap')
  })
})
