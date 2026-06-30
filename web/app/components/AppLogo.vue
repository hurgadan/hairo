<script setup lang="ts">
withDefaults(defineProps<{ size?: number; wordmark?: boolean }>(), {
  size: 28,
  wordmark: true,
});
</script>

<template>
  <span class="flex items-center gap-2">
    <svg :width="size" :height="size" viewBox="0 0 46 46" fill="none">
      <circle cx="23" cy="23" r="22" class="fill-accent-soft" />
      <path
        d="M14 31c0-12 5-19 9-19s9 7 9 19"
        class="stroke-accent"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
    <span v-if="wordmark" class="font-display text-2xl text-text">Hairo</span>
  </span>
</template>
