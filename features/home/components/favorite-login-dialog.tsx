"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";

type FavoriteLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FavoriteLoginDialog({
  open,
  onOpenChange,
}: FavoriteLoginDialogProps) {
  const t = useTranslations("favorites");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-sans">
        <DialogHeader>
          <DialogTitle>{t("loginDialogTitle")}</DialogTitle>
          <DialogDescription>{t("loginDialogDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-xs sm:gap-sm">
          <Button variant="outline" asChild className="rounded-pill font-sans">
            <Link href="/auth/login">{t("signIn")}</Link>
          </Button>
          <Button asChild className="rounded-pill font-sans">
            <Link href="/auth/sign-up">{t("signUp")}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
