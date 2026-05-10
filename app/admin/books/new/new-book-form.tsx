"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { generateSummaryAction, saveBookAction } from "@/actions/admin-books";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const saveFieldsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  summaryContent: z.string().min(1, "Summary is required"),
  categoryId: z.string().optional(),
});

type SaveFields = z.infer<typeof saveFieldsSchema>;

type CategoryOption = { id: string; name: string };

export function NewBookForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [rawText, setRawText] = useState("");
  const [titleHint, setTitleHint] = useState("");
  const [authorHint, setAuthorHint] = useState("");
  const [genMessage, setGenMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isGenerating, startGenerate] = useTransition();
  const [isSaving, startSave] = useTransition();

  const form = useForm<SaveFields>({
    resolver: zodResolver(saveFieldsSchema),
    defaultValues: {
      title: "",
      author: "",
      summaryContent: "",
      categoryId: "__none__",
    },
  });

  function handleGenerate() {
    setGenMessage(null);
    startGenerate(async () => {
      const result = await generateSummaryAction({
        rawText,
        titleHint: titleHint.trim() || undefined,
        authorHint: authorHint.trim() || undefined,
      });
      if (!result.ok) {
        setGenMessage(result.message);
        return;
      }
      form.setValue("summaryContent", result.summary);
      setGenMessage("Summary generated — review and edit below, then add title and author.");
    });
  }

  function onSubmit(values: SaveFields) {
    setSaveError(null);
    const payload = {
      title: values.title.trim(),
      author: values.author.trim(),
      summaryContent: values.summaryContent.trim(),
      categoryId:
        values.categoryId === "__none__" || !values.categoryId?.trim()
          ? undefined
          : values.categoryId,
    };

    startSave(async () => {
      const result = await saveBookAction(payload);
      if (
        result &&
        typeof result === "object" &&
        "ok" in result &&
        result.ok === false
      ) {
        setSaveError(result.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Smart ingestion</CardTitle>
          <CardDescription>
            Paste raw notes or excerpts. Optional hints help when the text does
            not name the book clearly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title-hint">
                Title hint (optional)
              </label>
              <Input
                id="title-hint"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                placeholder="e.g. Working Backwards"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="author-hint">
                Author hint (optional)
              </label>
              <Input
                id="author-hint"
                value={authorHint}
                onChange={(e) => setAuthorHint(e.target.value)}
                placeholder="e.g. Colin Bryar"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="raw-text">
              Raw content
            </label>
            <Textarea
              id="raw-text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste chapters, notes, or highlights…"
              className="min-h-40 font-mono text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isGenerating || !rawText.trim()}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Generating…
                </>
              ) : (
                "Generate summary"
              )}
            </Button>
            {genMessage && (
              <p
                className={
                  genMessage.startsWith("Summary generated")
                    ? "text-muted-foreground text-sm"
                    : "text-destructive text-sm"
                }
              >
                {genMessage}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review and publish</CardTitle>
          <CardDescription>
            Fill in metadata and polish the Markdown before saving to the
            catalog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full max-w-md">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summaryContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# Summary\n\n## Key Takeaways\n\n…"
                        className="min-h-64 font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {saveError && (
                <p className="text-destructive text-sm">{saveError}</p>
              )}

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save book"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
