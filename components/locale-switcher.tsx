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
import { Languages } from "lucide-react";

import { cn } from "@/lib/utils";

type LocaleSwitcherProps = {
  /** Merges into the trigger `Button` (e.g. home header pill styles). */
  triggerClassName?: string;
  /** When set, overrides the default `localeSwitcher.label` for the trigger text. */
  buttonLabel?: string;
};

export function LocaleSwitcher({
  triggerClassName,
  buttonLabel,
}: LocaleSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", triggerClassName)}
        >
          <Languages
            className={cn(
              "size-4 shrink-0",
              buttonLabel ? "text-on-primary" : "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              buttonLabel
                ? "inline font-bold text-on-primary"
                : "text-muted-foreground hidden sm:inline",
            )}
          >
            {buttonLabel ?? t("label")}
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
