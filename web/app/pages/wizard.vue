<script setup lang="ts">
import { Occasion } from "@hurgadan/hairo-contracts";

const wizard = useWizard();
const analysis = useCurrentAnalysis();
const step = ref(1);
const total = 6;

const occasionOptions: { v: Occasion; t: string }[] = [
  { v: Occasion.Everyday, t: "Повседнев" },
  { v: Occasion.Work, t: "Деловой" },
  { v: Occasion.Event, t: "Событие" },
  { v: Occasion.Bold, t: "Смелый" },
];

function toggleOccasion(o: Occasion) {
  const list = wizard.value.occasions;
  const i = list.indexOf(o);
  if (i >= 0) list.splice(i, 1);
  else list.push(o);
}

function next() {
  if (step.value < total) step.value += 1;
  else navigateTo("/catalog");
}

function back() {
  if (step.value > 1) step.value -= 1;
  else navigateTo("/detect");
}

onMounted(() => {
  // Префилл из автодетекта — только если пользователь ещё не трогал шаг вручную.
  const detectedGender = analysis.value?.result?.genderPresentation as
    | "feminine"
    | "masculine"
    | "unisex"
    | undefined;
  if (wizard.value.gender === "all" && detectedGender && detectedGender !== "unisex") {
    wizard.value.gender = detectedGender;
  }
});
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <StepProgress :total="total" :current="step" class="mt-4" />

    <p class="mt-6 text-xs font-bold tracking-wide text-accent-dark uppercase">
      Шаг {{ step }} из {{ total }}
    </p>

    <!-- 1. Пол-подача -->
    <template v-if="step === 1">
      <h1 class="mt-2 font-display text-3xl text-text">
        Какие образы показать?
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          v-for="opt in [
            { v: 'feminine', t: 'Женские' },
            { v: 'masculine', t: 'Мужские' },
            { v: 'all', t: 'Показать все' },
          ]"
          :key="opt.v"
          :title="opt.t"
          :active="wizard.gender === opt.v"
          @click="wizard.gender = opt.v as typeof wizard.gender"
        />
      </div>
    </template>

    <!-- 2. Длина -->
    <template v-else-if="step === 2">
      <h1 class="mt-2 font-display text-3xl text-text">Желаемая длина?</h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          v-for="opt in [
            { v: 'shorter', t: 'Короче, чем сейчас' },
            { v: 'same', t: 'Примерно как сейчас' },
            { v: 'longer', t: 'Длиннее' },
            { v: 'any', t: 'Не важно' },
          ]"
          :key="opt.v"
          :title="opt.t"
          :active="wizard.length === opt.v"
          @click="wizard.length = opt.v as typeof wizard.length"
        />
      </div>
    </template>

    <!-- 3. Смелость -->
    <template v-else-if="step === 3">
      <h1 class="mt-2 font-display text-3xl text-text">
        Насколько смелую смену хотите?
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="'Лёгкое обновление'"
          subtitle="Освежить, оставаясь собой"
          :active="wizard.boldness === 'light'"
          @click="wizard.boldness = 'light'"
        />
        <OptionCard
          :title="'Заметная смена'"
          subtitle="Новый образ, но узнаваемо"
          :active="wizard.boldness === 'noticeable'"
          @click="wizard.boldness = 'noticeable'"
        />
        <OptionCard
          :title="'Кардинально'"
          subtitle="Полностью другой человек"
          :active="wizard.boldness === 'radical'"
          @click="wizard.boldness = 'radical'"
        />
      </div>
    </template>

    <!-- 4. Повод / вайб (мультивыбор) -->
    <template v-else-if="step === 4">
      <h1 class="mt-2 font-display text-3xl text-text">Повод и вайб</h1>
      <p class="mt-2 text-sm text-text-muted">Можно выбрать несколько.</p>
      <div class="mt-6 flex flex-wrap gap-2">
        <AppChip
          v-for="opt in occasionOptions"
          :key="opt.v"
          :active="wizard.occasions.includes(opt.v)"
          @click="toggleOccasion(opt.v)"
        >
          {{ opt.t }}
        </AppChip>
      </div>
    </template>

    <!-- 5. Уход -->
    <template v-else-if="step === 5">
      <h1 class="mt-2 font-display text-3xl text-text">
        Готовность к укладке?
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="'Минимум возни'"
          :active="wizard.maintenance === 'low'"
          @click="wizard.maintenance = 'low'"
        />
        <OptionCard
          :title="'Средне'"
          :active="wizard.maintenance === 'medium'"
          @click="wizard.maintenance = 'medium'"
        />
        <OptionCard
          :title="'Готов(а) заморочиться'"
          :active="wizard.maintenance === 'high'"
          @click="wizard.maintenance = 'high'"
        />
      </div>
    </template>

    <!-- 6. Цвет -->
    <template v-else>
      <h1 class="mt-2 font-display text-3xl text-text">Цвет волос?</h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="'Оставить свой'"
          :active="!wizard.changeColor"
          @click="wizard.changeColor = false"
        />
        <OptionCard
          :title="'Сменить цвет'"
          subtitle="Выбор оттенка — на следующем шаге"
          :active="wizard.changeColor"
          @click="wizard.changeColor = true"
        />
      </div>
    </template>

    <div class="mt-auto pt-8">
      <p class="mb-4 text-center text-sm font-semibold text-accent-dark">
        <button type="button" @click="navigateTo('/catalog')">
          Просто покажите варианты →
        </button>
      </p>
      <div class="flex gap-3">
        <AppButton variant="secondary" :block="false" class="px-5" @click="back">
          ←
        </AppButton>
        <AppButton class="flex-1" @click="next">
          {{ step === total ? "Показать образы" : "Далее" }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
