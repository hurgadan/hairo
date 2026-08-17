<script setup lang="ts">
import { Occasion } from "@hurgadan/hairo-contracts";

const { t } = useI18n();
const localePath = useLocalePath();

const wizard = useWizard();
const analysis = useCurrentAnalysis();
const step = ref(1);
const total = 6;

const genderOptions = computed(() => [
  { v: "feminine", t: t("wizard.gender.feminine") },
  { v: "masculine", t: t("wizard.gender.masculine") },
  { v: "all", t: t("wizard.gender.all") },
]);

const lengthOptions = computed(() => [
  { v: "shorter", t: t("wizard.length.shorter") },
  { v: "same", t: t("wizard.length.same") },
  { v: "longer", t: t("wizard.length.longer") },
  { v: "any", t: t("wizard.length.any") },
]);

const occasionOptions = computed<{ v: Occasion; t: string }[]>(() => [
  { v: Occasion.Everyday, t: t("taxonomy.occasion.everyday") },
  { v: Occasion.Work, t: t("taxonomy.occasion.work") },
  { v: Occasion.Event, t: t("taxonomy.occasion.event") },
  { v: Occasion.Bold, t: t("taxonomy.occasion.bold") },
]);

function toggleOccasion(o: Occasion) {
  const list = wizard.value.occasions;
  const i = list.indexOf(o);
  if (i >= 0) list.splice(i, 1);
  else list.push(o);
}

function next() {
  if (step.value < total) step.value += 1;
  else navigateTo(localePath("/catalog"));
}

function back() {
  if (step.value > 1) step.value -= 1;
  else navigateTo(localePath("/detect"));
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
      {{ $t("wizard.step", { current: step, total }) }}
    </p>

    <!-- 1. Пол-подача -->
    <template v-if="step === 1">
      <h1 class="mt-2 font-display text-3xl text-text">
        {{ $t("wizard.gender.title") }}
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          v-for="opt in genderOptions"
          :key="opt.v"
          :title="opt.t"
          :active="wizard.gender === opt.v"
          @click="wizard.gender = opt.v as typeof wizard.gender"
        />
      </div>
    </template>

    <!-- 2. Длина -->
    <template v-else-if="step === 2">
      <h1 class="mt-2 font-display text-3xl text-text">
        {{ $t("wizard.length.title") }}
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          v-for="opt in lengthOptions"
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
        {{ $t("wizard.boldness.title") }}
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="$t('wizard.boldness.light')"
          :subtitle="$t('wizard.boldness.lightHint')"
          :active="wizard.boldness === 'light'"
          @click="wizard.boldness = 'light'"
        />
        <OptionCard
          :title="$t('wizard.boldness.noticeable')"
          :subtitle="$t('wizard.boldness.noticeableHint')"
          :active="wizard.boldness === 'noticeable'"
          @click="wizard.boldness = 'noticeable'"
        />
        <OptionCard
          :title="$t('wizard.boldness.radical')"
          :subtitle="$t('wizard.boldness.radicalHint')"
          :active="wizard.boldness === 'radical'"
          @click="wizard.boldness = 'radical'"
        />
      </div>
    </template>

    <!-- 4. Повод / вайб (мультивыбор) -->
    <template v-else-if="step === 4">
      <h1 class="mt-2 font-display text-3xl text-text">
        {{ $t("wizard.occasion.title") }}
      </h1>
      <p class="mt-2 text-sm text-text-muted">
        {{ $t("wizard.occasion.hint") }}
      </p>
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
        {{ $t("wizard.maintenance.title") }}
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="$t('wizard.maintenance.low')"
          :active="wizard.maintenance === 'low'"
          @click="wizard.maintenance = 'low'"
        />
        <OptionCard
          :title="$t('wizard.maintenance.medium')"
          :active="wizard.maintenance === 'medium'"
          @click="wizard.maintenance = 'medium'"
        />
        <OptionCard
          :title="$t('wizard.maintenance.high')"
          :active="wizard.maintenance === 'high'"
          @click="wizard.maintenance = 'high'"
        />
      </div>
    </template>

    <!-- 6. Цвет -->
    <template v-else>
      <h1 class="mt-2 font-display text-3xl text-text">
        {{ $t("wizard.color.title") }}
      </h1>
      <div class="mt-6 flex flex-col gap-3">
        <OptionCard
          :title="$t('wizard.color.keep')"
          :active="!wizard.changeColor"
          @click="wizard.changeColor = false"
        />
        <OptionCard
          :title="$t('wizard.color.change')"
          :subtitle="$t('wizard.color.changeHint')"
          :active="wizard.changeColor"
          @click="wizard.changeColor = true"
        />
      </div>
    </template>

    <div class="mt-auto pt-8">
      <p class="mb-4 text-center text-sm font-semibold text-accent-dark">
        <button type="button" @click="navigateTo(localePath('/catalog'))">
          {{ $t("wizard.skip") }}
        </button>
      </p>
      <div class="flex gap-3">
        <AppButton variant="secondary" :block="false" class="px-5" @click="back">
          ←
        </AppButton>
        <AppButton class="flex-1" @click="next">
          {{ step === total ? $t("wizard.finish") : $t("common.next") }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
