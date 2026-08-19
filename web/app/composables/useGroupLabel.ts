/**
 * Подпись группы каталога по её коду (`HairstyleGroup`).
 *
 * Неизвестный код показываем как есть: база, которую ещё не пересидировали
 * после перехода на enum, отдаёт старые русские строки — пусть лучше будет
 * старая подпись, чем пустое место.
 */
export function useGroupLabel() {
  const { t, te } = useI18n();

  return (group: string): string => {
    const key = `catalog.groups.${group}`;
    return te(key) ? t(key) : group;
  };
}
