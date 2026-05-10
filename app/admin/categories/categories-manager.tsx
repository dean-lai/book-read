"use client";

import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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

export type CategoryRow = { id: string; name: string };

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
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
      setMessage("Enter a name.");
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
      setMessage("Name cannot be empty.");
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
    if (
      !window.confirm(
        `Delete category “${label}”? Books using it will have no category.`,
      )
    ) {
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
        <h2 className="text-xl font-semibold tracking-tight">Categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Used to organize books in the catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
          <CardDescription>
            Slug is generated from the name and kept unique automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
            <Input
              name="name"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={pending}
              className="max-w-md flex-1 min-w-[12rem]"
            />
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {message ? (
        <p className="text-destructive text-sm" role="alert">
          {message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
          <CardDescription>
            Edit the display name or remove a category you no longer need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No categories yet. Add one above.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[200px] text-right">Actions</TableHead>
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
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                            disabled={pending}
                          >
                            Cancel
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
                            aria-label={`Edit ${row.name}`}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(row.id, row.name)}
                            disabled={pending}
                            aria-label={`Delete ${row.name}`}
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
