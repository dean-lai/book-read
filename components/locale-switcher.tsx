"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  /** Merges into the trigger `Button` (e.g. height to align with adjacent nav controls). */
  triggerClassName?: string;
};

export function LocaleSwitcher({ triggerClassName }: LocaleSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");
  const localeCode = locale.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("text-ink", triggerClassName)}
          aria-label={t("label")}
        >
          <span className="font-sans text-body-sm font-medium tabular-nums">
            {localeCode}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(next) => {
            if (next !== locale) {
              router.replace(pathname, { locale: next });
            }
          }}
        >
          {routing.locales.map((loc) => (
            <DropdownMenuRadioItem key={loc} value={loc}>
              {t(loc as "en" | "vi")}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
