<template>
  <div
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="content"
    class="max-w-none"
  >
    <component
      :is="node"
      v-for="(node, index) in renderedContent"
      :key="index"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, h, type VNode } from 'vue'
import {
  Marked,
  type MarkedExtension,
  type Token,
  type Tokens,
} from 'marked'
import type { RichTextComponent } from '../types/gen'
import { useRouteHelpers } from '~/composables'
import { isExternalLink } from '~/utils'

const { contentElement } = defineProps<{ contentElement: RichTextComponent }>()

const { getLocalizedRoute } = useRouteHelpers()

/**
 * Inline token produced by {@link underlineExtension} for `<u>...</u>` spans.
 *
 * Underline has no Markdown syntax, so it is not part of marked's built-in
 * token union and is declared here for the renderer to consume.
 */
interface UnderlineToken {
  type: 'underline'
  raw: string
  text: string
  tokens: Token[]
}

// Amplience's rich text editor has no Markdown syntax for underline, so it
// emits raw `<u>...</u>` HTML. By default marked tokenizes those tags as two
// standalone inline `html` tokens, which this renderer would surface as escaped
// literal text (there is no `v-html`). This inline extension pairs the tags
// into a single `underline` token and lexes the content between them normally,
// so nested formatting (e.g. a bold underline) keeps working.
const underlineExtension: MarkedExtension = {
  extensions: [
    {
      name: 'underline',
      level: 'inline',
      start(src) {
        const index = src.indexOf('<u>')
        return index < 0 ? undefined : index
      },
      tokenizer(src) {
        const match = /^<u>([\s\S]*?)<\/u>/.exec(src)
        if (!match) {
          return undefined
        }

        const text = match[1] ?? ''
        return {
          type: 'underline',
          raw: match[0],
          text,
          tokens: this.lexer.inlineTokens(text),
        }
      },
    },
  ],
}

const markedInstance = new Marked(underlineExtension)

/**
 * Renders Markdown inline tokens (text, strong, em, links, ...) into VNodes and strings.
 *
 * Recurses into `strong`/`em`/`link` tokens since Markdown allows nesting
 * (e.g. a bold link), so each of those tokens' own inline children are rendered
 * the same way. List items also wrap their inline children in a `text` token
 * that still carries nested formatting tokens, so those are expanded here too.
 * This renders directly to Vue VNodes rather than an HTML string, which avoids
 * a `v-html` sanitization step entirely.
 * @param tokens - The inline tokens produced by marked's lexer
 * @returns The rendered VNodes and plain text content, in document order
 */
const renderInline = (
  tokens: (Token | UnderlineToken)[] | undefined,
): (VNode | string)[] => {
  if (!tokens) {
    return []
  }

  return tokens.flatMap((token): (VNode | string)[] => {
    switch (token.type) {
      case 'strong':
        return [h('strong', renderInline((token as Tokens.Strong).tokens))]
      case 'em':
        return [h('em', renderInline((token as Tokens.Em).tokens))]
      case 'underline':
        return [h('u', renderInline((token as UnderlineToken).tokens))]
      case 'codespan':
        return [h('code', (token as Tokens.Codespan).text)]
      case 'br':
        return [h('br')]
      case 'link': {
        const { href, title, tokens: linkTokens } = token as Tokens.Link
        const url = isExternalLink(href) ? href : getLocalizedRoute(href)

        return [
          h(
            'a',
            { href: url, title, class: 'font-semibold' },
            renderInline(linkTokens),
          ),
        ]
      }
      case 'text': {
        const textToken = token as Tokens.Text
        // Tight list items wrap formatted content in a text token whose
        // `.text` still contains raw Markdown (e.g. `**Purpose:**`). Nested
        // `.tokens` hold the parsed strong/em/link nodes to render instead.
        if (textToken.tokens?.length) {
          return renderInline(textToken.tokens)
        }
        return [textToken.text ?? token.raw]
      }
      case 'paragraph':
        // Loose list items nest their content in paragraph tokens.
        return renderInline((token as Tokens.Paragraph).tokens)
      default:
        return [(token as Tokens.Text).text ?? token.raw]
    }
  })
}

// Tailwind classes matching the heading styles used by other CMS providers'
// rich text renderers (e.g. Storyblok). Headings below h3 render unstyled.
const HEADING_CLASSES: Record<number, string> = {
  1: 'text-3xl font-semibold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
}

/**
 * Renders a Markdown heading token (`#` to `######`) into a VNode.
 * @param token - The heading token to render
 * @returns The rendered heading VNode
 */
const renderHeading = (token: Tokens.Heading): VNode => {
  const { depth, tokens } = token
  const headingClass = HEADING_CLASSES[depth]

  return h(
    `h${depth}`,
    headingClass ? { class: headingClass } : undefined,
    renderInline(tokens),
  )
}

