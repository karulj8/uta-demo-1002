import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeRecentlyViewedProductsComponentFields {
  padding?: EntryFieldTypes.Symbol<'large' | 'medium' | 'none' | 'small'>
}

export type TypeRecentlyViewedProductsComponentSkeleton = EntrySkeletonType<
  TypeRecentlyViewedProductsComponentFields,
  'RecentlyViewedProductsComponent'
>
export type TypeRecentlyViewedProductsComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeRecentlyViewedProductsComponentSkeleton, Modifiers, Locales>

export function isTypeRecentlyViewedProductsComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>,
): entry is TypeRecentlyViewedProductsComponent<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'RecentlyViewedProductsComponent'
}

export type TypeRecentlyViewedProductsComponentWithoutLinkResolutionResponse =
  TypeRecentlyViewedProductsComponent<'WITHOUT_LINK_RESOLUTION'>
export type TypeRecentlyViewedProductsComponentWithoutUnresolvableLinksResponse =
  TypeRecentlyViewedProductsComponent<'WITHOUT_UNRESOLVABLE_LINKS'>
export type TypeRecentlyViewedProductsComponentWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeRecentlyViewedProductsComponent<'WITH_ALL_LOCALES', Locales>
export type TypeRecentlyViewedProductsComponentWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeRecentlyViewedProductsComponent<
  'WITHOUT_LINK_RESOLUTION' | 'WITH_ALL_LOCALES',
  Locales
>
export type TypeRecentlyViewedProductsComponentWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeRecentlyViewedProductsComponent<
  'WITHOUT_UNRESOLVABLE_LINKS' | 'WITH_ALL_LOCALES',
  Locales
>
