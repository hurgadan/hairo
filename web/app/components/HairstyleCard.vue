<script setup lang="ts">
import type { Hairstyle } from "@hurgadan/hairo-contracts";

defineProps<{ hairstyle: Hairstyle; selected?: boolean; match?: number }>();
</script>

<template>
  <article
    class="cursor-pointer overflow-hidden rounded-2xl bg-surface transition"
    :class="selected ? 'border-2 border-accent' : 'border border-border'"
  >
    <div
      class="relative flex aspect-[3/4] items-center justify-center bg-surface-2 text-xs text-text-muted"
    >
      превью
      <span
        v-if="match"
        class="absolute top-2 right-2 rounded-full bg-surface px-2 py-0.5 text-[11px] font-extrabold text-accent-dark"
      >
        {{ match }}%
      </span>
      <span
        v-if="selected"
        class="absolute right-2 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-sm text-white"
      >
        ✓
      </span>
    </div>
    <div class="p-3">
      <h3 class="font-display text-lg text-text">
        {{ hairstyle.name.ru ?? hairstyle.slug }}
      </h3>
      <p class="text-xs text-text-muted">{{ hairstyle.groupName }}</p>
    </div>
  </article>
</template>
