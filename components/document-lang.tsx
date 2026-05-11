"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Root layout stays static; this keeps `<html lang>` aligned with the `[locale]` segment. */
export function DocumentLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
