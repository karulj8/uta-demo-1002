<template>
  <button
    v-if="isFavoriteStore"
    class="cursor-pointer"
    @click="favoriteStoreId = null"
  >
    <IconUtilitySaved class="size-4" />
  </button>
  <button v-else class="cursor-pointer" @click="favoriteStoreId = storeId">
    <IconUtilitySave class="size-4" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconUtilitySave, IconUtilitySaved } from '#components'
import { useFavoriteStore } from '~/composables/useFavoriteStore'

const { storeId } = defineProps<{ storeId: number }>()

const favoriteStoreId = useFavoriteStore()

const isFavoriteStore = computed(() => favoriteStoreId.value === storeId)
</script>
