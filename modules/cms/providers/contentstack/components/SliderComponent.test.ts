import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { SliderComponent, TextComponent } from '../types/gen/contentstack'
import SliderComponentVue from './SliderComponent.vue'

describe('Contentstack SliderComponent', () => {
  const createTextComponent = (
    content: string,
    textType: 'h1' | 'h2' | 'h3' | 'h4' | 'p' = 'p',
    uid: string = 'text-1',
  ): TextComponent =>
    ({
      uid,
      _content_type_uid: 'text-component',
      content,
      text_type: textType,
    }) as unknown as TextComponent

  const createWrapper = (
    contentElement: {
      content?: SliderComponent['content']
      show_navigation_arrows?: SliderComponent['show_navigation_arrows']
      show_pagination_indicators?: SliderComponent['show_pagination_indicators']
    } & Partial<Omit<SliderComponent, 'content'>>,
  ) => {
    const defaultSliderComponent = {
      uid: 'slider-1',
      _content_type_uid: 'slider-component',
      content: contentElement.content || [],
      show_navigation_arrows: contentElement.show_navigation_arrows,
      show_pagination_indicators: contentElement.show_pagination_indicators,
      ...contentElement,
    } as unknown as SliderComponent

    return mount(SliderComponentVue, {
      props: {
        contentElement: defaultSliderComponent,
      },
      global: {
        stubs: {
          ContentstackComponent: {
            name: 'ContentstackComponent',
            template: '<div>{{ contentElement.content }}</div>',
            props: ['contentElement'],
          },
        },
      },
    })
  }

  it('renders slider', () => {
    const textComponents = [
      createTextComponent('First slide text', 'h1', 'text-1'),
      createTextComponent('Second slide text', 'p', 'text-2'),
      createTextComponent('Third slide text', 'h2', 'text-3'),
    ]

    const wrapper = createWrapper({
      content: textComponents,
    })

    expect(wrapper.findComponent({ name: 'SFItemsSlider' }).exists()).toBe(true)
    expect(
      wrapper.findAllComponents({ name: 'ContentstackComponent' }),
    ).toHaveLength(3)

    const contentstackComponents = wrapper.findAllComponents({
      name: 'ContentstackComponent',
    })
    expect(contentstackComponents?.[0]?.text()).toBe('First slide text')
    expect(contentstackComponents?.[1]?.text()).toBe('Second slide text')
    expect(contentstackComponents?.[2]?.text()).toBe('Third slide text')
  })

  it('handles empty content array', () => {
    const wrapper = createWrapper({
      content: [],
    })

    expect(wrapper.findComponent({ name: 'SFItemsSlider' }).exists()).toBe(true)
    expect(
      wrapper.findAllComponents({ name: 'ContentstackComponent' }),
    ).toHaveLength(0)
  })

  it('passes withArrows prop correctly when showNavigationArrows is true', () => {
    const wrapper = createWrapper({
      content: [createTextComponent('Test content')],
      show_navigation_arrows: true,
    })

    const sfItemsSlider = wrapper.findComponent({ name: 'SFItemsSlider' })
    expect(sfItemsSlider.props('withArrows')).toBe(true)
  })

  it('passes withArrows prop correctly when showNavigationArrows is false', () => {
    const wrapper = createWrapper({
      content: [createTextComponent('Test content')],
      show_navigation_arrows: false,
    })

    const sfItemsSlider = wrapper.findComponent({ name: 'SFItemsSlider' })
    expect(sfItemsSlider.props('withArrows')).toBe(false)
  })

  it('defaults to showing navigation arrows when showNavigationArrows is undefined', () => {
    const wrapper = createWrapper({
      content: [createTextComponent('Test content')],
    })

    const sfItemsSlider = wrapper.findComponent({ name: 'SFItemsSlider' })
    expect(sfItemsSlider.props('withArrows')).toBe(true)
  })

  it('renders pagination indicators when showPaginationIndicators is true', () => {
    const textComponents = [
      createTextComponent('First slide', 'p', 'text-1'),
      createTextComponent('Second slide', 'p', 'text-2'),
    ]

    const wrapper = createWrapper({
      content: textComponents,
      show_pagination_indicators: true,
    })

    const paginationButtons = wrapper.findAll('.size-3\\.5')
    expect(paginationButtons).toHaveLength(2)
  })

  it('does not render pagination indicators when showPaginationIndicators is false', () => {
    const textComponents = [
      createTextComponent('First slide', 'p', 'text-1'),
      createTextComponent('Second slide', 'p', 'text-2'),
    ]

    const wrapper = createWrapper({
      content: textComponents,
      show_pagination_indicators: false,
    })

    const paginationButtons = wrapper.findAll('.size-3\\.5')
    expect(paginationButtons).toHaveLength(0)
  })

  it('defaults to showing pagination indicators when showPaginationIndicators is undefined', () => {
    const textComponents = [
      createTextComponent('First slide', 'p', 'text-1'),
      createTextComponent('Second slide', 'p', 'text-2'),
    ]

    const wrapper = createWrapper({
      content: textComponents,
    })

    const paginationButtons = wrapper.findAll('.size-3\\.5')
    expect(paginationButtons).toHaveLength(2)
  })
})
