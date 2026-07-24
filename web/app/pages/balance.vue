<script setup lang="ts">
import {
  CreditTransactionType,
  type CreditTransaction,
} from "@hurgadan/hairo-contracts";

// Пакеты зафиксированы в Фазе 4 (COGS + Stripe-комиссия) — см. PRODUCT.md §4.2.
// `credits` идёт в будущий Stripe-checkout (Срез 3), сейчас витрина.
const packs = [
  { credits: 5, sub: "€1,00 за образ", price: "€4,99", best: false },
  { credits: 20, sub: "€0,75 за образ", price: "€14,99", best: true },
  { credits: 50, sub: "€0,60 за образ", price: "€29,99", best: false },
];
const selected = ref(1);

const route = useRoute();
const outOfCredits = computed(() => route.query.reason === "out-of-credits");

const { balance, fetchBalance, fetchTransactions } = useBilling();
const transactions = ref<CreditTransaction[]>([]);

onMounted(async () => {
  await Promise.all([
    fetchBalance(),
    fetchTransactions().then((t) => {
      transactions.value = t;
    }),
  ]).catch(() => {
    // Молча: экран показывает пакеты даже без загруженного баланса/истории.
  });
});

const primerkaWord = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "примерка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "примерки";
  return "примерок";
};

const TX_LABELS: Record<CreditTransactionType, string> = {
  [CreditTransactionType.SignupBonus]: "Бонус за регистрацию",
  [CreditTransactionType.Purchase]: "Пополнение",
  [CreditTransactionType.GenerationDebit]: "Примерка",
  [CreditTransactionType.GenerationRefund]: "Возврат за примерку",
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("ru-RU", {
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
        {{ outOfCredits ? "Примерки закончились" : "Продолжите примерки" }}
      </h1>
      <p class="mt-2 text-sm text-text-muted">
        <template v-if="outOfCredits">
          Пополните баланс, чтобы примерить следующий образ — кредиты не сгорают.
        </template>
        <template v-else>
          Первая была бесплатной. Кредиты не сгорают.
        </template>
      </p>
      <p v-if="balance !== null" class="mt-3 text-sm font-bold text-text">
        Баланс: {{ balance }} {{ primerkaWord(balance) }}
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
          ВЫГОДНО
        </span>
        <div class="flex-1">
          <div class="font-bold text-text">
            {{ p.credits }} {{ primerkaWord(p.credits) }}
          </div>
          <div class="text-xs text-text-muted">{{ p.sub }}</div>
        </div>
        <div class="font-extrabold text-text">{{ p.price }}</div>
      </button>
    </div>

    <section v-if="transactions.length" class="mt-8">
      <h2 class="text-xs font-bold tracking-wide text-text-muted uppercase">
        История
      </h2>
      <ul class="mt-3 flex flex-col divide-y divide-border-strong">
        <li
          v-for="tx in transactions"
          :key="tx.id"
          class="flex items-center justify-between py-3"
        >
          <div>
            <div class="text-sm font-semibold text-text">
              {{ TX_LABELS[tx.type] }}
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
        Оплата скоро
      </AppButton>
      <p class="mt-3 text-center text-xs text-text-muted">
        Онлайн-оплата через Stripe появится в следующем обновлении.
      </p>
    </div>
  </div>
</template>
