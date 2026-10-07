<template>
  <div
    class="mr-auto block content-center text-primary"
    data-testid="footer-copyright"
  >
    {{ $t('footer.copyright', { currentYear: new Date().getFullYear() }) }}
  </div>
  <ul class="flex flex-row flex-wrap gap-4 text-secondary">
    <li v-for="navItem in footerTree?.items" :key="`footer-link-${navItem.id}`">
      <SFNavigationTreeItem
        class="block rounded-md hover:bg-gray-200 md:p-1"
        data-testid="simple-footer-link"
        raw
        :navigation-item="navItem"
      />
    </li>
    <li v-if="$currentShop.requiresConsentManagement">
      <SFButton
        variant="raw"
        class="inline rounded-md !text-secondary hover:bg-gray-200 hover:text-secondary md:p-1"
        @click="$consent.openConsentManager()"
      >
        {{ $t('footer.privacy_settings') }}
      </SFButton>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { useNavigationsByReferenceKey } from '#storefront-navigation/composables'
import SFNavigationTreeItem from '~/components/layout/SFNavigationTreeItem.vue'
import { createCacheFriendlyTimestamp } from '~/utils'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'

const { data: footerTree } = useNavigationsByReferenceKey(
  {
    params: {
      referenceKey: 'checkout_footer',
      visibleAt: createCacheFriendlyTimestamp(),
    },
  },
  'checkout-footer',
)
</script>
