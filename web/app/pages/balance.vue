<script setup lang="ts">
import {
  CreditTransactionType,
  type CreditTransaction,
} from "@hurgadan/hairo-contracts";

const { t, locale } = useI18n();

// Пакеты зафиксированы в Фазе 4 (COGS + Stripe-комиссия) — см. PRODUCT.md §4.2.
// `credits` идёт в будущий Stripe-checkout (Срез 3), сейчас витрина.
const packs = [
  { credits: 5, perLook: "€1,00", price: "€4,99", best: false },
  { credits: 20, perLook: "€0,75", price: "€14,99", best: true },
  { credits: 50, perLook: "€0,60", price: "€29,99", best: false },
];
const selected = ref(1);

const route = useRoute();
const outOfCredits = computed(() => route.query.reason === "out-of-credits");

const { balance, fetchBalance, fetchTransactions } = useBilling();
const { user, isRegistered, ensureUser } = useAuth();
const transactions = ref<CreditTransaction[]>([]);

onMounted(async () => {
  void ensureUser();
  await Promise.all([
    fetchBalance(),
    fetchTransactions().then((t) => {
      transactions.value = t;
    }),
  ]).catch(() => {
    // Молча: экран показывает пакеты даже без загруженного баланса/истории.
  });
});

/** Число примерок со словом в правильной форме — правила склонения в словарях. */
const tryOns = (n: number): string => t("balance.tryOns", { n }, n);

const txLabel = (type: CreditTransactionType): string => t(`balance.tx.${type}`);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(locale.value, {
    day: "numeric",
    month: "short",
  });
</script>

<template>
  <div class="flex flex-1 flex-col px-6 pb-8">
    <div class="mt-6 text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-2xl"
      >
        ✦
      </div>
      <h1 class="mt-4 font-display text-3xl text-text">
        {{ outOfCredits ? $t("balance.outOfCreditsTitle") : $t("balance.title") }}
      </h1>
      <p class="mt-2 text-sm text-text-muted">
        <template v-if="outOfCredits">
          {{ $t("balance.outOfCreditsText") }}
        </template>
        <template v-else-if="isRegistered">
          {{ $t("balance.textRegistered") }}
        </template>
        <template v-else>
          {{ $t("balance.textGuest") }}
        </template>
      </p>
      <p v-if="balance !== null" class="mt-3 text-sm font-bold text-text">
        {{ $t("balance.balance", { tryOns: tryOns(balance) }) }}
      </p>
      <p class="mt-1 text-xs text-text-muted">
        <template v-if="isRegistered">
          {{ $t("balance.account", { email: user?.email }) }}
        </template>
        <template v-else>
          {{ $t("balance.guestSession") }}
        </template>
      </p>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <button
        v-for="(p, i) in packs"
        :key="p.credits"
        type="button"
        class="relative flex items-center rounded-2xl p-4 text-left transition"
        :class="
          i === selected
            ? 'border-2 border-accent bg-accent-soft'
            : 'border border-border-strong bg-surface'
        "
        @click="selected = i"
      >
        <span
          v-if="p.best"
          class="absolute -top-2 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white"
        >
          {{ $t("balance.best") }}
        </span>
        <div class="flex-1">
          <div class="font-bold text-text">{{ tryOns(p.credits) }}</div>
          <div class="text-xs text-text-muted">
            {{ $t("balance.perLook", { price: p.perLook }) }}
          </div>
        </div>
        <div class="font-extrabold text-text">{{ p.price }}</div>
      </button>
    </div>

    <section v-if="transactions.length" class="mt-8">
      <h2 class="text-xs font-bold tracking-wide text-text-muted uppercase">
        {{ $t("balance.history") }}
      </h2>
      <ul class="mt-3 flex flex-col divide-y divide-border-strong">
        <li
          v-for="tx in transactions"
          :key="tx.id"
          class="flex items-center justify-between py-3"
        >
          <div>
            <div class="text-sm font-semibold text-text">
              {{ txLabel(tx.type) }}
            </div>
            <div class="text-xs text-text-muted">
              {{ formatDate(tx.createdAt) }}
            </div>
          </div>
          <div
            class="text-sm font-bold"
            :class="tx.amount > 0 ? 'text-accent' : 'text-text-muted'"
          >
            {{ tx.amount > 0 ? "+" : "" }}{{ tx.amount }}
          </div>
        </li>
      </ul>
    </section>

    <div class="mt-auto pt-8">
      <AppButton variant="dark" disabled class="opacity-50">
        {{ $t("balance.payLater") }}
      </AppButton>
      <p class="mt-3 text-center text-xs text-text-muted">
        {{ $t("balance.payLaterHint") }}
      </p>
    </div>
  </div>
</template>
