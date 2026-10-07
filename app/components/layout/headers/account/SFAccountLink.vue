<template>
  <SFLocalizedLink
    raw
    :to="to"
    class="group flex items-center space-x-3 rounded-md px-3 py-2.5 hover:bg-gray-200"
    :aria-label="label"
  >
    <component
      :is="icon"
      class="size-4 text-secondary group-hover:text-primary"
    />
    <span class="text-md leading-5 text-secondary group-hover:text-primary">
      {{ label }}
    </span>
  </SFLocalizedLink>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from '#vue-router'
import SFLocalizedLink from '~/components/SFLocalizedLink.vue'
import type { IconName } from '#shared/types/icons'

defineProps<{ to: RouteLocationRaw; label: string; icon: IconName }>()
</script>
