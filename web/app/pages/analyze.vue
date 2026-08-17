<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const photo = useCurrentPhoto();
const { start, poll } = useFaceAnalysis();

const error = ref<string | null>(null);
const running = ref(false);

async function runAnalysis() {
  if (!photo.value) {
    await navigateTo(localePath("/upload"));
    return;
  }

  error.value = null;
  running.value = true;
  try {
    const started = await start(photo.value.id);
    const result = await poll(started.id);

    if (result.status !== "completed") {
      error.value = t("analyze.failed");
      return;
    }

    await navigateTo(localePath("/detect"));
  } catch (e) {
    error.value = t("analyze.failed");
    console.error(e);
  } finally {
    running.value = false;
  }
}

onMounted(runAnalysis);
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="2" class="mt-4" />

    <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <template v-if="!error">
        <div
          class="h-14 w-14 animate-spin rounded-full border-4 border-border-strong border-t-accent"
        />
        <div>
          <h1 class="font-display text-3xl text-text">
            {{ $t("analyze.title") }}
          </h1>
          <p class="mt-2 text-sm text-text-muted">
            {{ $t("analyze.subtitle") }}
          </p>
        </div>
      </template>

      <template v-else>
        <div>
          <h1 class="font-display text-3xl text-text">
            {{ $t("common.errorTitle") }}
          </h1>
          <p class="mt-2 text-sm text-text-muted">{{ error }}</p>
        </div>
        <div class="flex w-full flex-col gap-3">
          <AppButton :class="{ 'pointer-events-none opacity-50': running }" @click="runAnalysis">
            {{ $t("common.retry") }}
          </AppButton>
          <button
            type="button"
            class="text-sm font-semibold text-text-muted"
            @click="navigateTo(localePath('/wizard'))"
          >
            {{ $t("analyze.skip") }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
