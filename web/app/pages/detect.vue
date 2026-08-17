<script setup lang="ts">
import type { FaceAnalysisResult } from "@hurgadan/hairo-contracts";

// Значения таксономии (CATALOG.md §1-2) приходят кодами — подписи берём из
// словарей по ключу `taxonomy.*`, чтобы они менялись вместе с языком.
const { t, te } = useI18n();
const localePath = useLocalePath();

/** Код без перевода показываем как есть — лучше «oval», чем пустая строка. */
function taxonomy(group: string, code: string): string {
  const key = `taxonomy.${group}.${code}`;
  return te(key) ? t(key) : code;
}

const analysis = useCurrentAnalysis();

const detected = computed(() => {
  const result: FaceAnalysisResult | null | undefined = analysis.value?.result;
  if (!result) return [];

  return [
    {
      label: t("detect.faceShape"),
      value: taxonomy("faceShape", result.faceShape),
    },
    {
      label: t("detect.currentLength"),
      value: taxonomy("length", result.length),
    },
    {
      label: t("detect.texture"),
      value: result.texture.map((x) => taxonomy("texture", x)).join(", "),
    },
    {
      label: t("detect.density"),
      value: taxonomy("density", result.density),
    },
  ];
});

onMounted(() => {
  // Прямой заход без пройденного анализа — вернуть в начало флоу.
  if (!analysis.value || analysis.value.status !== "completed") {
    navigateTo(localePath("/analyze"));
  }
});
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="2" class="mt-4" />

    <p class="mt-6 text-xs font-bold tracking-wide text-success uppercase">
      {{ $t("detect.done") }}
    </p>
    <h1 class="mt-2 font-display text-3xl text-text">
      {{ $t("detect.title") }}
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
        <span class="text-sm font-semibold text-accent-dark">
          {{ $t("detect.edit") }}
        </span>
      </div>
    </div>

    <div class="mt-auto pt-8">
      <AppButton @click="navigateTo(localePath('/wizard'))">
        {{ $t("detect.cta") }}
      </AppButton>
    </div>
  </div>
</template>
