import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, ref, Suspense } from 'vue'
import type { PageComponent as PageComponentType } from '../types/gen'
import PageComponentVue from './PageComponent.vue'

const { useCMSBySlugMock } = vi.hoisted(() => ({
  useCMSBySlugMock: vi.fn(),
}))

vi.mock('../composables/useCMSBySlug', () => ({
  useCMSBySlug: useCMSBySlugMock,
}))

vi.mock('#app', () => ({
  useHead: vi.fn(),
  useRoute: () => ({ fullPath: '/content/about' }),
  useNuxtApp: () => ({ $config: { app: { baseURL: '/' } } }),
  useSeoMeta: vi.fn(),
}))

vi.mock('#i18n', () => ({
  useI18n: () => ({ defaultLocale: 'en-GB' }),
  useLocalePath: () => (path: string) => path,
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useAvailableShops: () => ref([]),
}))

vi.mock('~/composables', () => ({
  useRequestOrigin: () => 'https://example.com',
  useRouteHelpers: () => ({
    getLocalizedHref: (_locale: string, path: string) => path,
  }),
}))

vi.mock('../utils/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/helpers')>()
  return {
    ...actual,
    isInEditorMode: () => false,
  }
})

describe('Amplience PageComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createWrapper = (
    options: {
      data?: PageComponentType | null
      status?: string
      slug?: string
    } = {},
  ) => {
    const { data = null, status = 'success', slug = 'content/about' } = options

    useCMSBySlugMock.mockResolvedValue({
      data: ref(data),
      status: ref(status),
    })

    const WrapperComponent = defineComponent({
      setup() {
        return () =>
          h(Suspense, null, {
            default: () => h(PageComponentVue, { slug }),
          })
      },
    })

    return mount(WrapperComponent, {
      global: {
        stubs: {
          AmplienceComponent: {
            name: 'AmplienceComponent',
            template:
              '<div data-testid="amplience-component" :data-component-type="contentElement.componentType" />',
            props: ['contentElement'],
          },
        },
      },
    })
  }

  it('renders placeholder when content is missing', async () => {
    const wrapper = createWrapper({ data: null })
    await flushPromises()

    expect(wrapper.text()).toContain(
      'No content found for delivery key "content/about"',
    )
  })

  it('renders page components when content exists', async () => {
    const wrapper = createWrapper({
      data: {
        metaTitle: 'About us',
        metaDescription: 'About page',
        robots: 'index,follow',
        components: [{ componentType: 'text', text: { content: 'Hello' } }],
      } as PageComponentType,
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="amplience-component"]').exists()).toBe(
      true,
    )
    expect(useCMSBySlugMock).toHaveBeenCalledWith(
      'cms-content-content/about',
      'content/about',
    )
  })
})
