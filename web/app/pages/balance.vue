<script setup lang="ts">
const packs = [
  { title: "1 примерка", sub: "проба", price: "€2,90", best: false },
  { title: "5 примерок", sub: "€1,80 за образ", price: "€8,90", best: true },
  { title: "15 примерок", sub: "€1,33 за образ", price: "€19,90", best: false },
];
const selected = ref(1);
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <div class="mt-6 text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-2xl"
      >
        ✦
      </div>
      <h1 class="mt-4 font-display text-3xl text-text">Продолжите примерки</h1>
      <p class="mt-2 text-sm text-text-muted">
        Первая была бесплатной. Кредиты не сгорают.
      </p>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <button
        v-for="(p, i) in packs"
        :key="p.title"
        type="button"
        class="relative flex items-center rounded-2xl p-4 text-left transition"
        :class="
          i === selected
            ? 'border-2 border-accent bg-accent-soft'
            : 'border border-border-strong bg-surface'
        "
        @click="selected = i"
      >
        <span
          v-if="p.best"
          class="absolute -top-2 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white"
        >
          ВЫГОДНО
        </span>
        <div class="flex-1">
          <div class="font-bold text-text">{{ p.title }}</div>
          <div class="text-xs text-text-muted">{{ p.sub }}</div>
        </div>
        <div class="font-extrabold text-text">{{ p.price }}</div>
      </button>
    </div>

    <div class="mt-auto pt-8">
      <AppButton variant="dark">Оплатить · {{ packs[selected]?.price }}</AppButton>
      <p class="mt-3 text-center text-xs text-text-muted">
        Безопасная оплата через Stripe
      </p>
    </div>
  </div>
</template>
