<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-live-preview="contentElement"
    class="max-w-none"
    v-html="contentElement.content"
  />
</template>
<script setup lang="ts">
import { watchEffect } from 'vue'
import contentstack from '@contentstack/delivery-sdk'
import { vLivePreview } from '../directives/livePreview'
import type { RichtextComponent } from '../types/gen/contentstack'

const { contentElement } = defineProps<{ contentElement: RichtextComponent }>()

const isEmptyNode = (node: contentstack.Utils.Node) => {
  if (
    !node.children?.length ||
    node.children.every(
      (child) => !child.type && 'text' in child && child.text === '',
    )
  ) {
    return true
  }
}

const renderOption = {
  ul: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    return `<ul class='list-disc pl-6'>${next(node.children)}</ul>`
  },
  ol: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    return `<ol class='list-decimal pl-6'>${next(node.children)}</ol>`
  },
  li: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    return `<li>${next(node.children)}</li>`
  },
  p: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    if (isEmptyNode(node)) {
      return '<br />'
    }
    return `<p>${next(node.children)}</p>`
  },
  h1: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    if (isEmptyNode(node)) {
      return '<br class="mb-2" />'
    }
    return `<h1 class='text-3xl font-semibold'>${next(node.children)}</h1>`
  },
  h2: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    if (isEmptyNode(node)) {
      return '<br class="mb-1" />'
    }
    return `<h2 class='text-2xl font-semibold'>${next(node.children)}</h2>`
  },
  h3: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    if (isEmptyNode(node)) {
      return '<br class="mb-5" />'
    }
    return `<h3 class='text-xl font-semibold'>${next(node.children)}</h3>`
  },
  a: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    return `<a href="${node.attrs.url}" target="${node.attrs.target}" class="font-semibold">${next(node.children)}</a>`
  },
  reference: (node: contentstack.Utils.Node, next: contentstack.Utils.Next) => {
    return `<a href="${node.attrs.href}" target="${node.attrs.target}" class="font-semibold">${next(node.children)}</a>`
  },
}

// Watch effect of the contentElement to re-render the component when the content changes e.g. when the user is editing the content in the editor.
watchEffect(() => {
  contentstack.Utils.jsonToHTML({
    entry: contentElement as contentstack.Utils.EntryEmbedable,
    paths: ['content'],
    renderOption,
  })
})
</script>
