export type Theme = "light" | "dark";

export function useTheme() {
  const theme = useState<Theme>("theme", () => "light");

  function apply(value: Theme) {
    theme.value = value;
    if (import.meta.client) {
      document.documentElement.classList.toggle("dark", value === "dark");
      localStorage.setItem("hairo-theme", value);
    }
  }

  function toggle() {
    apply(theme.value === "dark" ? "light" : "dark");
  }

  return { theme, apply, toggle };
}
