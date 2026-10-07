<template>
  <div class="flex w-full items-center justify-between">
    <SFHeadline class="md:text-lg" size="xl" tag="p">
      {{ $t('filter_header.title') }}
    </SFHeadline>
    <SFButton
      class="group my-3 -mr-2 bg-gray-200 md:bg-transparent hover:md:bg-gray-200"
      fab
      variant="raw"
      data-testid="close-filters"
      :aria-label="$t('filter_header.close')"
      @click="toggleItem"
    >
      <template #icon>
        <IconNavigationClose
          class="size-4 md:fill-secondary group-hover:md:fill-primary"
        />
      </template>
    </SFButton>
  </div>
</template>

<script setup lang="ts">
import { IconNavigationClose } from '#components'
import { SFButton, SFHeadline } from '#storefront-ui/components'

defineProps<{ toggleItem: () => void }>()
</script>
