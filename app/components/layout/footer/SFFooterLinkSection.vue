<template>
  <div class="flex flex-col gap-5" data-testid="footer-link-section">
    <div
      class="flex cursor-pointer items-center text-lg font-semibold text-primary md:cursor-default md:text-sm"
      data-testid="footer-link-section-title"
      @click="expanded = !expanded"
    >
      <div>
        <SFNavigationTreeItem :navigation-item="sectionWithDisabledLink" />
      </div>
      <div class="ml-auto flex md:hidden">
        <IconIncrementPlus v-if="!expanded" class="size-4" />
        <IconIncrementMinus v-else class="size-4" />
      </div>
    </div>
    <ul
      ref="content"
      class="flex-col gap-x-2 gap-y-5 transition-all md:flex"
      :class="{
        flex: expanded,
        hidden: !expanded,
      }"
    >
      <li v-for="item in section.children" :key="item.id">
        <SFNavigationTreeItem :navigation-item="item" />
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NavigationV2TreeItem } from '@scayle/storefront-nuxt'
import { useRouter } from '#app/composables/router'
import SFNavigationTreeItem from '~/components/layout/SFNavigationTreeItem.vue'
import { IconIncrementMinus, IconIncrementPlus } from '#components'

const { section } = defineProps<{
  section: NavigationV2TreeItem
}>()

const expanded = ref(false)
const sectionWithDisabledLink = computed(() => {
  return {
    ...section,
    customData: {
      ...(section?.customData || {}),
      disabledLink: true,
    },
  }
})

// Reset `expanded` if current route is left
useRouter().afterEach(() => {
  expanded.value = false
})
</script>