/**
 * Renders a Markdown paragraph token into a VNode.
 *
 * An empty paragraph (e.g. a blank line used for spacing) renders as a line
 * break instead of an empty `<p>`, matching the previous HTML-string renderer's
 * behavior.
 *
 * @param token - The paragraph token to render
 * @param options - Rendering options
 * @param options.inList - When true, skip bottom margin so list blank lines are
 *   driven by {@link renderSpace} (1:1 with newlines authored in Amplience)
 * @returns The rendered paragraph or line-break VNode
 */
const renderParagraph = (
  token: Tokens.Paragraph,
  options: { inList?: boolean } = {},
): VNode => {
  const inline = renderInline(token.tokens)

  if (!inline.length) {
    return h('br')
  }

  // Top-level paragraphs need `mb-4` because Tailwind preflight zeroes margins
  // and the first `\n\n` break is absorbed by {@link renderSpace}. List item
  // paragraphs skip that margin so one blank line in Amplience becomes one
  // visible gap via `<br>`, not margin plus `<br>`.
  return h('p', options.inList ? undefined : { class: 'mb-4' }, inline)
}

/**
 * Renders a Markdown space token (blank lines between blocks) into VNodes.
 *
 * marked emits one `space` token for consecutive newlines.
 *
 * @param token - The space token to render
 * @param options - Rendering options
 * @param options.absorbedNewlines - How many newlines are already represented by
 *   surrounding layout (paragraph `mb-4` at top level, or the structural break
 *   that starts a loose list). Remaining newlines become `<br>` tags.
 * @returns Line-break VNodes for visible blank lines, or an empty array
 */
const renderSpace = (
  token: Tokens.Space,
  options: { absorbedNewlines?: number } = {},
): VNode[] => {
  const newlineCount = token.raw.split('\n').length - 1
  const absorbedNewlines = options.absorbedNewlines ?? 2
  const extraBlankLines = Math.max(0, newlineCount - absorbedNewlines)

  return Array.from({ length: extraBlankLines }, () => h('br'))
}

/**
 * Renders the children of a Markdown list item into VNodes and strings.
 *
 * List items may contain nested lists in addition to inline/paragraph content,
 * so nested `list` tokens are rendered as full list VNodes rather than through
 * the inline renderer. Blank lines inside a (loose) list item arrive as `space`
 * tokens. Those use a lower absorption count than top-level blocks so one blank
 * line in Amplience maps to one visible gap in the storefront.
 * @param tokens - Tokens belonging to a single list item
 * @returns The rendered children for that list item
 */
const renderListItemChildren = (tokens: Token[]): (VNode | string)[] => {
  return tokens.flatMap((token): (VNode | string)[] => {
    switch (token.type) {
      case 'list':
        return [renderList(token as Tokens.List)]
      case 'paragraph':
        return [renderParagraph(token as Tokens.Paragraph, { inList: true })]
      case 'space':
        // Absorb a single structural newline. `\n\n` (one blank line in the hub)
        // becomes one `<br>`, matching authoring 1:1.
        return renderSpace(token as Tokens.Space, { absorbedNewlines: 1 })
      default:
        return renderInline([token])
    }
  })
}

/**
 * Renders a Markdown list token (ordered or unordered) into a VNode.
 * @param token - The list token to render
 * @returns The rendered `ol`/`ul` VNode containing its list items
 */
const renderList = (token: Tokens.List): VNode => {
  const { ordered, items } = token

  return h(
    ordered ? 'ol' : 'ul',
    // `space-y-4` covers the default gap for a single blank line between loose
    // list items (those have paragraph tokens but no `space` token).
    {
      class: ordered
        ? 'list-decimal space-y-4 pl-6'
        : 'list-disc space-y-4 pl-6',
    },
    items.map((item) => h('li', renderListItemChildren(item.tokens))),
  )
}

/**
 * Renders Markdown block tokens (headings, paragraphs, lists, ...) into VNodes.
 *
 * Unsupported block types (e.g. raw `html`) are dropped. Amplience rich text
 * fields are authored as Markdown, not raw HTML.
 *
 * @param tokens - The block tokens produced by marked's lexer
 * @returns The rendered VNodes, in document order
 */
const renderBlocks = (tokens: Token[]): VNode[] => {
  return tokens.flatMap((token): VNode[] => {
    switch (token.type) {
      case 'heading':
        return [renderHeading(token as Tokens.Heading)]
      case 'paragraph':
        return [renderParagraph(token as Tokens.Paragraph)]
      case 'list':
        return [renderList(token as Tokens.List)]
      case 'space':
        return renderSpace(token as Tokens.Space)
      default:
        return []
    }
  })
}

// Rendered directly to VNodes (never to an HTML string), so there is no
// `v-html` and no HTML sanitizer needed. Amplience's rich text field is the
// only rich text field across our CMS providers authored as free-form
// Markdown; the others return structured documents that are walked into
// VNodes the same way, without ever producing raw HTML.
const renderedContent = computed(() => {
  const markdown = contentElement.content ?? ''

  return renderBlocks(markedInstance.lexer(markdown))
})
</script>
