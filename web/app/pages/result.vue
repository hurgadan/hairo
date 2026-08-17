<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const photo = useCurrentPhoto();
const wizard = useWizard();
const { start, poll, current } = useGeneration();

const error = ref<string | null>(null);
const running = ref(false);

async function runGeneration() {
  if (!photo.value) {
    await navigateTo(localePath("/upload"));
    return;
  }
  if (!wizard.value.selected) {
    await navigateTo(localePath("/catalog"));
    return;
  }

  error.value = null;
  running.value = true;
  try {
    const started = await start(photo.value.id, wizard.value.selected);
    const result = await poll(started.id);

    if (result.status !== "completed") {
      error.value = result.error ?? t("result.failed");
    }
  } catch (e) {
    // Баланс исчерпан — ведём на пополнение (с возвратом к генерации после оплаты).
    if (e instanceof InsufficientCreditsError) {
      await navigateTo(localePath("/balance") + "?reason=out-of-credits");
      return;
    }
    error.value = t("result.failed");
    console.error(e);
  } finally {
    running.value = false;
  }
}

onMounted(runGeneration);
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <template v-if="running || (!error && current?.status !== 'completed')">
      <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div
          class="h-14 w-14 animate-spin rounded-full border-4 border-border-strong border-t-accent"
        />
        <div>
          <h1 class="font-display text-3xl text-text">
            {{ $t("result.title") }}
          </h1>
          <p class="mt-2 text-sm text-text-muted">
            {{ $t("result.subtitle") }}
          </p>
        </div>
      </div>
    </template>

    <template v-else-if="error">
      <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div>
          <h1 class="font-display text-3xl text-text">
            {{ $t("common.errorTitle") }}
          </h1>
          <p class="mt-2 text-sm text-text-muted">{{ error }}</p>
        </div>
        <div class="flex w-full flex-col gap-3">
          <AppButton
            :class="{ 'pointer-events-none opacity-50': running }"
            @click="runGeneration"
          >
            {{ $t("common.retry") }}
          </AppButton>
          <button
            type="button"
            class="text-sm font-semibold text-text-muted"
            @click="navigateTo(localePath('/catalog'))"
          >
            {{ $t("result.pickAnother") }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="py-4">
        <div
          class="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl bg-text bg-cover bg-center p-5"
          :style="current?.resultUrl ? { backgroundImage: `url(${current.resultUrl})` } : {}"
        >
          <div class="flex justify-between">
            <span
              class="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur"
            >
              ✦ Hairo
            </span>
          </div>
          <div>
            <p class="text-xs font-bold tracking-wide text-accent uppercase">
              {{ $t("result.ready") }}
            </p>
            <p class="font-display text-3xl text-white">
              {{ $t("result.readyTitle") }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex gap-3">
          <a
            class="flex-1"
            :href="current?.resultUrl ?? undefined"
            download
            target="_blank"
          >
            <AppButton class="w-full">{{ $t("result.download") }}</AppButton>
          </a>
          <AppButton variant="secondary" :block="false" class="w-[52px] px-0">
            ↗
          </AppButton>
        </div>

        <p class="mt-4 text-center text-sm text-text-muted">
          {{ $t("result.share") }}
          <span class="text-accent">{{ $t("result.shareBonus") }}</span>
        </p>

        <div class="mt-6 flex gap-3">
          <AppButton variant="secondary" @click="navigateTo(localePath('/catalog'))">
            {{ $t("result.oneMore") }}
          </AppButton>
          <AppButton variant="dark" @click="navigateTo(localePath('/balance'))">
            {{ $t("result.topUp") }}
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>
