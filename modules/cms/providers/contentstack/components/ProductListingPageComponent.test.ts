import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref, Suspense } from 'vue'
import type { ProductlistingpageComponent } from '../types/gen/contentstack'
import ProductListingPageComponent from './ProductListingPageComponent.vue'

const { useCMSBySlugMock } = vi.hoisted(() => {
  return {
    useCMSBySlugMock: vi.fn(),
  }
})

// Mock the useCMSBySlug composable
vi.mock('../composables/useCMS', () => ({
  useCMSBySlug: useCMSBySlugMock,
}))

describe('Contentstack ProductListingPageComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (
    mockData: Partial<ProductlistingpageComponent> | null = null,
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
          ContentstackComponent: {
            name: 'ContentstackComponent',
            template:
              '<div data-testid="contentstack-component" :data-content-id="contentElement.uid">Mock ContentstackComponent</div>',
            props: ['contentElement'],
          },
        },
      },
    })
  }

  it('renders teaser content components when data is available', async () => {
    const mockTeaserContent = [
      {
        uid: 'teaser-1',
        _content_type_uid: 'text-component',
      },
      {
        uid: 'teaser-2',
        _content_type_uid: 'text-component',
      },
    ]

    const mockContent = {
      uid: 'plp-component',
      _content_type_uid: 'productlistingpage-component',
      teaser_content: mockTeaserContent,
    }

    const wrapper = createWrapper(
      mockContent as unknown as ProductlistingpageComponent,
    )

    await flushPromises()

    // Check that useCMSBySlug was called with correct parameters
    expect(useCMSBySlugMock).toHaveBeenCalledWith(
      'product-listing-page-123',
      expect.objectContaining({
        value: 'c/c-123',
      }),
      'productlistingpage-component',
    )

    // Check that ContentstackComponent is rendered for each teaser content item
    const contentstackComponents = wrapper.findAll(
      '[data-testid="contentstack-component"]',
    )

    expect(contentstackComponents).toHaveLength(2)
    // Check that the components have the correct content IDs
    expect(contentstackComponents[0]?.attributes('data-content-id')).toBe(
      'teaser-1',
    )
    expect(contentstackComponents[1]?.attributes('data-content-id')).toBe(
      'teaser-2',
    )
  })

  it('does not render anything when teaserContent is empty', async () => {
    const mockContent = {
      uid: 'plp-component',
      _content_type_uid: 'productlistingpage-component',
      teaser_content: [],
    }

    const wrapper = createWrapper(
      mockContent as unknown as ProductlistingpageComponent,
    )

    await flushPromises()

    const contentstackComponents = wrapper.findAll(
      '[data-testid="contentstack-component"]',
    )

    expect(contentstackComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is empty
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('does not render anything when teaserContent is undefined', async () => {
    const mockContent = {
      uid: 'plp-component',
      _content_type_uid: 'productlistingpage-component',
    }

    const wrapper = createWrapper(
      mockContent as unknown as ProductlistingpageComponent,
    )

    await flushPromises()

    const contentstackComponents = wrapper.findAll(
      '[data-testid="contentstack-component"]',
    )

    expect(contentstackComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is undefined
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('passes correct props to ContentstackComponent', async () => {
    const mockTeaserContent = [
      {
        uid: 'teaser-1',
        _content_type_uid: 'text-component',
      },
    ]

    const mockContent = {
      uid: 'plp-component',
      _content_type_uid: 'productlistingpage-component',
      teaser_content: mockTeaserContent,
    }

    const wrapper = createWrapper(
      mockContent as unknown as ProductlistingpageComponent,
    )

    await flushPromises()

    const contentstackComponent = wrapper.findComponent({
      name: 'ContentstackComponent',
    })

    expect(contentstackComponent.props()).toEqual({
      contentElement: mockTeaserContent[0],
    })
  })
})
