<script setup lang="ts">
defineProps<{ active?: boolean; title: string; subtitle?: string }>();
</script>

<template>
  <button
    type="button"
    class="relative w-full rounded-2xl p-4 text-left transition"
    :class="
      active
        ? 'border-2 border-accent bg-accent-soft'
        : 'border border-border-strong bg-surface'
    "
  >
    <div class="font-bold text-text">{{ title }}</div>
    <div v-if="subtitle" class="mt-0.5 text-sm text-text-muted">
      {{ subtitle }}
    </div>
    <span
      v-if="active"
      class="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm text-white"
    >
      ✓
    </span>
  </button>
</template>
