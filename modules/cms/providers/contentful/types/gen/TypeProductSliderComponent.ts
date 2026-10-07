import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeProductSliderComponentFields {
  title?: EntryFieldTypes.Symbol
  products?: EntryFieldTypes.Object
}

export type TypeProductSliderComponentSkeleton = EntrySkeletonType<
  TypeProductSliderComponentFields,
  'productSliderComponent'
>
export type TypeProductSliderComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeProductSliderComponentSkeleton, Modifiers, Locales>

export function isTypeProductSliderComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>,
): entry is TypeProductSliderComponent<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'productSliderComponent'
}

export type TypeProductSliderComponentWithoutLinkResolutionResponse =
  TypeProductSliderComponent<'WITHOUT_LINK_RESOLUTION'>
export type TypeProductSliderComponentWithoutUnresolvableLinksResponse =
  TypeProductSliderComponent<'WITHOUT_UNRESOLVABLE_LINKS'>
export type TypeProductSliderComponentWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductSliderComponent<'WITH_ALL_LOCALES', Locales>
export type TypeProductSliderComponentWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductSliderComponent<
  'WITHOUT_LINK_RESOLUTION' | 'WITH_ALL_LOCALES',
  Locales
>
export type TypeProductSliderComponentWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductSliderComponent<
  'WITHOUT_UNRESOLVABLE_LINKS' | 'WITH_ALL_LOCALES',
  Locales
>
