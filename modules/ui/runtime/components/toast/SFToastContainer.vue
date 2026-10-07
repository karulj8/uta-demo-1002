<template>
  <div
    class="fixed bottom-6 z-30 max-h-[calc(100vh-3rem)] overflow-auto scrollbar-hide md:container max-md:!w-full md:right-8 md:top-6 md:size-min"
    aria-live="polite"
  >
    <TransitionGroup
      name="notification"
      tag="div"
      enter-from-class="opacity-0 translate-y-8"
      leave-to-class="opacity-0 -z-10 -translate-y-8"
      move-class="transition-all duration-500"
      class="flex w-full flex-col items-end gap-4 max-md:fixed max-md:bottom-0 max-md:p-4"
    >
      <SFToast
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        data-testid="toast-info"
        class="right-0 transition-all"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '#storefront-ui'
import { SFToast } from '#storefront-ui/components'

const { notifications } = useNotification()
</script>
