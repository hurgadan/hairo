export default defineI18nConfig(() => ({
  legacy: false,
  pluralRules: {
    /**
     * Русский — три формы («1 примерка», «2 примерки», «5 примерок»).
     * Правило vue-i18n по умолчанию знает только две, поэтому задаём своё;
     * немецкому и испанскому хватает стандартного.
     */
    ru(choice: number): number {
      const n = Math.abs(choice) % 100;
      const lastDigit = n % 10;

      if (n > 10 && n < 20) return 2;
      if (lastDigit === 1) return 0;
      if (lastDigit > 1 && lastDigit < 5) return 1;
      return 2;
    },
  },
}));
