<script setup lang="ts">
const { theme, toggle } = useTheme();
</script>

<template>
  <button
    type="button"
    class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-text-muted"
    :aria-label="
      theme === 'dark' ? $t('header.themeToLight') : $t('header.themeToDark')
    "
    @click="toggle"
  >
    {{ theme === "dark" ? "☀" : "☾" }}
  </button>
</template>
