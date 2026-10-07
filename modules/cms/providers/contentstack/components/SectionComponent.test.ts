import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type {
  SectionComponent,
  TextComponent,
  ImageComponent,
  File,
} from '../types/gen/contentstack'
import SectionComponentVue from './SectionComponent.vue'
import ContentstackComponent from './ContentstackComponent.vue'

vi.mock('./ContentstackComponent.vue', () => ({
  default: {
    name: 'ContentstackComponent',
    template:
      '<div data-testid="contentstack-child">Mock Contentstack Component</div>',
    props: ['contentElement'],
  },
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      storefrontUI: {
        breakpoints: {
          lg: 1024,
        },
      },
    },
    app: {
      baseURL: '/',
    },
  })),
  useNuxtApp: vi.fn(() => ({
    $img: {
      options: {
        format: ['webp', 'jpeg'],
      },
      getImage: vi.fn((url: string) => ({ url })),
      getSizes: vi.fn((src, options) => ({
        src: src,
        srcset: `${src} 1x, ${src} 2x`,
        sizes: options.sizes || '100vw',
      })),
    },
    _img: null,
    ssrContext: null,
  })),
}))

vi.mock('~~/modules/cms/utils/image', () => ({
  getImageSources: vi.fn(() => [
    {
      src: 'https://example.com/image.webp',
      type: 'image/webp',
      sizes: '100vw',
      srcset: 'https://example.com/image.webp 1x',
      media: '(width >= 1024px)',
    },
  ]),
  getImageSizes: vi.fn(() => '100vw'),
}))

describe('Contentstack Section Component', () => {
  const createWrapper = (
    contentElement: {
      background_color?: SectionComponent['background_color']
      padding?: SectionComponent['padding']
      content?: SectionComponent['content']
      background_image_desktop?: SectionComponent['background_image_desktop']
      background_image_mobile?: SectionComponent['background_image_mobile']
    } & Partial<
      Omit<SectionComponent, 'background_color' | 'padding' | 'content'>
    >,
  ) => {
    return mount(SectionComponentVue, {
      props: {
        contentElement: {
          uid: 'test-section',
          _content_type_uid: 'section-component',
          background_color: contentElement.background_color,
          padding: contentElement.padding,
          content: contentElement.content || [],
          background_image_desktop: contentElement.background_image_desktop,
          background_image_mobile: contentElement.background_image_mobile,
        } as SectionComponent,
      },
      global: {
        components: {
          ContentstackComponent,
        },
      },
    })
  }

  const mockBackgroundImage = {
    url: 'https://images.contentstack.io/abc123/1920x1080/bg-image.jpg',
  } as unknown as File

  const mockMobileBackgroundImage = {
    url: 'https://images.contentstack.io/def456/800x600/bg-mobile.jpg',
  } as unknown as File

  const mockChildContent = [
    {
      uid: 'text-1',
      _content_type_uid: 'text-component',
      content: 'Test content',
    } as TextComponent,
    {
      uid: 'image-1',
      _content_type_uid: 'image-component',
      alt_text: 'Test image',
    } as ImageComponent,
  ]

  it('renders section element with basic props', () => {
    const wrapper = createWrapper({
      background_color: '#f0f0f0',
      padding: 'medium',
      content: mockChildContent,
    })

    const section = wrapper.find('section')
    expect(section.exists()).toBe(true)
    const content = section.find('div')
    expect(content.classes()).toContain('p-5')
    expect(content.classes()).toContain('lg:p-9')
  })

  it.each([
    { padding: 'small', expectedClasses: ['p-3', 'lg:p-5'] },
    { padding: 'medium', expectedClasses: ['p-5', 'lg:p-9'] },
    { padding: 'large', expectedClasses: ['p-9', 'lg:p-12'] },
    { padding: 'none', expectedClasses: ['p-0'] },
    { padding: undefined, expectedClasses: ['p-0'] }, // default
  ])(
    'applies correct padding class for padding: $padding',
    ({ padding, expectedClasses }) => {
      const wrapper = createWrapper({
        padding: padding as 'small' | 'medium' | 'large' | 'none',
        content: [],
      })

      for (const expectedClass of expectedClasses) {
        expect(wrapper.find('section > div').classes()).toContain(expectedClass)
      }
    },
  )

  it('applies background color correctly', () => {
    const wrapper = createWrapper({
      background_color: '#ff0000',
      background_image_desktop: mockBackgroundImage,
      content: [],
    })

    const section = wrapper.find('section')
    const style = section.attributes('style')
    expect(style).toContain('background-color: #ff0000')
  })

  it('applies background images correctly', () => {
    const wrapper = createWrapper({
      background_image_desktop: mockBackgroundImage,
      background_image_mobile: mockMobileBackgroundImage,
      content: [],
    })

    const section = wrapper.find('section')
    expect(section.classes()).toContain('relative')
    const picture = section.find('picture')
    expect(picture.exists()).toBe(true)
  })

  it('falls back to desktop image when mobile image is not provided', () => {
    const wrapper = createWrapper({
      background_image_desktop: mockBackgroundImage,
      content: [],
    })

    const section = wrapper.find('section')
    expect(section.classes()).toContain('relative')
    const picture = section.find('picture')
    expect(picture.exists()).toBe(true)
  })

  it('renders child components correctly', () => {
    const wrapper = createWrapper({
      content: mockChildContent,
    })

    const childComponents = wrapper.findAllComponents({
      name: 'ContentstackComponent',
    })
    expect(childComponents).toHaveLength(2)
    expect(childComponents?.[0]?.props('contentElement')).toEqual(
      mockChildContent[0],
    )
    expect(childComponents?.[1]?.props('contentElement')).toEqual(
      mockChildContent[1],
    )
  })

  it('handles sections without background images', () => {
    const wrapper = createWrapper({
      background_color: '#f0f0f0',
      padding: 'medium',
      content: mockChildContent,
    })
    const section = wrapper.find('section')
    expect(section.findAll('picture')).toHaveLength(0)
    expect(section.exists()).toBe(true)
    const content = section.find('div')
    expect(content.classes()).toContain('p-5')
    expect(content.classes()).toContain('lg:p-9')
    const childComponents = content.findAllComponents({
      name: 'ContentstackComponent',
    })
    expect(childComponents).toHaveLength(2)
  })
})
