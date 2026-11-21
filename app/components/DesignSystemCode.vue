<script setup lang="ts">
const props = withDefaults(defineProps<{ title: string; code: string; open?: boolean }>(), {
  open: false,
});
const status = ref("");
const source = ref<HTMLElement>();

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
    status.value = "Copied";
  } catch {
    const selection = window.getSelection();
    if (source.value && selection) {
      selection.selectAllChildren(source.value);
      status.value = "Code selected. Use your browser’s copy command.";
    } else {
      status.value = "Select the code to copy it.";
    }
  }
}
</script>

<template>
  <details class="reference-code flow" :open="open || undefined">
    <summary>{{ title }}</summary>
    <div class="cluster">
      <AppButton variant="ghost" size="small" @click="copy">Copy {{ title }}</AppButton>
      <span role="status">{{ status }}</span>
    </div>
    <pre :aria-label="title" tabindex="0"><code ref="source">{{ code }}</code></pre>
  </details>
</template>

<style scoped>
@layer blocks {
  .reference-code {
    --flow-space: var(--space-300);
    min-inline-size: 0;
  }
  .reference-code summary {
    color: var(--clr-primary-500);
    font-weight: var(--fw-medium);
    cursor: pointer;
  }
  .reference-code pre {
    max-block-size: 25rem;
    overflow: auto;
    padding: var(--space-400);
    border: var(--border-width) solid var(--clr-border);
    border-radius: var(--radius-input);
    background: var(--clr-surface-muted);
    color: var(--clr-text);
    font: var(--text-caption) / var(--lh-body) var(--ff-mono);
    tab-size: 2;
  }
}
</style>
