<script setup lang="ts">
import type { Locale } from "@hurgadan/hairo-contracts";

/**
 * Регистрация на пике мотивации (PRODUCT.md §4.3): email + код из письма,
 * без пароля. Открывается с кнопки «Сгенерировать» — гость уже залил селфи,
 * прошёл визард и выбрал образ, регистрация читается как последнее действие.
 */
const emit = defineEmits<{ close: []; success: [] }>();

const { t, locale } = useI18n();
const localePath = useLocalePath();

const CODE_LENGTH = 6;
/** Пауза между письмами на один адрес (бэкенд: `OTP_RESEND_AFTER_SECONDS`).
 * Если `retryAfterSeconds` больше — сработал часовой лимит по IP, не по адресу. */
const ADDRESS_RESEND_SECONDS = 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { requestOtp, verifyOtp } = useAuth();

const step = ref<"email" | "code">("email");
const email = ref("");
const code = ref("");
const pending = ref(false);
const error = ref<string | null>(null);
const notice = ref<string | null>(null);
const expiresInMinutes = ref(10);

const emailInput = ref<{ focus: () => void } | null>(null);
const codeInput = ref<{ focus: () => void } | null>(null);

/** Секунды до следующего разрешённого запроса кода; 0 — можно запрашивать. */
const resendIn = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function stopCountdown(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

function startCountdown(seconds: number): void {
  stopCountdown();
  resendIn.value = seconds;
  timer = setInterval(() => {
    resendIn.value -= 1;
    if (resendIn.value <= 0) stopCountdown();
  }, 1000);
}

const resendLabel = computed(() => {
  const m = Math.floor(resendIn.value / 60);
  const s = String(resendIn.value % 60).padStart(2, "0");
  return `${m}:${s}`;
});

function focusStepInput(): void {
  void nextTick(() => {
    (step.value === "email" ? emailInput : codeInput).value?.focus();
  });
}

async function sendCode(): Promise<void> {
  const value = email.value.trim().toLowerCase();
  if (!EMAIL_RE.test(value)) {
    error.value = t("auth.emailInvalid");
    return;
  }
  email.value = value;

  pending.value = true;
  error.value = null;
  notice.value = null;
  try {
    const res = await requestOtp(value, locale.value as Locale);
    expiresInMinutes.value = res.expiresInMinutes;
    startCountdown(res.resendAfterSeconds);
    code.value = "";
    step.value = "code";
    focusStepInput();
  } catch (e) {
    if (e instanceof OtpRateLimitError) {
      startCountdown(e.retryAfterSeconds);
      if (e.retryAfterSeconds > ADDRESS_RESEND_SECONDS) {
        // Часовой лимит по IP: письма не было, ждать на шаге кода бессмысленно.
        error.value = t("auth.tooManyRequests", { time: resendLabel.value });
        return;
      }
      // Код на этот адрес уже уходил меньше минуты назад — он ещё жив.
      notice.value = t("auth.alreadySent");
      step.value = "code";
      focusStepInput();
      return;
    }
    error.value = t("auth.sendFailed");
    console.error(e);
  } finally {
    pending.value = false;
  }
}

async function submitCode(): Promise<void> {
  if (pending.value || code.value.length !== CODE_LENGTH) return;

  pending.value = true;
  error.value = null;
  notice.value = null;
  try {
    await verifyOtp(email.value, code.value, locale.value as Locale);
    emit("success");
  } catch (e) {
    if (e instanceof InvalidOtpError) {
      error.value = t("auth.codeInvalid");
      code.value = "";
      focusStepInput();
      return;
    }
    error.value = t("auth.verifyFailed");
    console.error(e);
  } finally {
    pending.value = false;
  }
}

// Из письма код копируют целиком — как только набраны 6 цифр, отправляем сами.
watch(code, (value) => {
  const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
  if (digits !== value) {
    code.value = digits;
    return;
  }
  if (digits.length === CODE_LENGTH) void submitCode();
});

function backToEmail(): void {
  step.value = "email";
  error.value = null;
  notice.value = null;
  focusStepInput();
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape") emit("close");
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
  focusStepInput();
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
  stopCountdown();
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center">
    <div
      class="absolute inset-0 bg-black/40"
      @click="emit('close')"
    />

    <div
      class="sheet relative w-full max-w-md rounded-t-[28px] border-t border-border bg-surface px-6 pt-6 pb-8 shadow-[0_-8px_24px_-12px_rgba(60,40,30,0.35)]"
      role="dialog"
      aria-modal="true"
      :aria-label="
        step === 'email' ? $t('auth.dialogEmail') : $t('auth.dialogCode')
      "
    >
      <button
        type="button"
        class="absolute top-5 right-5 text-xl leading-none text-text-muted"
        :aria-label="$t('common.close')"
        @click="emit('close')"
      >
        ✕
      </button>

      <template v-if="step === 'email'">
        <h2 class="font-display text-3xl text-text">
          {{ $t("auth.emailTitle") }}
        </h2>
        <p class="mt-2 text-sm text-text-muted">
          {{ $t("auth.emailSubtitle") }}
        </p>

        <form class="mt-5 flex flex-col gap-3" @submit.prevent="sendCode">
          <AppInput
            ref="emailInput"
            v-model="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="you@example.com"
            :aria-label="$t('auth.emailLabel')"
          />
          <AppButton
            type="submit"
            :class="{ 'pointer-events-none opacity-50': pending }"
          >
            {{ pending ? $t("auth.sending") : $t("auth.sendCode") }}
          </AppButton>
        </form>

        <p class="mt-3 text-center text-xs text-text-muted">
          {{ $t("auth.consentBefore") }}
          <NuxtLink :to="localePath('/privacy')" class="underline">
            {{ $t("auth.consentLink") }}
          </NuxtLink>
        </p>
      </template>

      <template v-else>
        <h2 class="font-display text-3xl text-text">
          {{ $t("auth.codeTitle") }}
        </h2>
        <p class="mt-2 text-sm text-text-muted">
          {{
            $t("auth.codeSubtitle", {
              length: CODE_LENGTH,
              email,
              minutes: expiresInMinutes,
            })
          }}
        </p>

        <form class="mt-5 flex flex-col gap-3" @submit.prevent="submitCode">
          <AppInput
            ref="codeInput"
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            :maxlength="CODE_LENGTH"
            placeholder="000000"
            :aria-label="$t('auth.codeLabel')"
            class="text-center text-2xl font-bold tracking-[0.4em]"
          />
          <AppButton
            type="submit"
            :class="{
              'pointer-events-none opacity-50':
                pending || code.length !== CODE_LENGTH,
            }"
          >
            {{ pending ? $t("auth.checking") : $t("auth.submitCode") }}
          </AppButton>
        </form>

        <div class="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            class="font-semibold text-text-muted"
            @click="backToEmail"
          >
            {{ $t("auth.otherEmail") }}
          </button>
          <span v-if="resendIn > 0" class="text-text-muted">
            {{ $t("auth.resendIn", { time: resendLabel }) }}
          </span>
          <button
            v-else
            type="button"
            class="font-semibold text-accent"
            :class="{ 'pointer-events-none opacity-50': pending }"
            @click="sendCode"
          >
            {{ $t("auth.resend") }}
          </button>
        </div>
      </template>

      <p v-if="error" class="mt-4 text-center text-sm text-red-600">
        {{ error }}
      </p>
      <p v-else-if="notice" class="mt-4 text-center text-sm text-text-muted">
        {{ notice }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.sheet {
  animation: sheet-up 0.22s ease-out;
}

@keyframes sheet-up {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheet {
    animation: none;
  }
}
</style>
