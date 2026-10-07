<template>
  <SFTextInput
    v-model="modelValue"
    :placeholder="placeholder"
    :type="passwordInputType"
    :has-errors="!isValid"
    required
    :readonly="disabled"
    @change="$emit('change')"
    @input="$emit('input')"
  >
    <template #append-icon>
      <button
        type="button"
        :aria-label="
          isPasswordHidden
            ? $t('password_input.show')
            : $t('password_input.hide')
        "
        variant="raw"
        class="size-full rounded-md *:size-3 *:text-secondary"
        :data-testid="
          isPasswordHidden ? 'password-toggle-show' : 'password-toggle-hide'
        "
        @click.prevent="togglePasswordVisibility"
      >
        <IconInputHidePassword
          v-if="isPasswordHidden"
          class="mx-auto !size-5"
        />
        <IconInputShowPassword v-else class="mx-auto !size-5" />
      </button>
    </template>
  </SFTextInput>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SFTextInput } from '#storefront-ui/components'
import { IconInputHidePassword, IconInputShowPassword } from '#components'

const modelValue = defineModel({
  type: String,
  default: '',
  required: true,
})

const {
  disabled = false,
  isValid,
  placeholder,
} = defineProps<{
  disabled?: boolean
  isValid: boolean
  placeholder: string
}>()

defineEmits<{ change: []; input: [] }>()

const passwordInputType = ref<'password' | 'text'>('password')

const isPasswordHidden = computed(() => passwordInputType.value === 'password')

const togglePasswordVisibility = (): void => {
  passwordInputType.value = isPasswordHidden.value ? 'text' : 'password'
}
</script>
