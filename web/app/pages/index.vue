<script setup lang="ts">
import type { Hairstyle } from "~/types/hairstyle";

const config = useRuntimeConfig();

const {
  data: hairstyles,
  pending,
  error,
} = await useFetch<Hairstyle[]>(
  () => `${config.public.apiBase}/catalog/hairstyles`,
);
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl px-6 py-10">
    <header class="mb-8">
      <p
        class="text-xs font-semibold uppercase tracking-widest text-accent-dark"
      >
        AI-примерка причёсок
      </p>
      <h1 class="mt-2 font-display text-5xl leading-none text-text">Hairo</h1>
      <p class="mt-3 text-text-muted">Каталог образов из API.</p>
    </header>

    <p v-if="pending" class="text-text-muted">Загрузка…</p>
    <p v-else-if="error" class="text-red-600">
      Не удалось загрузить каталог: {{ error.message }}
    </p>

    <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <article
        v-for="h in hairstyles"
        :key="h.id"
        class="overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm"
      >
        <div
          class="flex aspect-[3/4] items-center justify-center bg-surface-2 text-xs text-text-muted"
        >
          превью
        </div>
        <div class="p-3">
          <h2 class="font-display text-lg text-text">
            {{ h.name.ru ?? h.slug }}
          </h2>
          <p class="text-xs text-text-muted">{{ h.groupName }}</p>
        </div>
      </article>
    </div>
  </main>
</template>
