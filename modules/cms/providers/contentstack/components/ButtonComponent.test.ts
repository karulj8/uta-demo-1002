import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ButtonComponent } from '../types/gen/contentstack'
import ButtonComponentVue from './ButtonComponent.vue'

// Mock the composables
vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: vi.fn((url: string) => url),
  }),
}))

describe('Contentstack ButtonComponent', () => {
  const createContentElement = (
    text = 'Button Text',
    style: ButtonComponent['style'] = 'primary',
    url = '/test-url',
    openInNewTab = false,
  ): ButtonComponent =>
    ({
      uid: 'test-button',
      _content_type_uid: 'button-component',
      text,
      style,
      url,
      open_in_new_tab: openInNewTab,
    }) as ButtonComponent

  it('should render button with default primary variant', () => {
    const contentElement = createContentElement()
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('variant')).toBe('primary')
    expect(button.text()).toBe('Button Text')
  })

  it('should map style variants correctly', () => {
    const testCases = [
      { style: 'primary' as const, expectedVariant: 'primary' },
      { style: 'secondary' as const, expectedVariant: 'secondary' },
      { style: 'outline' as const, expectedVariant: 'tertiary' },
      { style: 'accent' as const, expectedVariant: 'accent' },
    ]

    testCases.forEach(({ style, expectedVariant }) => {
      const contentElement = createContentElement('Test', style)
      const wrapper = mount(ButtonComponentVue, {
        props: { contentElement },
        global: {
          stubs: {
            SFButton: {
              name: 'SFButton',
              template: '<button v-bind="$props"><slot /></button>',
              props: ['variant', 'to', 'target'],
            },
          },
        },
      })

      const button = wrapper.findComponent({ name: 'SFButton' })
      expect(button.props('variant')).toBe(expectedVariant)
    })
  })

  it('should fallback to primary variant for unknown style', () => {
    const contentElement = createContentElement('Test')
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('variant')).toBe('primary')
  })

  it('should generate correct URL with localized route', () => {
    const contentElement = createContentElement('Test', 'primary', '/test-page')
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('to')).toBe('/test-page')
  })

  it('should generate correct URL with absolute URL', () => {
    const contentElement = createContentElement(
      'Test',
      'primary',
      'https://example.com/test-page',
    )
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('to')).toBe('https://example.com/test-page')
  })

  it('should set target to _blank when openInNewTab is true', () => {
    const contentElement = createContentElement(
      'Test',
      'primary',
      '/test',
      true,
    )
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('target')).toBe('_blank')
  })

  it('should set target to _self when openInNewTab is false', () => {
    const contentElement = createContentElement(
      'Test',
      'primary',
      '/test',
      false,
    )
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    const button = wrapper.findComponent({ name: 'SFButton' })
    expect(button.props('target')).toBe('_self')
  })

  it('should render button text correctly', () => {
    const contentElement = createContentElement('Custom Button Text')
    const wrapper = mount(ButtonComponentVue, {
      props: { contentElement },
      global: {
        stubs: {
          SFButton: {
            name: 'SFButton',
            template: '<button v-bind="$props"><slot /></button>',
            props: ['variant', 'to', 'target'],
          },
        },
      },
    })

    expect(wrapper.text()).toBe('Custom Button Text')
  })
})
