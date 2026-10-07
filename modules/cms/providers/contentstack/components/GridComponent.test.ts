import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { GridComponent, TextComponent } from '../types/gen/contentstack'
import GridComponentVue from './GridComponent.vue'

// Mock ContentstackComponent - simplified stub for testing
const MockContentstackComponent = {
  name: 'ContentstackComponent',
  template: '<div class="mock-content">Mock Content</div>',
  props: ['contentElement'],
}

const mocks = vi.hoisted(() => {
  return {
    provideMock: vi.fn(),
    route: {
      query: { sort: '', page: '' },
      path: '/test',
    } as unknown as RouteLocationNormalizedLoadedGeneric,
  }
})

vi.mock('#app/composables/router', () => ({
  useRoute: vi.fn().mockReturnValue(mocks.route),
}))

describe('Contentstack GridComponent', () => {
  const createWrapper = (
    contentElement: {
      desktop?: Partial<GridComponent['desktop']>
      mobile?: Partial<GridComponent['mobile']>
      content?: GridComponent['content']
      vertical_content_alignment?: GridComponent['vertical_content_alignment']
      horizontal_content_alignmen?: GridComponent['horizontal_content_alignmen']
    } & Partial<Omit<GridComponent, 'desktop' | 'mobile' | 'content'>>,
    global?: ComponentMountingOptions<typeof GridComponentVue>['global'],
  ) => {
    return mount(GridComponentVue, {
      props: {
        contentElement: {
          uid: 'test-grid',
          _content_type_uid: 'grid-component',
          desktop: {
            number_of_columns_desktop: 2,
            gap_column_desktop: 'none',
            gap_row_desktop: 'none',
            ...contentElement.desktop,
          },
          mobile: {
            number_of_columns_mobile: 1,
            gap_column_mobile: 'none',
            gap_row_mobile: 'none',
            ...contentElement.mobile,
          },
          content: contentElement.content || [],
          vertical_content_alignment: contentElement.vertical_content_alignment,
          horizontal_content_alignmen:
            contentElement.horizontal_content_alignmen,
        } as GridComponent,
      },
      global: {
        ...(global || {}),
        stubs: {
          ...(global?.stubs || {}),
          ContentstackComponent: MockContentstackComponent,
        },
      },
    })
  }

  describe('desktop columns', () => {
    it('renders 1 column grid on desktop', () => {
      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 1,
        },
        mobile: {
          number_of_columns_mobile: 1,
        },
        content: [],
      })

      expect(wrapper.classes()).toContain('lg:grid-cols-1')
    })

    it('defaults to 2 columns for invalid values', () => {
      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 999,
        },
        mobile: {
          number_of_columns_mobile: 1,
        },
        content: [],
      })

      expect(wrapper.classes()).toContain('lg:grid-cols-2')
    })
  })

  describe('mobile columns', () => {
    it('renders 2 column grid on mobile', () => {
      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 2,
        },
        mobile: {
          number_of_columns_mobile: 2,
        },
        content: [],
      })

      expect(wrapper.classes()).toContain('grid-cols-2')
    })

    it('defaults to 1 column for invalid values', () => {
      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 2,
        },
        mobile: {
          number_of_columns_mobile: 999,
        },
        content: [],
      })

      expect(wrapper.classes()).toContain('grid-cols-1')
    })
  })

  describe('gaps', () => {
    it.each([
      {
        name: 'no gap by default',
        gapColumnDesktop: undefined,
        gapColumnMobile: undefined,
        gapRowDesktop: undefined,
        gapRowMobile: undefined,
        expectedClasses: ['lg:gap-x-0', 'gap-x-0', 'lg:gap-y-0', 'gap-y-0'],
      },
      {
        name: 'small gaps',
        gapColumnDesktop: 'small' as const,
        gapColumnMobile: 'small' as const,
        gapRowDesktop: 'small' as const,
        gapRowMobile: 'small' as const,
        expectedClasses: ['lg:gap-x-7', 'gap-x-3', 'lg:gap-y-7', 'gap-y-3'],
      },
      {
        name: 'medium gaps',
        gapColumnDesktop: 'medium' as const,
        gapColumnMobile: 'medium' as const,
        gapRowDesktop: 'medium' as const,
        gapRowMobile: 'medium' as const,
        expectedClasses: ['lg:gap-x-9', 'gap-x-5', 'lg:gap-y-9', 'gap-y-5'],
      },
      {
        name: 'large gaps',
        gapColumnDesktop: 'large' as const,
        gapColumnMobile: 'large' as const,
        gapRowDesktop: 'large' as const,
        gapRowMobile: 'large' as const,
        expectedClasses: ['lg:gap-x-12', 'gap-x-9', 'lg:gap-y-12', 'gap-y-9'],
      },
      {
        name: 'none gaps explicitly',
        gapColumnDesktop: 'none' as const,
        gapColumnMobile: 'none' as const,
        gapRowDesktop: 'none' as const,
        gapRowMobile: 'none' as const,
        expectedClasses: ['lg:gap-x-0', 'gap-x-0', 'lg:gap-y-0', 'gap-y-0'],
      },
    ])(
      'applies $name',
      ({
        gapColumnDesktop,
        gapColumnMobile,
        gapRowDesktop,
        gapRowMobile,
        expectedClasses,
      }) => {
        const wrapper = createWrapper({
          desktop: {
            number_of_columns_desktop: 2,
            gap_column_desktop: gapColumnDesktop,
            gap_row_desktop: gapRowDesktop,
          },
          mobile: {
            number_of_columns_mobile: 1,
            gap_column_mobile: gapColumnMobile,
            gap_row_mobile: gapRowMobile,
          },
          content: [],
        })

        expectedClasses.forEach((expectedClass) => {
          expect(wrapper.classes()).toContain(expectedClass)
        })
      },
    )
  })

  describe('component structure', () => {
    it('renders with content when content has elements', () => {
      const mockContent = [
        {
          uid: 'content-1',
          _content_type_uid: 'text-component',
        } as unknown as TextComponent,
        {
          uid: 'content-2',
          _content_type_uid: 'text-component',
        } as unknown as TextComponent,
      ]

      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 2,
        },
        mobile: {
          number_of_columns_mobile: 1,
        },
        content: mockContent,
      })

      // Check that the template is rendered and has v-for elements
      expect(wrapper.html()).toContain('Mock Content')
    })

    it('handles empty content gracefully', () => {
      const wrapper = createWrapper({
        desktop: {
          number_of_columns_desktop: 2,
        },
        mobile: {
          number_of_columns_mobile: 1,
        },
        content: [],
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('grid')
    })
  })

  it('should provide the correct viewport fractions', () => {
    vi.mock('vue', async (importOriginal) => {
      const actual = (await importOriginal()) as typeof import('vue')
      return {
        ...actual,
        provide: mocks.provideMock,
      }
    })

    createWrapper({
      desktop: {
        number_of_columns_desktop: 2,
      },
      mobile: {
        number_of_columns_mobile: 1,
      },
      content: [],
    })

    expect(mocks.provideMock).toHaveBeenCalledWith('cmsContext', {
      desktopViewportFraction: expect.objectContaining({ value: 0.5 }),
      mobileViewportFraction: expect.objectContaining({ value: 1 }),
      maxWidths: {},
    })
  })
  it('should combine the viewport fractions', () => {
    vi.mock('vue', async (importOriginal) => {
      const actual = (await importOriginal()) as typeof import('vue')
      return {
        ...actual,
        provide: mocks.provideMock,
      }
    })
    createWrapper(
      {
        desktop: {
          number_of_columns_desktop: 2,
        },
        mobile: {
          number_of_columns_mobile: 1,
        },
        content: [],
      },
      {
        provide: {
          cmsContext: {
            desktopViewportFraction: ref(0.5),
            mobileViewportFraction: ref(1),
          },
        },
      },
    )
    expect(mocks.provideMock).toHaveBeenCalledWith('cmsContext', {
      desktopViewportFraction: expect.objectContaining({ value: 0.25 }),
      mobileViewportFraction: expect.objectContaining({ value: 1 }),
    })
  })
})
