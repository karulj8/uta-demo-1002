import { defineComponent, h } from 'vue'
import type { SbVueRichTextComponentMap } from '@storyblok/vue'
import type { StoryblokMultilink } from '../types/gen/storyblok'
import { isExternalLink } from '~/utils'
import type { RouteLocationAsPath, RouteLocationRaw } from '#vue-router'

/** Tailwind classes applied per Storyblok heading level (1 to 3). */
const HEADING_CLASSES: Record<number, string> = {
  1: 'text-3xl font-semibold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
}

/**
 * Checks if the given link attributes point to an internal Storyblok story.
 *
 * @param attributes - The link mark attributes to check
 * @returns `true` when the attributes describe a story link
 */
function isStoryLink(attributes: unknown): attributes is StoryblokMultilink {
  return (
    typeof attributes === 'object' &&
    attributes !== null &&
    'linktype' in attributes &&
    (attributes as { linktype?: unknown }).linktype === 'story'
  )
}

/**
 * Builds the component overrides passed to `@storyblok/vue`'s `StoryblokRichText`.
 *
 * Each entry renders a Storyblok rich text node with the Storefront's Tailwind
 * typography and resolves internal links to localized routes. The map is created
 * per render so link resolution can close over the current route helpers.
 *
 * Used by `RichTextComponent.vue`; kept as a factory (rather than inline in the
 * SFC) so the individual node renderers stay in a plain module.
 *
 * @param getLocalizedRoute - Resolves an internal slug or path to a localized route
 * @returns A component map keyed by Storyblok rich text node and mark type
 */
export function createRichTextRenderers(
  getLocalizedRoute: (route: RouteLocationRaw) => string | RouteLocationAsPath,
): SbVueRichTextComponentMap {
  /**
   * Resolves a link mark's attributes to a localized route or external URL.
   *
   * @param attrs - The link mark attributes from the rich text node
   * @returns The resolved href, or `undefined` when no attributes are present
   */
  const resolveRichTextLink = (attrs: Record<string, unknown> | undefined) => {
    if (!attrs) {
      return undefined
    }

    if (isStoryLink(attrs) && attrs.story) {
      return getLocalizedRoute(attrs.story.full_slug as string)
    }

    return isExternalLink(attrs.href as string)
      ? (attrs.href as string)
      : getLocalizedRoute(attrs.href as string)
  }

  return {
    heading: defineComponent({
      name: 'StoryblokRichTextHeading',
      props: { attrs: { type: Object, default: undefined } },
      setup(props, { slots }) {
        return () => {
          const level =
            (props.attrs as { level?: number } | undefined)?.level ?? 1
          const tag = level >= 1 && level <= 3 ? `h${level}` : 'h1'
          return h(
            tag,
            { class: HEADING_CLASSES[level] ?? HEADING_CLASSES[1] },
            slots.default?.(),
          )
        }
      },
    }),
    bullet_list: defineComponent({
      name: 'StoryblokRichTextBulletList',
      setup(_props, { slots }) {
        return () => h('ul', { class: 'list-disc pl-6' }, slots.default?.())
      },
    }),
    ordered_list: defineComponent({
      name: 'StoryblokRichTextOrderedList',
      setup(_props, { slots }) {
        return () => h('ol', { class: 'list-decimal pl-6' }, slots.default?.())
      },
    }),
    paragraph: defineComponent({
      name: 'StoryblokRichTextParagraph',
      props: { content: { type: Array, default: undefined } },
      setup(props, { slots }) {
        // A paragraph without a `content` field is an empty editor line and
        // renders as a line break; `content: []` still renders an empty `<p>`.
        return () =>
          props.content === undefined ? h('br') : h('p', slots.default?.())
      },
    }),
    link: defineComponent({
      name: 'StoryblokRichTextLink',
      props: { attrs: { type: Object, default: undefined } },
      setup(props, { slots }) {
        return () =>
          h(
            'a',
            {
              class: 'font-semibold',
              href: resolveRichTextLink(props.attrs),
              target: (props.attrs as { target?: string } | undefined)?.target,
            },
            slots.default?.(),
          )
      },
    }),
  }
}
