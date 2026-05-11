"use client";

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/admin-categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "@/i18n/navigation";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

export type CategoryRow = { id: string; name: string };

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [pending, startTransition] = useTransition();

  function clearFeedback() {
    setMessage(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    clearFeedback();
    const name = newName.trim();
    if (!name) {
      setMessage(t("categoriesEnterName"));
      return;
    }
    startTransition(async () => {
      const result = await createCategoryAction({ name });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setNewName("");
      router.refresh();
    });
  }

  function startEdit(row: CategoryRow) {
    clearFeedback();
    setEditingId(row.id);
    setEditName(row.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    clearFeedback();
    const name = editName.trim();
    if (!name) {
      setMessage(t("categoriesNameEmpty"));
      return;
    }
    startTransition(async () => {
      const result = await updateCategoryAction({ id: editingId, name });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      cancelEdit();
      router.refresh();
    });
  }

  function handleDelete(id: string, label: string) {
    clearFeedback();
    if (!window.confirm(t("categoriesDeleteConfirm", { label }))) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategoryAction({ id });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      if (editingId === id) cancelEdit();
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-sans text-title-md font-semibold tracking-tight text-ink">
          {t("categoriesHeading")}
        </h2>
        <p className="mt-xs text-body-sm text-brand-muted">
          {t("categoriesSubtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("categoriesAddTitle")}</CardTitle>
          <CardDescription>{t("categoriesAddDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
            <Input
              name="name"
              placeholder={t("categoriesNamePlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={pending}
              className="max-w-md flex-1 min-w-[12rem]"
            />
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                t("categoriesAddButton")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {message ? (
        <p className="text-body-sm text-semantic-error" role="alert">
          {message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("categoriesAllTitle")}</CardTitle>
          <CardDescription>{t("categoriesAllDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {initialCategories.length === 0 ? (
            <p className="text-body-sm text-brand-muted">
              {t("categoriesEmpty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("categoriesTableName")}</TableHead>
                  <TableHead className="w-[200px] text-right">
                    {t("categoriesTableActions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialCategories.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {editingId === row.id ? (
                        <form
                          className="flex flex-wrap items-center gap-2"
                          onSubmit={handleUpdate}
                        >
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={pending}
                            className="max-w-sm"
                            autoFocus
                          />
                          <Button type="submit" size="sm" disabled={pending}>
                            {t("categoriesSave")}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={pending}
                          >
                            {t("categoriesCancel")}
                          </Button>
                        </form>
                      ) : (
                        row.name
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === row.id ? null : (
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(row)}
                            disabled={pending}
                            aria-label={t("categoriesEditAria", {
                              name: row.name,
                            })}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-semantic-error hover:text-semantic-error"
                            onClick={() => handleDelete(row.id, row.name)}
                            disabled={pending}
                            aria-label={t("categoriesDeleteAria", {
                              name: row.name,
                            })}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
