<script setup lang="ts">
import type { Hairstyle } from "~/types/hairstyle";

const config = useRuntimeConfig();
const wizard = useWizard();

const { data, pending, error } = await useFetch<Hairstyle[]>(
  () => `${config.public.apiBase}/catalog/hairstyles`,
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

function toggle(slug: string) {
  const sel = wizard.value.selected;
  const i = sel.indexOf(slug);
  if (i >= 0) sel.splice(i, 1);
  else sel.push(slug);
}

const fakeMatch = (i: number) => Math.max(72, 96 - i * 2);
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
        v-for="(h, i) in filtered"
        :key="h.id"
        :hairstyle="h"
        :match="fakeMatch(i)"
        :selected="wizard.selected.includes(h.slug)"
        @click="toggle(h.slug)"
      />
    </div>
  </div>

  <div class="fixed inset-x-0 bottom-0">
    <div
      class="mx-auto flex max-w-md items-center gap-4 rounded-t-[28px] border-t border-border bg-surface px-5 py-4 shadow-[0_-8px_24px_-12px_rgba(60,40,30,0.2)]"
    >
      <div>
        <div class="font-bold text-text">
          Выбрано {{ wizard.selected.length }}
        </div>
        <div class="text-xs text-text-muted">1-я генерация бесплатно</div>
      </div>
      <AppButton
        class="flex-1"
        :class="{ 'pointer-events-none opacity-50': !wizard.selected.length }"
        @click="navigateTo('/result')"
      >
        ✦ Сгенерировать
      </AppButton>
    </div>
  </div>
</template>
