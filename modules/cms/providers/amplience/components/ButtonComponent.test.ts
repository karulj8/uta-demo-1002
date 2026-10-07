import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ButtonComponentVue from './ButtonComponent.vue'

vi.mock('~/composables', () => ({
  useRouteHelpers: () => ({
    getLocalizedRoute: (url: string) => url,
  }),
}))

describe('Amplience ButtonComponent', () => {
  it('mounts with label and link props', () => {
    const wrapper = mount(ButtonComponentVue, {
      props: {
        contentElement: {
          label: 'Shop now',
          link: '/sale',
          variant: 'primary',
        },
      },
      global: {
        stubs: {
          SFButton: {
            template: '<button><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Shop now')
  })
})
