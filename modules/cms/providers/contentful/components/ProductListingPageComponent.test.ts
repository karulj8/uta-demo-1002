import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref, Suspense } from 'vue'
import type { TypeProductListingPageComponentSkeleton } from '../types'
import ProductListingPageComponent from './ProductListingPageComponent.vue'

const { useCMSBySlugMock, useContentfulEditorMock } = vi.hoisted(() => {
  return {
    useCMSBySlugMock: vi.fn(),
    useContentfulEditorMock: vi.fn(),
  }
})

// Mock the useCMSBySlug composable
vi.mock('../composables/useCMS', () => ({
  useCMSBySlug: useCMSBySlugMock,
}))

// Mock the useContentfulEditor composable
vi.mock('../composables/useContentfulEditor', () => ({
  useContentfulEditor: useContentfulEditorMock,
}))

describe('Contentful ProductListingPageComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (
    mockData: Partial<TypeProductListingPageComponentSkeleton> | null = null,
  ) => {
    // Mock the return value of useCMSBySlug
    useCMSBySlugMock.mockResolvedValue({
      data: ref(mockData),
    })

    /**
     * Wraps the async component in a Suspense boundary for testing.
     *
     * Why this is needed:
     * - ProductListingPageComponent uses top-level `await` in <script setup>
     * - Components with top-level await become async components in Vue 3
     * - Async components must be wrapped in <Suspense> to render properly
     * - Without Suspense, the component won't mount and tests will fail
     *
     * How it works:
     * - Creates a wrapper component that renders a Suspense boundary
     * - The Suspense boundary handles the async component's Promise
     * - Once the Promise resolves, the component content is rendered
     * - This allows tests to access the fully mounted component DOM
     */
    const WrapperComponent = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () =>
              h(ProductListingPageComponent, {
                categoryId: 123,
                contentType: 'teaser',
              }),
          })
      },
    })

    return mount(WrapperComponent, {
      global: {
        stubs: {
          ContentfulComponent: {
            name: 'ContentfulComponent',
            template:
              '<div data-testid="contentful-component" :data-content-id="contentElement.sys.id">Mock ContentfulComponent</div>',
            props: ['contentElement'],
          },
        },
      },
    })
  }

  it('renders teaser content components when data is available', async () => {
    const mockTeaserContent = [
      {
        sys: { id: 'teaser-1' },
        fields: { title: 'First Teaser' },
      },
      {
        sys: { id: 'teaser-2' },
        fields: { title: 'Second Teaser' },
      },
    ]

    const mockContent = {
      sys: { id: 'plp-component' },
      fields: {
        slug: 'c/c-123',
        teaserContent: mockTeaserContent,
      },
    }

    const wrapper = createWrapper(
      mockContent as unknown as TypeProductListingPageComponentSkeleton,
    )

    await flushPromises()

    // Check that useCMSBySlug was called with correct parameters
    expect(useCMSBySlugMock).toHaveBeenCalledWith('product-listing-page-123', {
      content_type: 'productListingPageComponent',
      'fields.slug[match]': 'c/c-123',
    })

    // Check that ContentfulComponent is rendered for each teaser content item
    const contentfulComponents = wrapper.findAll(
      '[data-testid="contentful-component"]',
    )

    expect(contentfulComponents).toHaveLength(2)
    // Check that the components have the correct content IDs
    expect(contentfulComponents[0]?.attributes('data-content-id')).toBe(
      'teaser-1',
    )
    expect(contentfulComponents[1]?.attributes('data-content-id')).toBe(
      'teaser-2',
    )

    // Check that useContentfulEditor was called with the content
    expect(useContentfulEditorMock).toHaveBeenCalledWith(expect.any(Object))
  })

  it('does not render anything when teaserContent is empty', async () => {
    const mockContent = {
      sys: { id: 'plp-component' },
      fields: {
        slug: 'c/c-123',
        teaserContent: [],
      },
    }

    const wrapper = createWrapper(
      mockContent as unknown as TypeProductListingPageComponentSkeleton,
    )

    await flushPromises()

    const contentfulComponents = wrapper.findAll(
      '[data-testid="contentful-component"]',
    )

    expect(contentfulComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is empty
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('does not render anything when teaserContent is undefined', async () => {
    const mockContent = {
      sys: { id: 'plp-component' },
      fields: {
        slug: 'c/c-123',
      },
    }

    const wrapper = createWrapper(
      mockContent as unknown as TypeProductListingPageComponentSkeleton,
    )

    await flushPromises()

    const contentfulComponents = wrapper.findAll(
      '[data-testid="contentful-component"]',
    )

    expect(contentfulComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is undefined
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('passes correct props to ContentfulComponent', async () => {
    const mockTeaserContent = [
      {
        sys: { id: 'teaser-1' },
        fields: { title: 'Test Teaser' },
      },
    ]

    const mockContent = {
      sys: { id: 'plp-component' },
      fields: {
        slug: 'c/c-123',
        teaserContent: mockTeaserContent,
      },
    }

    const wrapper = createWrapper(
      mockContent as unknown as TypeProductListingPageComponentSkeleton,
    )

    await flushPromises()

    const contentfulComponent = wrapper.findComponent({
      name: 'ContentfulComponent',
    })

    expect(contentfulComponent.props()).toEqual({
      contentElement: mockTeaserContent[0],
    })
  })
})
