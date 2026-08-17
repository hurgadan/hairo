<script setup lang="ts">
const localePath = useLocalePath();
</script>

<template>
  <header class="flex items-center justify-between px-6 pt-4">
    <NuxtLink :to="localePath('/')" aria-label="Hairo">
      <AppLogo />
    </NuxtLink>
    <div class="flex items-center gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  </header>
</template>
