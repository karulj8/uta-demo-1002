import { describe, it, expect, vi } from 'vitest'
import type { TrackingSorting } from '../types'
import { useFilterEvents } from './useFilterEvents'

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
  }
})

vi.mock('./useTracking', () => ({
  useTracking: vi.fn(() => ({
    push: mocks.push,
  })),
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))

describe('useFilterEvents', () => {
  describe('trackApplyFilter', () => {
    it('should track filter event with string name', () => {
      const { trackApplyFilter } = useFilterEvents()

      trackApplyFilter('color', 'Red')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'apply',
        type: 'color',
        value: 'Red',
      })
    })

    it('should track filter event with boolean name', () => {
      const { trackApplyFilter } = useFilterEvents()

      trackApplyFilter('sale', true)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'apply',
        type: 'sale',
        value: true,
      })
    })

    it.each([
      { slug: 'size', name: 'M' },
      { slug: 'brand', name: 'Nike' },
      { slug: 'price_range', name: '50-100' },
      { slug: 'category', name: 'Shoes' },
    ])(
      'should track filter event with %s slug and %s name',
      ({ slug, name }) => {
        const { trackApplyFilter } = useFilterEvents()

        trackApplyFilter(slug, name)

        expect(mocks.push).toHaveBeenCalledWith({
          event: 'filter',
          action: 'apply',
          type: slug,
          value: name,
        })
      },
    )
  })

  describe('trackRemoveFilter', () => {
    it('should track filter event with string name', () => {
      const { trackRemoveFilter } = useFilterEvents()

      trackRemoveFilter('color', 'Red')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'remove',
        type: 'color',
        value: 'Red',
      })
    })
  })

  describe('trackResetFilter', () => {
    it('should track filter event with string name', () => {
      const { trackResetFilter } = useFilterEvents()

      trackResetFilter('color', 'Red')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'reset',
        type: 'color',
        value: 'Red',
      })
    })
  })

  describe('trackSorting', () => {
    it.each([
      { value: 'price_asc' },
      { value: 'price_desc' },
      { value: 'reduction_desc' },
      { value: 'top_seller' },
      { value: 'date_newest' },
    ])('should track sorting event with %s label', ({ value }) => {
      const { trackSorting } = useFilterEvents()

      trackSorting(value as TrackingSorting)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'apply',
        type: 'sorting',
        value: value,
      })
    })
  })

  describe('trackFilterView', () => {
    it('should track filter view event with true value', () => {
      const { trackFilterView } = useFilterEvents()

      trackFilterView(true)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'view',
        type: 'flyout',
        value: 'open',
      })
    })

    it('should track filter view event with false value', () => {
      const { trackFilterView } = useFilterEvents()

      trackFilterView(false)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'view',
        type: 'flyout',
        value: 'close',
      })
    })
  })

  describe('trackViewAll', () => {
    it('should track view all event', () => {
      const { trackViewAll } = useFilterEvents()

      trackViewAll()

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'filter',
        action: 'view',
        type: 'flyout',
        value: 'view_all',
      })
    })
  })
})
