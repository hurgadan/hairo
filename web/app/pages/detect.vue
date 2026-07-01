<script setup lang="ts">
const detected = [
  { label: "Форма лица", value: "Овальное" },
  { label: "Текущая длина", value: "Средняя" },
  { label: "Текстура", value: "Волнистые" },
  { label: "Густота", value: "Средняя" },
];
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="2" class="mt-4" />

    <p class="mt-6 text-xs font-bold tracking-wide text-success uppercase">
      ✓ Фото улучшено
    </p>
    <h1 class="mt-2 font-display text-3xl text-text">
      Мы определили ваши черты
    </h1>

    <div class="mt-6 flex flex-col gap-3">
      <div
        v-for="row in detected"
        :key="row.label"
        class="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
      >
        <div>
          <div class="text-xs text-text-muted">{{ row.label }}</div>
          <div class="font-bold text-text">{{ row.value }}</div>
        </div>
        <span class="text-sm font-semibold text-accent-dark">Изменить</span>
      </div>
    </div>

    <div class="mt-auto pt-8">
      <AppButton @click="navigateTo('/wizard')">Всё верно, дальше</AppButton>
    </div>
  </div>
</template>
