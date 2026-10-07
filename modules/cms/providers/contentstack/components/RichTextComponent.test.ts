import { afterAll, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import contentstackSdk from '@contentstack/delivery-sdk'
import type { RichtextComponent } from '../types/gen/contentstack'
import RichText from './RichTextComponent.vue'

const mockGetLocalizedRoute = vi.fn().mockImplementation((url: string) => url)

vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: mockGetLocalizedRoute,
  }),
}))

const jsonToHTMLSpy = vi.spyOn(contentstackSdk.Utils, 'jsonToHTML')

afterAll(() => {
  if (jsonToHTMLSpy) {
    jsonToHTMLSpy.mockRestore()
  }
})

describe('Contentstack RichText Component', () => {
  const createWrapper = (
    contentElement: {
      content?: unknown
    } & Partial<Omit<RichtextComponent, 'content'>>,
  ) => {
    return mount(RichText, {
      props: {
        contentElement: {
          uid: 'test-richtext',
          _content_type_uid: 'richtext-component',
          content: contentElement.content,
          ...contentElement,
        } as unknown as RichtextComponent,
      },
    })
  }

  it('renders simple paragraph content', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'p',
            attrs: {},
            children: [
              {
                text: 'Test paragraph content',
              },
            ],
          },
        ],
      },
    })

    expect(wrapper.html()).toContain('<p>Test paragraph content</p>')
  })

  it('renders h1 heading with custom styling', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'h1',
            children: [{ text: 'Main Heading' }],
          },
        ],
      },
    })

    expect(wrapper.html()).toContain(
      '<h1 class="text-3xl font-semibold">Main Heading</h1>',
    )
  })

  it('renders h2 heading with custom styling', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'h2',
            children: [{ text: 'Section Heading' }],
          },
        ],
      },
    })

    expect(wrapper.html()).toContain(
      '<h2 class="text-2xl font-semibold">Section Heading</h2>',
    )
  })

  it('renders h3 heading with custom styling', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'h3',
            children: [{ text: 'Subsection Heading' }],
          },
        ],
      },
    })

    expect(wrapper.html()).toContain(
      '<h3 class="text-xl font-semibold">Subsection Heading</h3>',
    )
  })

  it('renders hyperlinks with custom styling', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'p',
            children: [
              { text: 'Visit our ' },
              {
                type: 'a',
                attrs: {
                  url: 'https://example.com',
                  target: '_blank',
                },
                children: [{ text: 'website' }],
              },
            ],
          },
        ],
      },
    })
    const anchor = wrapper.find('a')
    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('href')).toBe('https://example.com')
    expect(anchor.text()).toBe('website')
    expect(anchor.classes()).toContain('font-semibold')
  })

  it('handles empty content gracefully', () => {
    const wrapper = createWrapper({
      content: '',
    })

    expect(wrapper.html()).toContain('<div')
    expect(wrapper.text()).toBe('')
  })

  it('renders multiple br elements for multiple empty paragraphs', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'p',
            children: [],
          },
          {
            type: 'p',
            children: [],
          },
          {
            type: 'p',
            children: [{ text: 'Some text' }],
          },
        ],
      },
    })

    expect(wrapper.findAll('br')).toHaveLength(2)
    expect(wrapper.findAll('p')).toHaveLength(1)
    expect(wrapper.find('p').text()).toBe('Some text')
  })
  it('renders ordered lists correctly', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'ol',
            children: [
              { type: 'li', children: [{ text: 'First item' }] },
              { type: 'li', children: [{ text: 'Second item' }] },
              { type: 'li', children: [{ text: 'Third item' }] },
            ],
          },
        ],
      },
    })

    const ol = wrapper.find('ol')
    expect(ol.exists()).toBe(true)
    const liItems = wrapper.findAll('ol > li')
    expect(liItems).toHaveLength(3)
    expect(liItems?.[0]?.text()).toBe('First item')
    expect(liItems?.[1]?.text()).toBe('Second item')
    expect(liItems?.[2]?.text()).toBe('Third item')
  })

  it('renders unordered lists correctly', () => {
    const wrapper = createWrapper({
      content: {
        type: 'doc',
        children: [
          {
            type: 'ul',
            children: [
              { type: 'li', children: [{ text: 'Apple' }] },
              { type: 'li', children: [{ text: 'Banana' }] },
            ],
          },
        ],
      },
    })

    const ul = wrapper.find('ul')
    expect(ul.exists()).toBe(true)
    const liItems = wrapper.findAll('ul > li')
    expect(liItems).toHaveLength(2)
    expect(liItems?.[0]?.text()).toBe('Apple')
    expect(liItems?.[1]?.text()).toBe('Banana')
  })
})
