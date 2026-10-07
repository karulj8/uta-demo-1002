<template>
  <div
    class="flex min-h-screen flex-col text-primary antialiased anchor-scrolling-none"
  >
    <div class="mt-4 grow">
      <SFErrorLayout :error="error" @clear-error="resetErrorState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SFErrorLayout from '~/components/layout/SFErrorLayout.vue'
import { clearError, useError } from '#app/composables/error'
import { routeList } from '~/utils/route'
import { useCurrentShop } from '#storefront/composables'
import { useLocalePath } from '#i18n'
import { useGlobalEvents } from '#tracking/composables'

const error = useError()
const localePath = useLocalePath()
const currentShop = useCurrentShop()
const { trackError } = useGlobalEvents()

const resetErrorState = async () => {
  const redirect = localePath(routeList.home).toString()
  if (currentShop.value) {
    await clearError({ redirect })
  }

  window.location.href = redirect
}

trackError({
  code: error.value?.statusCode,
  message: error.value?.statusMessage ?? 'global_error',
})

defineOptions({ name: 'GlobalError' })
</script>
