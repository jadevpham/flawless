import { intro_en } from "./en/intro";
import { roles_en } from "./en/roles";
import { rules_en } from "./en/rules";

import { intro_vi } from "./vi/intro";
import { roles_vi } from "./vi/roles";
import { rules_vi } from "./vi/rules";

export const buildSystemPrompt = (lang: "en" | "vi"): string => {
  if (lang === "vi") {
    return `${intro_vi}\n\n${roles_vi}\n\n${rules_vi}`;
  }
  return `${intro_en}\n\n${roles_en}\n\n${rules_en}`;
};
