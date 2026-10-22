import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "mr", "hi"],
  defaultLocale: "en",
  localePrefix: "always",
});
