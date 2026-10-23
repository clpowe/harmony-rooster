<script setup lang="ts">
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    error?: string;
    hint?: string;
    as?: "input" | "textarea";
  }>(),
  { as: "input" },
);
const model = defineModel<string | undefined>();
const attrs = useAttrs();
const control = ref<HTMLInputElement | HTMLTextAreaElement>();
function describedBy() {
  return (
    [
      attrs["aria-describedby"],
      props.hint ? `${props.id}-hint` : undefined,
      props.error ? `${props.id}-error` : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
defineExpose({ focus: () => control.value?.focus() });
</script>

<template>
  <div class="form-field">
    <label :for="id" class="form-field__label">{{ label }}</label>
    <input
      v-if="as === 'input'"
      v-bind="$attrs"
      :id="id"
      ref="control"
      v-model="model"
      class="form-field__input"
      :aria-invalid="error ? 'true' : $attrs['aria-invalid']"
      :aria-describedby="describedBy()"
    />
    <textarea
      v-else
      v-bind="$attrs"
      :id="id"
      ref="control"
      v-model="model"
      class="form-field__input text-field__textarea"
      :aria-invalid="error ? 'true' : $attrs['aria-invalid']"
      :aria-describedby="describedBy()"
    />
    <p v-if="hint" :id="`${id}-hint`" class="text-field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-error`" class="form-field__error">{{ error }}</p>
  </div>
</template>

<style scoped>
@layer blocks {
  .text-field__textarea {
    min-block-size: 10rem;
  }
  .text-field__hint {
    color: var(--clr-text-subtle);
    font-size: var(--text-caption);
  }
}
</style>
