"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  extractBookTextAction,
  generateSummaryAction,
  saveBookWithFileAction,
} from "@/actions/admin-books";
import { MAX_BOOK_UPLOAD_WORDS } from "@/lib/book-upload-limits";
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

type SaveFields = {
  title: string;
  author: string;
  summaryContent: string;
  categoryId?: string;
};

type CategoryOption = { id: string; name: string };

export function NewBookForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const t = useTranslations("newBookForm");
  const tCommon = useTranslations("common");
  const saveFieldsSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, t("validationTitle")),
        author: z.string().min(1, t("validationAuthor")),
        summaryContent: z.string().min(1, t("validationSummary")),
        categoryId: z.string().optional(),
      }),
    [t],
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titleHint, setTitleHint] = useState("");
  const [authorHint, setAuthorHint] = useState("");
  const [genFeedback, setGenFeedback] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);
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
    if (!selectedFile) {
      setGenFeedback({ kind: "error", text: t("uploadFileFirst") });
      return;
    }
    setGenFeedback(null);
    startGenerate(async () => {
      const data = new FormData();
      data.append("file", selectedFile);
      const extracted = await extractBookTextAction(data);
      if (!extracted.ok) {
        setGenFeedback({ kind: "error", text: extracted.message });
        return;
      }
      const result = await generateSummaryAction({
        rawText: extracted.text,
        titleHint: titleHint.trim() || undefined,
        authorHint: authorHint.trim() || undefined,
      });
      if (!result.ok) {
        setGenFeedback({ kind: "error", text: result.message });
        return;
      }
      form.setValue("summaryContent", result.summary);
      setGenFeedback({ kind: "success", text: t("summaryGenerated") });
    });
  }

  function onSubmit(values: SaveFields) {
    setSaveError(null);
    if (!selectedFile) {
      setSaveError(t("ebookRequired"));
      return;
    }
    startSave(async () => {
      const data = new FormData();
      data.append("title", values.title.trim());
      data.append("author", values.author.trim());
      data.append("summaryContent", values.summaryContent.trim());
      data.append(
        "categoryId",
        values.categoryId === "__none__" || !values.categoryId?.trim()
          ? ""
          : values.categoryId,
      );
      data.append("file", selectedFile);
      const result = await saveBookWithFileAction(data);
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
          <CardTitle>{t("smartIngestion")}</CardTitle>
          <CardDescription>
            {t("smartIngestionDescription", {
              maxWords: MAX_BOOK_UPLOAD_WORDS.toLocaleString(),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-sm rounded-md border border-hairline p-sm">
            <label
              className="font-sans text-body-sm font-medium text-ink"
              htmlFor="book-file"
            >
              {t("ebookFile")}
            </label>
            <Input
              id="book-file"
              type="file"
              accept=".epub,.pdf,.txt,.md,.markdown"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setGenFeedback(null);
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-xs">
              <label
                className="font-sans text-body-sm font-medium text-ink"
                htmlFor="title-hint"
              >
                {t("titleHint")}
              </label>
              <Input
                id="title-hint"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                placeholder={t("titleHintPlaceholder")}
              />
            </div>
            <div className="space-y-xs">
              <label
                className="font-sans text-body-sm font-medium text-ink"
                htmlFor="author-hint"
              >
                {t("authorHint")}
              </label>
              <Input
                id="author-hint"
                value={authorHint}
                onChange={(e) => setAuthorHint(e.target.value)}
                placeholder={t("authorHintPlaceholder")}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={isGenerating || !selectedFile}
              onClick={handleGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {t("generating")}
                </>
              ) : (
                t("generateSummary")
              )}
            </Button>
            {genFeedback && (
              <p
                className={
                  genFeedback.kind === "success"
                    ? "text-body-sm text-brand-muted"
                    : "text-body-sm text-semantic-error"
                }
              >
                {genFeedback.text}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("reviewPublish")}</CardTitle>
          <CardDescription>{t("reviewPublishDescription")}</CardDescription>
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
                      <FormLabel>{t("fieldTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("fieldTitlePlaceholder")}
                          {...field}
                        />
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
                      <FormLabel>{t("fieldAuthor")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("fieldAuthorPlaceholder")}
                          {...field}
                        />
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
                    <FormLabel>{t("fieldCategory")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full max-w-md">
                          <SelectValue placeholder={tCommon("optional")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">
                          {tCommon("none")}
                        </SelectItem>
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
                    <FormLabel>{t("fieldSummary")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("fieldSummaryPlaceholder")}
                        className="min-h-64 font-mono text-body-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {saveError && (
                <p className="text-body-sm text-semantic-error">{saveError}</p>
              )}

              <Button type="submit" disabled={isSaving || !selectedFile}>
                {isSaving ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    {t("saving")}
                  </>
                ) : (
                  t("saveBook")
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
