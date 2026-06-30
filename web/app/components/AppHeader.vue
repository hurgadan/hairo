<template>
  <header class="flex items-center justify-between px-6 pt-4">
    <NuxtLink to="/" aria-label="Hairo">
      <AppLogo />
    </NuxtLink>
    <div class="flex items-center gap-2">
      <span
        class="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold text-text-muted"
      >
        RU
      </span>
      <ThemeToggle />
    </div>
  </header>
</template>
