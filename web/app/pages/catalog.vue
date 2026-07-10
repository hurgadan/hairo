<script setup lang="ts">
import { GenderPresentation, HairLength, Maintenance } from "@hurgadan/hairo-contracts";
import type { Hairstyle, HairstyleFilter } from "@hurgadan/hairo-contracts";

const LENGTH_ORDER = [
  HairLength.Buzz,
  HairLength.Short,
  HairLength.Chin,
  HairLength.Shoulder,
  HairLength.Mid,
  HairLength.Long,
];

const config = useRuntimeConfig();
const wizard = useWizard();
const analysis = useCurrentAnalysis();

function targetLength(): HairLength | undefined {
  if (wizard.value.length === "any") return undefined;

  const current = analysis.value?.result?.length;
  if (!current) return undefined;

  const i = LENGTH_ORDER.indexOf(current);
  if (i < 0) return undefined;

  if (wizard.value.length === "shorter") return LENGTH_ORDER[Math.max(0, i - 1)];
  if (wizard.value.length === "longer")
    return LENGTH_ORDER[Math.min(LENGTH_ORDER.length - 1, i + 1)];
  return current; // "same"
}

const query = computed<HairstyleFilter>(() => {
  const result = analysis.value?.result;
  const filter: HairstyleFilter = {};

  if (wizard.value.gender !== "all") {
    filter.gender = wizard.value.gender as GenderPresentation;
  }
  const length = targetLength();
  if (length) filter.length = length;
  filter.maintenance = wizard.value.maintenance as Maintenance;
  if (result?.faceShape) filter.faceShape = result.faceShape;
  if (result?.texture?.length) filter.texture = result.texture;
  if (result?.density) filter.density = result.density;
  if (wizard.value.occasions.length) filter.occasion = wizard.value.occasions;

  return filter;
});

const { data, pending, error } = await useFetch<Hairstyle[]>(
  () => `${config.public.apiBase}/catalog/hairstyles`,
  { query },
);

const activeGroup = ref("Все");

const groups = computed(() => [
  "Все",
  ...Array.from(new Set((data.value ?? []).map((h) => h.groupName))),
]);

const filtered = computed(() =>
  activeGroup.value === "Все"
    ? (data.value ?? [])
    : (data.value ?? []).filter((h) => h.groupName === activeGroup.value),
);

function toggle(id: string) {
  wizard.value.selected = wizard.value.selected === id ? null : id;
}
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-28">
    <h1 class="mt-4 font-display text-3xl text-text">Вам подойдёт</h1>
    <p class="text-sm text-text-muted">
      {{ filtered.length }} образов по вашим ответам
    </p>

    <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
      <AppChip
        v-for="g in groups"
        :key="g"
        :active="activeGroup === g"
        @click="activeGroup = g"
      >
        {{ g }}
      </AppChip>
    </div>

    <p v-if="pending" class="mt-6 text-text-muted">Загрузка…</p>
    <p v-else-if="error" class="mt-6 text-red-600">
      Не удалось загрузить каталог: {{ error.message }}
    </p>
    <div v-else class="mt-4 grid grid-cols-2 gap-3">
      <HairstyleCard
        v-for="h in filtered"
        :key="h.id"
        :hairstyle="h"
        :match="h.matchScore ?? undefined"
        :selected="wizard.selected === h.id"
        @click="toggle(h.id)"
      />
    </div>
  </div>

  <div class="fixed inset-x-0 bottom-0">
    <div
      class="mx-auto flex max-w-md items-center gap-4 rounded-t-[28px] border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_-12px_rgba(60,40,30,0.2)]"
    >
      <div>
        <div class="font-bold text-text">
          {{ wizard.selected ? "Выбрано" : "Выберите образ" }}
        </div>
        <div class="text-xs text-text-muted">1-я генерация бесплатно</div>
      </div>
      <AppButton
        class="flex-1"
        :class="{ 'pointer-events-none opacity-50': !wizard.selected }"
        @click="navigateTo('/result')"
      >
        ✦ Сгенерировать
      </AppButton>
    </div>
  </div>
</template>
