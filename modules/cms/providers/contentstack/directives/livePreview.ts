import type { DirectiveBinding } from 'vue'
import type { SystemFields } from '../types/gen/contentstack'

type LivePreviewData = {
  'data-cslp': never
  [key: string]: { 'data-cslp': string } | undefined
} & { 'data-cslp': string }

/**
 * Updates the live preview data attribute the given element.
 * @param el - The element to update the live preview data for.
 * @param binding - The directive binding.
 */
const updateLivePreviewData = <
  T extends SystemFields & { $?: LivePreviewData },
>(
  el: HTMLElement,
  binding: DirectiveBinding<T, 'loop', string | undefined>,
) => {
  // If the attribute was set with the loop modifier, don't overwrite it.
  // This allows parent components to set more specific live preview data from loops.
  if (!binding.modifiers.loop && el.hasAttribute('data-cslp-loop')) {
    return
  }

  const livePreviewData = binding.value.$
  const livePreviewFieldName = binding.arg
  let livePreviewAttribute: string | undefined

  if (livePreviewFieldName) {
    const fieldData = livePreviewData?.[livePreviewFieldName]
    livePreviewAttribute = fieldData?.['data-cslp']
  } else {
    livePreviewAttribute = livePreviewData?.['data-cslp']
  }
  // Set the data-cslp attribute
  if (livePreviewAttribute) {
    el.setAttribute('data-cslp', livePreviewAttribute)
  } else {
    el.removeAttribute('data-cslp')
  }
  // Mark that this was set with the loop modifier
  if (binding.modifiers.loop) {
    el.setAttribute('data-cslp-loop', 'true')
  } else {
    el.removeAttribute('data-cslp-loop')
  }
}

/**
 * This directive gets the live preview data from the passed cms component entity and sets the data-cslp attribute on the element.
 * This attribute is needed for the contentstack live preview to work.
 *
 * Within cms components, the diractive can be used to set the global cslp attribute for the component.
 *
 * @example
 * ```html
 * <div v-live-preview:content="contentElement" />
 * ```
 *
 * It can also be used to set the cslp attribute for a specific field of the component, by passing the field name as the argument. E.g. for the `title` of the component.
 *
 * @example
 * ```html
 * <div v-live-preview:title="contentElement" />
 * ```
 *
 * When looping over a collection of items (References or Modular Blocks), contentstack requires the correct  attribute from the parent component.
 * To achieve this, the directive accepts a modifier `loop` which allows the directive to be used in loops.
 *
 * @see https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-edit-tags-for-entries-with-rest#enable-support-for-multiple-field-actions-in-visual-builder
 *
 * @example
 * ```html
 * <div v-live-preview:content="data">
 *   <div v-for="(item, index) in data.content" :key="item.uid">
 *     <ContentstackComponent
 *      v-live-preview:[`content__${index}`].loop="data"
 *      :content-element="item"
 *     />
 *   </div>
 * </div>
 * ```
 */
export const vLivePreview = {
  beforeMount<T extends SystemFields & { $?: LivePreviewData }>(
    el: HTMLElement,
    binding: DirectiveBinding<T, 'loop', string | undefined>,
  ) {
    if (!binding.value) {
      return
    }

    updateLivePreviewData(el, binding)
  },
  updated<T extends SystemFields & { $?: LivePreviewData }>(
    el: HTMLElement,
    binding: DirectiveBinding<T, string, string | undefined>,
  ) {
    updateLivePreviewData(el, binding)
  },
}
