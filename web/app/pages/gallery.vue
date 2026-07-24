<script setup lang="ts">
const looks = ["Итал. боб", "Лоб", "Волны"];

const { balance, fetchBalance } = useBilling();
onMounted(() => {
  fetchBalance().catch(() => {
    // Индикатор просто не покажет число, если баланс не загрузился.
  });
});
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <div class="mt-4 flex items-center justify-between">
      <h1 class="font-display text-3xl text-text">Мои образы</h1>
      <NuxtLink
        to="/balance"
        class="flex items-center gap-1 rounded-full bg-text px-3 py-1.5 text-sm font-bold text-bg"
      >
        ✦ {{ balance ?? "…" }}
      </NuxtLink>
    </div>

    <div
      class="mt-4 rounded-2xl bg-gradient-to-br from-accent to-accent-dark p-4 text-white"
    >
      <div class="font-bold">Приведите друга</div>
      <p class="mt-1 max-w-[14rem] text-sm text-white/85">
        Вы оба получите по 2 бесплатных примерки.
      </p>
      <button
        type="button"
        class="mt-3 rounded-xl bg-surface px-4 py-2 text-sm font-bold text-accent-dark"
      >
        Поделиться ссылкой
      </button>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <div
        v-for="n in looks"
        :key="n"
        class="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2"
      >
        <span
          class="absolute bottom-2 left-2 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-semibold text-text-muted"
        >
          {{ n }}
        </span>
      </div>
      <NuxtLink
        to="/upload"
        class="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong text-text-muted"
      >
        <span class="text-2xl">＋</span>
        <span class="text-xs font-semibold">Новый образ</span>
      </NuxtLink>
    </div>
  </div>
</template>
