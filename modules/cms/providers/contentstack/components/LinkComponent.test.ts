import type { VueWrapper } from '@vue/test-utils'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type {
  ImageComponent,
  LinkComponent,
  TextComponent,
} from '../types/gen/contentstack'
import LinkComponentVue from './LinkComponent.vue'

// Mock the composables and utilities
const mockGetLocalizedRoute = vi.fn().mockImplementation((url: string) => url)

vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: mockGetLocalizedRoute,
  }),
}))

const stubs = {
  SFLink: {
    name: 'SFLink',
    props: ['to', 'target'],
    template:
      '<a :href="to" :target="target" data-testid="sf-link"><slot/></a>',
  },
  TextComponent: {
    name: 'TextComponent',
    props: ['contentElement'],
    template:
      '<p data-testid="text-component">{{ contentElement.content }}</p>',
  },
  ImageComponent: {
    name: 'ImageComponent',
    props: ['contentElement'],
    template:
      '<img data-testid="image-component" :src="contentElement.image_desktop.url" :alt="contentElement.alt_text" />',
  },
  ContentstackComponent: {
    name: 'ContentstackComponent',
    props: ['contentElement'],
    template:
      "<component :is=\"contentElement._content_type_uid === 'text-component' ? 'TextComponent' : 'ImageComponent'\" :content-element=\"contentElement\" />",
  },
}

describe('Contentstack Link Component', () => {
  const imageContent = {
    uid: 'image-id',
    _content_type_uid: 'image-component',
    image_desktop: {
      url: 'https://images.contentstack.io/space-id/asset-id/image.jpg',
      dimension: {
        width: 800,
        height: 600,
      },
    },
    alt_text: 'alt',
  } as unknown as ImageComponent

  it('should render link with image content external link', async () => {
    const contentElement = {
      uid: 'test-1',
      _content_type_uid: 'link-component',
      url: 'https://example.com',
      open_in_new_tab: true,
      content: [imageContent],
    } as unknown as LinkComponent

    const wrapper: VueWrapper = mount(LinkComponentVue, {
      props: {
        contentElement,
      },
      global: {
        stubs,
      },
    })

    const sfLink = wrapper.find('[data-testid="sf-link"]')
    expect(sfLink.exists()).toBe(true)
    expect(sfLink.attributes('href')).toBe('https://example.com')
    expect(sfLink.attributes('target')).toBe('_blank')

    const imageComponent = wrapper.find('img')
    expect(imageComponent.exists()).toBe(true)
    expect(imageComponent.attributes('src')).toBe(
      'https://images.contentstack.io/space-id/asset-id/image.jpg',
    )
    expect(imageComponent.attributes('alt')).toBe('alt')
  })

  it('should render link with image content internal link', () => {
    const contentElement = {
      uid: 'test-2',
      _content_type_uid: 'link-component',
      url: '/internal-page',
      open_in_new_tab: false,
      content: [imageContent],
    } as unknown as LinkComponent

    const wrapper: VueWrapper = mount(LinkComponentVue, {
      props: {
        contentElement,
      },
      global: {
        stubs,
      },
    })

    const sfLink = wrapper.find('[data-testid="sf-link"]')
    expect(sfLink.exists()).toBe(true)
    expect(sfLink.attributes('href')).toBe('/internal-page')
    expect(sfLink.attributes('target')).toBe('_self')

    const imageComponent = wrapper.find('img')
    expect(imageComponent.exists()).toBe(true)
    expect(imageComponent.attributes('src')).toBe(
      'https://images.contentstack.io/space-id/asset-id/image.jpg',
    )
    expect(imageComponent.attributes('alt')).toBe('alt')
  })

  it('renders link with text content', () => {
    const textContent = {
      uid: 'text-1',
      _content_type_uid: 'text-component',
      content: 'Sample text',
      text_type: 'p',
    } as unknown as TextComponent

    const contentElement = {
      uid: 'test-4',
      _content_type_uid: 'link-component',
      url: '/test-text-link',
      open_in_new_tab: false,
      content: [textContent],
    } as unknown as LinkComponent

    const wrapper: VueWrapper = mount(LinkComponentVue, {
      props: {
        contentElement,
      },
      global: {
        stubs,
      },
    })

    const sfLink = wrapper.find('[data-testid="sf-link"]')
    expect(sfLink.exists()).toBe(true)
    expect(sfLink.attributes('href')).toBe('/test-text-link')
    expect(sfLink.attributes('target')).toBe('_self')

    const textComponent = wrapper.find('p')
    expect(textComponent.exists()).toBe(true)
    expect(textComponent.text()).toBe('Sample text')
  })

  it('renders link with openInNewTab set to true', () => {
    const contentElement = {
      uid: 'test-5',
      _content_type_uid: 'link-component',
      url: 'https://external-link.com',
      open_in_new_tab: true,
      content: [imageContent],
    } as unknown as LinkComponent

    const wrapper: VueWrapper = mount(LinkComponentVue, {
      props: {
        contentElement,
      },
      global: {
        stubs,
      },
    })

    const sfLink = wrapper.find('[data-testid="sf-link"]')
    expect(sfLink.exists()).toBe(true)
    expect(sfLink.attributes('href')).toBe('https://external-link.com')
    expect(sfLink.attributes('target')).toBe('_blank')

    const imageComponent = wrapper.find('img')
    expect(imageComponent.exists()).toBe(true)
    expect(imageComponent.attributes('src')).toBe(
      'https://images.contentstack.io/space-id/asset-id/image.jpg',
    )
    expect(imageComponent.attributes('alt')).toBe('alt')
  })
})
