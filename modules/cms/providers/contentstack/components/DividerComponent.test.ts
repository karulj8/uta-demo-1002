import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DividerComponent } from '../types/gen/contentstack'
import DividerComponentVue from './DividerComponent.vue'

describe('Contentstack Divider', () => {
  const createContentElement = (
    height: DividerComponent['height'],
    showLine = false,
  ): DividerComponent =>
    ({
      uid: 'test-divider',
      _content_type_uid: 'divider-component',
      height,
      show_line: showLine,
    }) as DividerComponent

  it('should render with correct default spacing for small height', () => {
    const contentElement = createContentElement('small')
    const wrapper = mount(DividerComponentVue, {
      props: { contentElement },
    })

    expect(wrapper.classes()).toContain('py-3')
    expect(wrapper.classes()).toContain('lg:py-5')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.find('hr').exists()).toBe(false)
  })

  it('should render with correct spacing for medium height', () => {
    const contentElement = createContentElement('medium')
    const wrapper = mount(DividerComponentVue, {
      props: { contentElement },
    })

    expect(wrapper.classes()).toContain('py-5')
    expect(wrapper.classes()).toContain('lg:py-9')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.find('hr').exists()).toBe(false)
  })

  it('should render with correct spacing for large height', () => {
    const contentElement = createContentElement('large')
    const wrapper = mount(DividerComponentVue, {
      props: { contentElement },
    })

    expect(wrapper.classes()).toContain('py-9')
    expect(wrapper.classes()).toContain('lg:py-12')
    expect(wrapper.classes()).toContain('w-full')
    expect(wrapper.find('hr').exists()).toBe(false)
  })

  it('should render hr element when showLine is true', () => {
    const contentElement = createContentElement('small', true)
    const wrapper = mount(DividerComponentVue, {
      props: { contentElement },
    })

    const hr = wrapper.find('hr')
    expect(hr.exists()).toBe(true)
  })
})
