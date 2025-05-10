import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Hook to manage translations
export function useNavigationTranslations() {
  const navT = useTranslations("navigation");
  const ctaT = useTranslations("cta");
  const accessibilityT = useTranslations("accessibility");
  return { navT, ctaT, accessibilityT };
}