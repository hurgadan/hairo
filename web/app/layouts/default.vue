<template>
  <div class="min-h-screen bg-bg text-text">
    <div class="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <AppHeader />
      <main class="flex flex-1 flex-col">
        <slot />
      </main>
    </div>
  </div>
</template>
