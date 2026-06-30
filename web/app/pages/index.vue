<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <section class="pt-6">
      <p
        class="text-xs font-semibold tracking-widest text-accent-dark uppercase"
      >
        AI-примерка причёсок
      </p>
      <h1 class="mt-3 font-display text-4xl leading-tight text-text">
        Примерьте новую причёску по своему фото
      </h1>
      <p class="mt-3 text-text-muted">
        Загрузите селфи — подберём образы, которые вам идут, и покажем результат
        на вашем лице.
      </p>
    </section>

    <section
      class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border"
    >
      <div class="flex aspect-[3/4] items-end justify-center bg-surface-2 pb-4">
        <span
          class="rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-text-muted"
        >
          до
        </span>
      </div>
      <div
        class="flex aspect-[3/4] items-end justify-center bg-accent-soft pb-4"
      >
        <span class="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
          после
        </span>
      </div>
    </section>

    <div class="mt-auto pt-8">
      <AppButton @click="navigateTo('/upload')">✦ Примерить причёску</AppButton>
      <p class="mt-3 text-center text-sm font-semibold text-text-muted">
        Первая примерка — бесплатно · 30 образов
      </p>
    </div>
  </div>
</template>
