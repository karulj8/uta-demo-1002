<template>
  <div v-if="idpCode" />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from '#app/composables/router'
import { useAuthentication } from '~/composables'
import { useLog } from '#storefront/composables'
import { useGlobalEvents, useSignInEvents } from '#tracking/composables'

const route = useRoute()

const log = useLog('CallbackPage')

const { loginIDP } = useAuthentication()
const { trackError } = useGlobalEvents()
const { trackLogin } = useSignInEvents()

const idpCode = computed(() => {
  const code = route.query.code
  return typeof code === 'string' ? code : undefined
})

onMounted(async () => {
  if (!idpCode.value) {
    return
  }
  try {
    await loginIDP(idpCode.value)
    trackLogin(true)
  } catch (error) {
    trackError({ code: 500, message: 'login_idp_error' })
    log.error('Error during logging in', error)
    trackLogin(false)
  }
})

defineOptions({ name: 'CallbackPage' })
</script>
