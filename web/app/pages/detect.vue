<script setup lang="ts">
import type { FaceAnalysisResult } from "@hurgadan/hairo-contracts";

// Ярлыки для значений таксономии (CATALOG.md §1-2) — код на английском, отображение на русском.
const FACE_SHAPE_LABELS: Record<string, string> = {
  oval: "Овальное",
  round: "Круглое",
  square: "Квадратное",
  heart: "Сердце",
  oblong: "Вытянутое",
  diamond: "Ромб",
};

const LENGTH_LABELS: Record<string, string> = {
  buzz: "Очень короткая",
  short: "Короткая",
  chin: "До подбородка",
  shoulder: "До плеч",
  mid: "Средняя",
  long: "Длинная",
};

const TEXTURE_LABELS: Record<string, string> = {
  straight: "Прямые",
  wavy: "Волнистые",
  curly: "Кудрявые",
  coily: "Афро",
};

const DENSITY_LABELS: Record<string, string> = {
  fine: "Тонкие",
  medium: "Средняя",
  thick: "Густые",
};

const analysis = useCurrentAnalysis();

const detected = computed(() => {
  const result: FaceAnalysisResult | null | undefined = analysis.value?.result;
  if (!result) return [];

  return [
    {
      label: "Форма лица",
      value: FACE_SHAPE_LABELS[result.faceShape] ?? result.faceShape,
    },
    {
      label: "Текущая длина",
      value: LENGTH_LABELS[result.length] ?? result.length,
    },
    {
      label: "Текстура",
      value: result.texture
        .map((t) => TEXTURE_LABELS[t] ?? t)
        .join(", "),
    },
    {
      label: "Густота",
      value: DENSITY_LABELS[result.density] ?? result.density,
    },
  ];
});

onMounted(() => {
  // Прямой заход без пройденного анализа — вернуть в начало флоу.
  if (!analysis.value || analysis.value.status !== "completed") {
    navigateTo("/analyze");
  }
});
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="2" class="mt-4" />

    <p class="mt-6 text-xs font-bold tracking-wide text-success uppercase">
      ✓ Фото проанализировано
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
