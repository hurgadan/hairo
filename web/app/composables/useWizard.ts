import { Occasion } from "@hurgadan/hairo-contracts";

export interface WizardState {
  gender: "feminine" | "masculine" | "all";
  length: "shorter" | "same" | "longer" | "any";
  boldness: "light" | "noticeable" | "radical";
  occasions: Occasion[];
  maintenance: "low" | "medium" | "high";
  changeColor: boolean;
  selected: string | null; // id выбранного образа (Hairstyle.id)
}

export function useWizard() {
  return useState<WizardState>("wizard", () => ({
    gender: "all",
    length: "any",
    boldness: "noticeable",
    occasions: [],
    maintenance: "medium",
    changeColor: false,
    selected: null,
  }));
}
