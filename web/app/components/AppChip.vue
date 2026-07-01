<script setup lang="ts">
defineProps<{ active?: boolean }>();
</script>

<template>
  <button
    type="button"
    class="rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition"
    :class="
      active
        ? 'bg-accent text-white'
        : 'border border-border-strong bg-surface text-text-muted'
    "
  >
    <slot />
  </button>
</template>
