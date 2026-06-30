<script setup lang="ts">
const consent = ref(false);
const fileName = ref<string | null>(null);

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  fileName.value = file ? file.name : null;
}
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="1" class="mt-4" />

    <h1 class="mt-6 font-display text-3xl text-text">Загрузите селфи</h1>
    <p class="mt-2 text-sm text-text-muted">
      Лучше всего анфас при дневном свете.
    </p>

    <label
      class="mt-6 flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border-strong bg-surface text-center"
    >
      <span
        class="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-2xl"
      >
        📷
      </span>
      <span class="font-semibold text-text">Выберите фото</span>
      <span v-if="fileName" class="text-xs text-text-muted">{{ fileName }}</span>
      <input type="file" accept="image/*" class="hidden" @change="onFile" />
    </label>

    <label class="mt-6 flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
      <input
        v-model="consent"
        type="checkbox"
        class="h-5 w-5 accent-[var(--accent)]"
      />
      <span class="text-sm text-text-muted">
        Согласен на обработку фото для подбора.
      </span>
    </label>

    <div class="mt-auto pt-8">
      <AppButton
        :class="{ 'pointer-events-none opacity-50': !consent }"
        @click="navigateTo('/detect')"
      >
        Продолжить
      </AppButton>
    </div>
  </div>
</template>
