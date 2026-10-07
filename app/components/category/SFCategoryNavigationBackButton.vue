<template>
  <SFButton
    variant="raw"
    fab
    size="sm"
    class="size-10 border border-gray-300"
    :aria-label="$t('global.back')"
    :to="link"
  >
    <template #append-icon="{ _class }">
      <IconNavigationLeft :class="_class" class="!size-6 fill-secondary" />
    </template>
  </SFButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@scayle/storefront-nuxt'
import { useRouteHelpers } from '~/composables'
import { routeList } from '~/utils'
import { SFButton } from '#storefront-ui/components'
import { IconNavigationLeft } from '#components'

const { currentCategory } = defineProps<{ currentCategory: Category | null }>()

const { buildCategoryPath, getLocalizedRoute } = useRouteHelpers()

const link = computed(() => {
  return currentCategory?.parent
    ? buildCategoryPath(currentCategory.parent)
    : getLocalizedRoute(routeList.home.path)
})
</script>
