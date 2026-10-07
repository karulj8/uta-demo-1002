import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Component from './SmartSortingProductsSliderComponent.vue'

describe('Amplience SmartSortingProductsSlider Component', () => {
  it('mounts with minimal content element', () => {
    const wrapper = mount(Component, {
      props: {
        contentElement: {
          _meta: { schema: 'https://scayle.com/component-component' },
        },
      },
      global: {
        stubs: {
          SFButton: true,
          SFLink: true,
          SFItemsSlider: true,
          SFAccordionEntry: true,
          SFBaseProductSlider: true,
          SFSmartSortingProductsSlider: true,
          SFRecentlyViewedProductsSlider: true,
          SFSliderArrowButton: true,
          AmplienceComponent: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
