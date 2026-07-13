<script setup lang="ts">
const { upload } = usePhotos();

const file = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const consent = ref(false);
const uploading = ref(false);
const error = ref<string | null>(null);

function onFile(e: Event) {
  const picked = (e.target as HTMLInputElement).files?.[0] ?? null;
  file.value = picked;
  error.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = picked ? URL.createObjectURL(picked) : null;
}

const canSubmit = computed(
  () => !!file.value && consent.value && !uploading.value,
);

async function onContinue() {
  if (!file.value || !consent.value || uploading.value) return;
  uploading.value = true;
  error.value = null;
  try {
    await upload(file.value, consent.value);
    await navigateTo("/analyze");
  } catch (e) {
    error.value = "Не удалось загрузить фото. Попробуйте ещё раз.";
    console.error(e);
  } finally {
    uploading.value = false;
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="3" :current="1" class="mt-4" />

    <h1 class="mt-6 font-display text-3xl text-text">Загрузите селфи</h1>
    <p class="mt-2 text-sm text-text-muted">
      Лучше всего анфас при дневном свете.
    </p>

    <label
      class="mt-6 flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-dashed border-border-strong bg-surface text-center"
    >
      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Ваше селфи"
        class="h-full w-full object-cover"
      />
      <template v-else>
        <span
          class="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-2xl"
        >
          📷
        </span>
        <span class="font-semibold text-text">Выберите фото</span>
      </template>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFile"
      />
    </label>

    <label class="mt-6 flex items-center gap-3 rounded-2xl bg-surface-2 p-4">
      <input
        v-model="consent"
        type="checkbox"
        class="h-5 w-5 accent-[var(--accent)]"
      />
      <span class="text-sm text-text-muted">
        Согласен на
        <NuxtLink to="/privacy" class="underline" @click.stop
          >обработку фото</NuxtLink
        >
        для подбора.
      </span>
    </label>

    <div class="mt-auto pt-8">
      <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
      <AppButton
        :class="{ 'pointer-events-none opacity-50': !canSubmit }"
        @click="onContinue"
      >
        {{ uploading ? "Загрузка…" : "Продолжить" }}
      </AppButton>
    </div>
  </div>
</template>
