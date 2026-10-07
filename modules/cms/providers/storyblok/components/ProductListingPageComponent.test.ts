import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref, Suspense } from 'vue'
import type { ProductListingPageComponent } from '../types'
import ProductListingPageComponentVue from './ProductListingPageComponent.vue'

const { useCMSBySlugMock, useStoryblokEditorMock } = vi.hoisted(() => {
  return {
    useCMSBySlugMock: vi.fn(),
    useStoryblokEditorMock: vi.fn(),
  }
})

// Mock the useCMSBySlug composable
vi.mock('../composables/useCMS', () => ({
  useCMSBySlug: useCMSBySlugMock,
}))

// Mock the useStoryblokEditor composable
vi.mock('../composables/useStoryblokEditor', () => ({
  useStoryblokEditor: useStoryblokEditorMock,
}))

describe('Storyblok ProductListingPageComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (
    mockData: { data: { story: ProductListingPageComponent } } | null = null,
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
              h(ProductListingPageComponentVue, {
                categoryId: 123,
                contentType: 'teaser',
              }),
          })
      },
    })

    return mount(WrapperComponent, {
      global: {
        stubs: {
          StoryblokComponent: {
            name: 'StoryblokComponent',
            template:
              '<div data-testid="storyblok-component" :data-content-uid="contentElement._uid">Mock StoryblokComponent</div>',
            props: ['contentElement'],
          },
        },
        directives: {
          editable: {},
        },
      },
    })
  }

  it('renders teaser content components when data is available', async () => {
    const mockTeaserContent = [
      {
        _uid: 'teaser-1',
        component: 'ImageComponent',
        title: 'First Teaser',
      },
      {
        _uid: 'teaser-2',
        component: 'SectionComponent',
        title: 'Second Teaser',
      },
    ]

    const mockContent = {
      data: {
        story: {
          _uid: 'plp-story',
          component: 'ProductListingPageComponent',
          content: {
            teaserContent: mockTeaserContent,
          },
        } as ProductListingPageComponent,
      },
    }

    const wrapper = createWrapper(mockContent)

    await flushPromises()

    // Check that useCMSBySlug was called with correct parameters
    expect(useCMSBySlugMock).toHaveBeenCalledWith(
      'product-listing-page-123',
      expect.objectContaining({
        value: 'c/c-123',
      }),
    )

    // Check that StoryblokComponent is rendered for each teaser content item
    const storyblokComponents = wrapper.findAll(
      '[data-testid="storyblok-component"]',
    )

    expect(storyblokComponents).toHaveLength(2)
    // Check that the components have the correct content UIDs
    expect(storyblokComponents[0]?.attributes('data-content-uid')).toBe(
      'teaser-1',
    )
    expect(storyblokComponents[1]?.attributes('data-content-uid')).toBe(
      'teaser-2',
    )

    // Check that useStoryblokEditor was called with the content
    expect(useStoryblokEditorMock).toHaveBeenCalledWith(expect.any(Object))
  })

  it('does not render anything when teaserContent is empty', async () => {
    const mockContent = {
      data: {
        story: {
          _uid: 'plp-story',
          component: 'ProductListingPageComponent',
          content: {
            teaserContent: [],
          },
        } as ProductListingPageComponent,
      },
    }

    const wrapper = createWrapper(mockContent)

    await flushPromises()

    const storyblokComponents = wrapper.findAll(
      '[data-testid="storyblok-component"]',
    )

    expect(storyblokComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is empty
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('does not render anything when teaserContent is undefined', async () => {
    const mockContent = {
      data: {
        story: {
          _uid: 'plp-story',
          component: 'ProductListingPageComponent',
          content: {},
        } as ProductListingPageComponent,
      },
    }

    const wrapper = createWrapper(mockContent)

    await flushPromises()

    const storyblokComponents = wrapper.findAll(
      '[data-testid="storyblok-component"]',
    )

    expect(storyblokComponents).toHaveLength(0)
    // The div should not be rendered when teaserContent is undefined
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('passes correct props to StoryblokComponent', async () => {
    const mockTeaserContent = [
      {
        _uid: 'teaser-1',
        component: 'TextComponent',
        title: 'Test Teaser',
      },
    ]

    const mockContent = {
      data: {
        story: {
          _uid: 'plp-story',
          component: 'ProductListingPageComponent',
          content: {
            teaserContent: mockTeaserContent,
          },
        } as ProductListingPageComponent,
      },
    }

    const wrapper = createWrapper(mockContent)

    await flushPromises()

    const storyblokComponent = wrapper.findComponent({
      name: 'StoryblokComponent',
    })

    expect(storyblokComponent.props()).toEqual({
      contentElement: mockTeaserContent[0],
    })
  })
})
