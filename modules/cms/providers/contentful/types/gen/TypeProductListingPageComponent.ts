import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'
import type { TypeAccordionComponentSkeleton } from './TypeAccordionComponent'
import type { TypeButtonComponentSkeleton } from './TypeButtonComponent'
import type { TypeDividerComponentSkeleton } from './TypeDividerComponent'
import type { TypeGridComponentSkeleton } from './TypeGridComponent'
import type { TypeImageComponentSkeleton } from './TypeImageComponent'
import type { TypeLinkComponentSkeleton } from './TypeLinkComponent'
import type { TypeProductSliderComponentSkeleton } from './TypeProductSliderComponent'
import type { TypeRecentlyViewedProductsComponentSkeleton } from './TypeRecentlyViewedProductsComponent'
import type { TypeRichTextComponentSkeleton } from './TypeRichTextComponent'
import type { TypeSectionComponentSkeleton } from './TypeSectionComponent'
import type { TypeSliderComponentSkeleton } from './TypeSliderComponent'
import type { TypeTextComponentSkeleton } from './TypeTextComponent'
import type { TypeVideoComponentSkeleton } from './TypeVideoComponent'

export interface TypeProductListingPageComponentFields {
  title?: EntryFieldTypes.Symbol
  slug: EntryFieldTypes.Symbol
  teaserContent?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<
      | TypeImageComponentSkeleton
      | TypeSectionComponentSkeleton
      | TypeSliderComponentSkeleton
      | TypeTextComponentSkeleton
    >
  >
  seoContent?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<
      | TypeAccordionComponentSkeleton
      | TypeButtonComponentSkeleton
      | TypeDividerComponentSkeleton
      | TypeGridComponentSkeleton
      | TypeImageComponentSkeleton
      | TypeLinkComponentSkeleton
      | TypeProductSliderComponentSkeleton
      | TypeRecentlyViewedProductsComponentSkeleton
      | TypeRichTextComponentSkeleton
      | TypeSectionComponentSkeleton
      | TypeSliderComponentSkeleton
      | TypeTextComponentSkeleton
      | TypeVideoComponentSkeleton
    >
  >
}

export type TypeProductListingPageComponentSkeleton = EntrySkeletonType<
  TypeProductListingPageComponentFields,
  'productListingPageComponent'
>
export type TypeProductListingPageComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeProductListingPageComponentSkeleton, Modifiers, Locales>

export function isTypeProductListingPageComponent<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>,
): entry is TypeProductListingPageComponent<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'productListingPageComponent'
}

export type TypeProductListingPageComponentWithoutLinkResolutionResponse =
  TypeProductListingPageComponent<'WITHOUT_LINK_RESOLUTION'>
export type TypeProductListingPageComponentWithoutUnresolvableLinksResponse =
  TypeProductListingPageComponent<'WITHOUT_UNRESOLVABLE_LINKS'>
export type TypeProductListingPageComponentWithAllLocalesResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductListingPageComponent<'WITH_ALL_LOCALES', Locales>
export type TypeProductListingPageComponentWithAllLocalesAndWithoutLinkResolutionResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductListingPageComponent<
  'WITHOUT_LINK_RESOLUTION' | 'WITH_ALL_LOCALES',
  Locales
>
export type TypeProductListingPageComponentWithAllLocalesAndWithoutUnresolvableLinksResponse<
  Locales extends LocaleCode = LocaleCode,
> = TypeProductListingPageComponent<
  'WITHOUT_UNRESOLVABLE_LINKS' | 'WITH_ALL_LOCALES',
  Locales
>
