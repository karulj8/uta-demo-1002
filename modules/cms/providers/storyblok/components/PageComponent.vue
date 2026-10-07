<template>
  <div :key="slug" v-editable="data?.data?.story?.content">
    <slot v-if="status === 'pending'" name="loading" />
    <template v-else>
      <StoryblokComponent
        v-for="element in data?.data?.story?.content?.content"
        :key="element._uid"
        :content-element="element"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { whenever } from '@vueuse/core'
import { HttpStatusCode, sanitizeCanonicalURL } from '@scayle/storefront-nuxt'
import { join } from 'pathe'
import { useCMSBySlug } from '../composables/useCMS'
import { useStoryblokEditor } from '../composables/useStoryblokEditor'
import type { PageComponent, StoryblokRuntimeConfig } from '../types'
import {
  generateStoryblokHreflangLinks,
  getAllSourceSlugs,
} from '../utils/helpers'
import StoryblokComponent from './StoryblokComponent.vue'
import { useAvailableShops } from '#storefront/composables'
import { useNuxtApp, useRuntimeConfig } from '#app/nuxt'
import { useHead } from '#app/composables/head'
import { useRoute } from '#app/composables/router'
import { createError, useSeoMeta } from '#imports'
import { useI18n, useLocalePath, type Locale } from '#i18n'
import { useRequestOrigin, useRouteHelpers } from '~/composables'

const { slug } = defineProps<{
  slug: string
}>()

const { data, status, error } = await useCMSBySlug<PageComponent>(
  `cms-content-${slug}`,
  slug,
)

useStoryblokEditor(data)

whenever(
  error,
  () => {
    throw createError({
      ...(error.value?.cause
        ? error.value.cause
        : {
            statusCode: HttpStatusCode.NOT_FOUND,
          }),
      fatal: true,
    })
  },
  { immediate: true },
)

useSeoMeta({
  title: () => data.value?.data?.story?.content?.metaTitle,
  description: () => data.value?.data?.story?.content?.metaDescription,
  robots: () => data.value?.data?.story?.content?.robots,
})

const route = useRoute()
const origin = useRequestOrigin()
const {
  $config: {
    app: { baseURL },
  },
} = useNuxtApp()

const { getLocalizedHref } = useRouteHelpers()
const i18n = useI18n()
const availableShops = useAvailableShops()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const cms = config.public.cms as StoryblokRuntimeConfig
const folderMapping = cms.folderMapping

const shops = availableShops.value
const story = data.value?.data?.story
const sourceSlugs = getAllSourceSlugs(story, folderMapping)

const hreflangLinks = generateStoryblokHreflangLinks(
  shops.flatMap(({ locale, path }) => {
    const sourceSlug = sourceSlugs.find(({ path: sourcePath }) =>
      Array.isArray(path) ? path.includes(sourcePath) : path === sourcePath,
    )

    if (!sourceSlug) {
      return []
    }

    return [
      {
        locale: locale,
        href: getLocalizedHref(
          sourceSlug.path as Locale,
          localePath(`/${sourceSlug.slug}`, sourceSlug.path as Locale),
        ),
        path: sourceSlug.path,
      },
    ]
  }),
  i18n.defaultLocale,
)

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      key: 'canonical',
      href: sanitizeCanonicalURL(
        `${origin}${join(baseURL, route.fullPath)}`,
        [],
      ),
    },
    ...(slug === 'homepage' ? [] : hreflangLinks),
  ],
}))
</script>
