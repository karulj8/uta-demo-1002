import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeSmartSortingProductsSliderComponentFields {
  smartSortingKey: EntryFieldTypes.Symbol<
    | 'Balanced Offerings'
    | 'Inventory Optimization'
    | 'Luxury Promotion'
    | 'New Arrivals'
    | 'Recently Popular'
    | 'Revenue Max'
    | 'Sales Push'
    | 'Stock Coverage'
    | 'Topseller'
    | 'Trending'
  >
  title?: EntryFieldTypes.Symbol
  categoryId?: EntryFieldTypes.Integer
  brandId?: EntryFieldTypes.Integer
  limit?: EntryFieldTypes.Integer
}

export type TypeSmartSortingProductsSliderComponentSkeleton = EntrySkeletonType<
  TypeSmartSortingProductsSliderComponentFields,
  'smartSortingProductsSliderComponent'
>
export type TypeSmartSortingProductsSliderComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeSmartSortingProductsSliderComponentSkeleton, Modifiers, Locales>

export function isTypeSmartSortingProductsSliderComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>,
): entry is TypeSmartSortingProductsSliderComponent<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'smartSortingProductsSliderComponent'
}

export type TypeSmartSortingProductsSliderComponentWithoutLinkResolutionResponse =
  TypeSmartSortingProductsSliderComponent<'WITHOUT_LINK_RESOLUTION'>
export type TypeSmartSortingProductsSliderComponentWithoutUnresolvableLinksResponse =
  TypeSmartSortingProductsSliderComponent<'WITHOUT_UNRESOLVABLE_LINKS'>
export type TypeSmartSortingProductsSliderComponentWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeSmartSortingProductsSliderComponent<'WITH_ALL_LOCALES', Locales>
export type TypeSmartSortingProductsSliderComponentWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeSmartSortingProductsSliderComponent<
  'WITHOUT_LINK_RESOLUTION' | 'WITH_ALL_LOCALES',
  Locales
>
export type TypeSmartSortingProductsSliderComponentWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeSmartSortingProductsSliderComponent<
  'WITHOUT_UNRESOLVABLE_LINKS' | 'WITH_ALL_LOCALES',
  Locales
>
