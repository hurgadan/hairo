<script setup lang="ts">
import type { Locale } from "@hurgadan/hairo-contracts";

// Нативный select: в хедере мало места, а доступность и мобильный пикер
// достаются бесплатно. В закрытом виде показываем код языка (RU/DE/ES).
const { locale, locales, setLocale } = useI18n();
const { saveLocale } = useAuth();

async function onChange(event: Event) {
  const code = (event.target as HTMLSelectElement).value as Locale;
  await setLocale(code);
  await saveLocale(code);
}
</script>

<template>
  <select
    :value="locale"
    :aria-label="$t('header.language')"
    class="appearance-none rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold text-text-muted"
    @change="onChange"
  >
    <option v-for="l in locales" :key="l.code" :value="l.code">
      {{ l.code.toUpperCase() }}
    </option>
  </select>
</template>
