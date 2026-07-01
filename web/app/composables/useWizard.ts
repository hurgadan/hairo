export interface WizardState {
  gender: "feminine" | "masculine" | "all";
  length: "shorter" | "same" | "longer" | "any";
  boldness: "light" | "noticeable" | "radical";
  occasions: string[];
  maintenance: "low" | "medium" | "high";
  changeColor: boolean;
  selected: string[]; // slugs выбранных образов
}

export function useWizard() {
  return useState<WizardState>("wizard", () => ({
    gender: "all",
    length: "any",
    boldness: "noticeable",
    occasions: [],
    maintenance: "medium",
    changeColor: false,
    selected: [],
  }));
}
