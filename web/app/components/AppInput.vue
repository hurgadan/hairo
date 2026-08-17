<script setup lang="ts">
// Поле ввода из дизайн-системы (DESIGN.md §5): h52, радиус 14, бордер 1.5px.
// Тип, placeholder и прочие атрибуты прокидываются снаружи.
const model = defineModel<string>({ required: true });

const el = ref<HTMLInputElement | null>(null);

defineExpose({ focus: () => el.value?.focus() });
</script>

<template>
  <input
    ref="el"
    v-model="model"
    class="h-[52px] w-full rounded-[14px] border-[1.5px] border-border-strong bg-surface px-4 text-[15px] text-text outline-none transition placeholder:text-text-muted focus:border-accent"
  >
</template>
