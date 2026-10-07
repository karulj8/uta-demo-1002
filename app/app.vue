<template>
  <NuxtLayout />
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#app/nuxt'
import { NuxtLayout } from '#components'
import { useConsentManagementPlatform } from '~/composables/useConsentManagementPlatform'

const config = useRuntimeConfig()

useConsentManagementPlatform({
  src: 'https://web.cmp.usercentrics.eu/ui/loader.js',
  scriptTagAttributes: {
    id: 'usercentrics-cmp',
    'data-settings-id': config.public.userCentricsAppId,
    async: true,
    defer: false,
  },
})
</script>
