export default defineNuxtPlugin(() => {
  const { apply } = useTheme();

  const stored = localStorage.getItem("hairo-theme") as
    | "light"
    | "dark"
    | null;
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  apply(stored ?? (prefersDark ? "dark" : "light"));
});
