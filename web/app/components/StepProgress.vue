<script setup lang="ts">
defineProps<{ total: number; current: number }>();
</script>

<template>
  <div class="flex gap-1.5">
    <div
      v-for="i in total"
      :key="i"
      class="h-1.5 flex-1 rounded-full transition"
      :class="i <= current ? 'bg-accent' : 'bg-border-strong'"
    />
  </div>
</template>
