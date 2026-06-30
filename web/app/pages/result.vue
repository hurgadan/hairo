<template>
  <div class="px-6 py-4">
    <div
      class="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl bg-text p-5"
    >
      <div class="flex justify-between">
        <span
          class="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur"
        >
          ✦ Hairo
        </span>
      </div>
      <span class="self-center text-sm text-white/70">
        Ваше фото · Итальянский боб
      </span>
      <div>
        <p class="text-xs font-bold tracking-wide text-accent uppercase">
          ✓ Готово
        </p>
        <p class="font-display text-3xl text-white">Вот ваш новый образ</p>
      </div>
    </div>

    <div class="mt-4 flex gap-3">
      <AppButton class="flex-1">↓ Скачать</AppButton>
      <AppButton variant="secondary" :block="false" class="w-[52px] px-0">
        ↗
      </AppButton>
    </div>

    <p class="mt-4 text-center text-sm text-text-muted">
      Поделитесь и получите <span class="text-accent">+2 примерки</span>
    </p>

    <div class="mt-6 flex gap-3">
      <AppButton variant="secondary" @click="navigateTo('/catalog')">
        Ещё образ
      </AppButton>
      <AppButton variant="dark" @click="navigateTo('/balance')">
        Пополнить
      </AppButton>
    </div>
  </div>
</template>
