import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RichText from './RichTextComponent.vue'

const mockGetLocalizedRoute = vi.fn().mockImplementation((url: string) => url)

vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: mockGetLocalizedRoute,
  }),
}))

describe('Amplience RichTextComponent', () => {
  const createWrapper = (content: string) => {
    return mount(RichText, {
      props: {
        contentElement: {
          content,
        },
      },
    })
  }

  it('renders simple paragraph content', () => {
    const wrapper = createWrapper('Test paragraph content')

    expect(wrapper.html()).toContain(
      '<p class="mb-4">Test paragraph content</p>',
    )
  })

  it('keeps spacing for an empty line between paragraphs', () => {
    const wrapper = createWrapper('First paragraph\n\nSecond paragraph')
    const paragraphs = wrapper.findAll('p')

    // A single Markdown paragraph break relies on `mb-4`; no extra `<br>`.
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.text()).toBe('First paragraph')
    expect(paragraphs[1]?.text()).toBe('Second paragraph')
    expect(wrapper.findAll('br')).toHaveLength(0)
  })

  it('renders multiple blank lines between paragraphs', () => {
    const wrapper = createWrapper('First paragraph\n\n\n\nSecond paragraph')
    const paragraphs = wrapper.findAll('p')

    // `\n\n\n\n` => two newlines beyond the paragraph break => two `<br>`.
    expect(paragraphs).toHaveLength(2)
    expect(paragraphs[0]?.text()).toBe('First paragraph')
    expect(paragraphs[1]?.text()).toBe('Second paragraph')
    expect(wrapper.findAll('br')).toHaveLength(2)
  })

  it('preserves surrounding paragraphs when Amplience inserts HTML breaks', () => {
    const wrapper = createWrapper(
      'First paragraph\n\n<br><br>\n\nSecond paragraph',
    )

    expect(wrapper.text()).toContain('First paragraph')
    expect(wrapper.text()).toContain('Second paragraph')
  })

  it('renders markdown bold text', () => {
    const wrapper = createWrapper('Paragraph with **bold** text.')

    expect(wrapper.html()).toContain('<strong>bold</strong>')
  })

  it('renders h1 heading with custom styling', () => {
    const wrapper = createWrapper('# Main Heading')

    expect(wrapper.html()).toContain(
      '<h1 class="text-3xl font-semibold">Main Heading</h1>',
    )
  })

  it('renders h2 heading with custom styling', () => {
    const wrapper = createWrapper('## Section Heading')

    expect(wrapper.html()).toContain(
      '<h2 class="text-2xl font-semibold">Section Heading</h2>',
    )
  })

  it('renders h3 heading with custom styling', () => {
    const wrapper = createWrapper('### Subsection Heading')

    expect(wrapper.html()).toContain(
      '<h3 class="text-xl font-semibold">Subsection Heading</h3>',
    )
  })

  it('renders hyperlinks with custom styling', () => {
    const wrapper = createWrapper('Visit our [website](https://example.com)')

    expect(wrapper.html()).toContain(
      '<a href="https://example.com" class="font-semibold">website</a>',
    )
  })

  it('localizes internal hyperlinks', () => {
    mockGetLocalizedRoute.mockReturnValueOnce('/de/about')

    const wrapper = createWrapper('Read our [about page](/about)')

    expect(mockGetLocalizedRoute).toHaveBeenCalledWith('/about')
    expect(wrapper.html()).toContain(
      '<a href="/de/about" class="font-semibold">about page</a>',
    )
  })

  it('renders underlined text authored as <u> HTML', () => {
    const wrapper = createWrapper('Paragraph with <u>underlined</u> text.')

    expect(wrapper.html()).toContain('<u>underlined</u>')
  })

  it('renders formatting nested inside underlined text', () => {
    const wrapper = createWrapper('<u>underlined **and bold**</u>')

    expect(wrapper.html()).toContain(
      '<u>underlined <strong>and bold</strong></u>',
    )
  })

  it('keeps extra blank lines inside a list visible', () => {
    const wrapper = createWrapper('- First item\n\n\n- Second item')

    // One extra blank line beyond the loose-list break (`\n\n\n`) becomes one
    // `<br>` in the list (absorbedNewlines: 1), matching Amplience 1:1.
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]?.text()).toContain('First item')
    expect(items[1]?.text()).toContain('Second item')
    expect(wrapper.findAll('br')).toHaveLength(1)
  })

  it('keeps multiple extra blank lines inside a list visible', () => {
    const wrapper = createWrapper('- First item\n\n\n\n- Second item')

    // Two extra blank lines (`\n\n\n\n` → space with 3 newlines) => two `<br>`.
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.findAll('br')).toHaveLength(2)
  })

  it('keeps a blank line inside a list item visible', () => {
    const wrapper = createWrapper('- line1\n\n  line2')
    const listItem = wrapper.find('li')

    expect(listItem.findAll('p')).toHaveLength(2)
    expect(listItem.findAll('p')[0]?.text()).toBe('line1')
    expect(listItem.findAll('p')[1]?.text()).toBe('line2')
    // One blank line (`\n\n` space token) => one `<br>`.
    expect(listItem.findAll('br')).toHaveLength(1)
  })

  it('renders unordered list with custom styling', () => {
    const wrapper = createWrapper('- First item\n- Second item')

    expect(wrapper.html()).toContain('list-disc')
    expect(wrapper.html()).toContain('space-y-4')
    expect(wrapper.html()).toContain('pl-6')
    expect(wrapper.html()).toContain('<li>First item</li>')
    expect(wrapper.html()).toContain('<li>Second item</li>')
  })

  it('renders bold formatting inside list items', () => {
    const wrapper = createWrapper('- **Purpose:** Foo\n- *Usage:* Bar')

    expect(wrapper.html()).toContain('list-disc')
    expect(wrapper.html()).toContain('<strong>Purpose:</strong>')
    expect(wrapper.html()).toContain('<em>Usage:</em>')
    expect(wrapper.html()).not.toContain('**Purpose:**')
    expect(wrapper.html()).not.toContain('*Usage:*')
  })

  it('renders nested lists inside list items', () => {
    const wrapper = createWrapper('- Parent\n  - Child')

    const lists = wrapper.findAll('ul')
    expect(lists).toHaveLength(2)
    expect(lists[0]?.classes()).toContain('list-disc')
    expect(lists[1]?.classes()).toContain('list-disc')
    expect(wrapper.html()).toContain('<li>Parent')
    expect(wrapper.html()).toContain('<li>Child</li>')
    expect(lists[0]?.find('ul').exists()).toBe(true)
  })

  it('renders ordered list with custom styling', () => {
    const wrapper = createWrapper('1. Step one\n2. Step two')

    expect(wrapper.html()).toContain('list-decimal')
    expect(wrapper.html()).toContain('space-y-4')
    expect(wrapper.html()).toContain('pl-6')
    expect(wrapper.html()).toContain('<li>Step one</li>')
    expect(wrapper.html()).toContain('<li>Step two</li>')
  })

  it('renders complex content with multiple elements', () => {
    const wrapper = createWrapper(
      '# Getting Started\n\nWelcome to our guide. Please visit our [documentation](https://docs.example.com) for details.\n\n## Steps to follow:\n\n1. Read the documentation',
    )

    expect(wrapper.html()).toContain(
      '<h1 class="text-3xl font-semibold">Getting Started</h1>',
    )
    expect(wrapper.html()).toContain(
      '<a href="https://docs.example.com" class="font-semibold">documentation</a>',
    )
    expect(wrapper.html()).toContain(
      '<h2 class="text-2xl font-semibold">Steps to follow:</h2>',
    )
    expect(wrapper.html()).toContain('list-decimal')
  })

  it('handles empty content gracefully', () => {
    const wrapper = createWrapper('')

    expect(wrapper.html()).toContain('data-amplience-field-id="content"')
    expect(wrapper.text()).toBe('')
  })
})
