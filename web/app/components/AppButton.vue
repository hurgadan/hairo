<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "primary" | "dark" | "secondary" | "pill";
    block?: boolean;
  }>(),
  { variant: "primary", block: true },
);

const variants: Record<string, string> = {
  primary:
    "h-[52px] rounded-2xl bg-accent text-white shadow-[0_12px_24px_-10px_rgba(194,106,74,0.6)]",
  dark: "h-[52px] rounded-2xl bg-text text-bg",
  secondary:
    "h-[52px] rounded-2xl border border-border-strong bg-transparent text-text",
  pill: "h-11 rounded-full bg-surface-2 px-5 text-text",
};
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 px-5 font-bold transition active:scale-[0.99]"
    :class="[variants[variant], block ? 'w-full' : '']"
  >
    <slot />
  </button>
</template>
