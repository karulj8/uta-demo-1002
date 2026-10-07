import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LinkComponentVue from './LinkComponent.vue'

const mockGetLocalizedRoute = vi.fn().mockImplementation((url: string) => url)

vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: mockGetLocalizedRoute,
  }),
}))

describe('Amplience LinkComponent', () => {
  const mountLink = (contentElement: Record<string, unknown>) =>
    mount(LinkComponentVue, {
      props: {
        contentElement,
      },
      global: {
        stubs: {
          SFLink: {
            props: ['to', 'target'],
            template: '<a :href="to" :target="target"><slot /></a>',
          },
          AmplienceComponent: {
            template: '<span class="nested-content" />',
          },
        },
      },
    })

  it('renders nested content for an internal link', () => {
    const wrapper = mountLink({
      url_type: 'internal',
      link: '/about',
      open_in_new_tab: false,
      content: [
        {
          componentType: 'text',
          text: { content: 'About us' },
        },
      ],
    })

    expect(mockGetLocalizedRoute).toHaveBeenCalledWith('/about')
    expect(wrapper.find('a').attributes('href')).toBe('/about')
    expect(wrapper.find('a').attributes('target')).toBe('_self')
    expect(wrapper.find('.nested-content').exists()).toBe(true)
  })

  it('opens external links in a new tab', () => {
    const wrapper = mountLink({
      url_type: 'external',
      link: 'https://example.com',
      open_in_new_tab: false,
      content: [
        {
          componentType: 'text',
          text: { content: 'External' },
        },
      ],
    })

    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('honors open_in_new_tab for internal links', () => {
    const wrapper = mountLink({
      url_type: 'internal',
      link: '/about',
      open_in_new_tab: true,
      content: [
        {
          componentType: 'text',
          text: { content: 'About us' },
        },
      ],
    })

    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('falls back to URL heuristics when url_type is missing', () => {
    const externalWrapper = mountLink({
      link: 'https://example.com',
      open_in_new_tab: false,
      content: [
        {
          componentType: 'text',
          text: { content: 'Legacy external' },
        },
      ],
    })

    expect(externalWrapper.find('a').attributes('href')).toBe(
      'https://example.com',
    )
    expect(externalWrapper.find('a').attributes('target')).toBe('_blank')

    mockGetLocalizedRoute.mockClear()

    const internalWrapper = mountLink({
      link: '/about',
      open_in_new_tab: false,
      content: [
        {
          componentType: 'text',
          text: { content: 'Legacy internal' },
        },
      ],
    })

    expect(mockGetLocalizedRoute).toHaveBeenCalledWith('/about')
    expect(internalWrapper.find('a').attributes('href')).toBe('/about')
    expect(internalWrapper.find('a').attributes('target')).toBe('_self')
  })
})
