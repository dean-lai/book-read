"use client";

import { Search } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import { setBookFavoriteAction } from "@/actions/book-favorites";
import { BookCover } from "@/components/book-cover";
import { Input } from "@/components/ui/input";
import type { BookRowWithCategory } from "@/server/books/repositories/books-repository";

import { BookFavoriteHeartButton } from "./book-favorite-heart-button";
import { FavoriteLoginDialog } from "./favorite-login-dialog";
import { resolveBookCoverSrc } from "../lib/book-cover-src";

const DEBOUNCE_MS = 300;

type HomeBooksSearchContextValue = {
  inputValue: string;
  setInputValue: (value: string) => void;
  displayedBooks: BookRowWithCategory[];
  activeQuery: string;
  searchError: boolean;
  /** True while debouncing, fetching, or waiting for first API result for the active query. */
  searchPending: boolean;
  favoritesEnabled: boolean;
  isLoggedIn: boolean;
  favoriteBookIds: ReadonlySet<string>;
  toggleFavorite: (bookId: string) => void;
  openFavoriteLoginDialog: () => void;
};

const HomeBooksSearchContext =
  createContext<HomeBooksSearchContextValue | null>(null);

function useHomeBooksSearch(): HomeBooksSearchContextValue {
  const ctx = useContext(HomeBooksSearchContext);
  if (!ctx) {
    throw new Error(
      "useHomeBooksSearch must be used within HomeBooksSearchProvider",
    );
  }
  return ctx;
}

function parseBooksJson(rows: unknown[]): BookRowWithCategory[] {
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      title: String(r.title),
      author: String(r.author),
      coverUrl: r.coverUrl == null ? null : String(r.coverUrl),
      createdAt: new Date(String(r.createdAt)),
      categoryName: r.categoryName == null ? null : String(r.categoryName),
    };
  });
}

type ProviderProps = {
  initialBooks: BookRowWithCategory[];
  initialFavoriteBookIds?: string[];
  favoritesEnabled?: boolean;
  isLoggedIn?: boolean;
  children: ReactNode;
};

export function HomeBooksSearchProvider({
  initialBooks,
  initialFavoriteBookIds = [],
  favoritesEnabled = false,
  isLoggedIn = false,
  children,
}: ProviderProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [inputValue]);

  const [remoteBooks, setRemoteBooks] = useState<BookRowWithCategory[] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const fetchGeneration = useRef(0);

  const [favoriteBookIds, setFavoriteBookIds] = useState(
    () => new Set(initialFavoriteBookIds),
  );
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const toggleFavorite = useCallback(async (bookId: string) => {
    if (!favoritesEnabled) {
      return;
    }
    let shouldAdd = false;
    setFavoriteBookIds((prev) => {
      shouldAdd = !prev.has(bookId);
      const next = new Set(prev);
      if (shouldAdd) {
        next.add(bookId);
      } else {
        next.delete(bookId);
      }
      return next;
    });
    try {
      const result = await setBookFavoriteAction(bookId, shouldAdd);
      if (!result.ok) {
        throw new Error(result.code);
      }
    } catch {
      setFavoriteBookIds((prev) => {
        const next = new Set(prev);
        if (shouldAdd) {
          next.delete(bookId);
        } else {
          next.add(bookId);
        }
        return next;
      });
    }
  }, [favoritesEnabled]);

  const openFavoriteLoginDialog = useCallback(() => {
    setLoginDialogOpen(true);
  }, []);

  const activeQuery = debouncedQuery.trim();
  const inputPending = inputValue.trim() !== activeQuery;

  useEffect(() => {
    if (!activeQuery) {
      setRemoteBooks(null);
      setSearchError(false);
      setIsSearching(false);
      return;
    }

    const gen = ++fetchGeneration.current;
    setRemoteBooks(null);
    setSearchError(false);
    setIsSearching(true);

    const ac = new AbortController();

    void (async () => {
      try {
        const res = await fetch(
          `/api/books?q=${encodeURIComponent(activeQuery)}`,
          { cache: "no-store", signal: ac.signal },
        );
        if (fetchGeneration.current !== gen) {
          return;
        }
        if (!res.ok) {
          setSearchError(true);
          setRemoteBooks([]);
          return;
        }
        const data = (await res.json()) as { books?: unknown[] };
        const rows = Array.isArray(data.books) ? data.books : [];
        if (fetchGeneration.current !== gen) {
          return;
        }
        setRemoteBooks(parseBooksJson(rows));
        setSearchError(false);
      } catch (e) {
        if (
          (e instanceof DOMException && e.name === "AbortError") ||
          ac.signal.aborted ||
          fetchGeneration.current !== gen
        ) {
          return;
        }
        setSearchError(true);
        setRemoteBooks([]);
      } finally {
        if (fetchGeneration.current === gen) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      ac.abort();
    };
  }, [activeQuery]);

  const displayedBooks = useMemo(() => {
    if (!activeQuery) {
      return initialBooks;
    }
    return remoteBooks ?? [];
  }, [activeQuery, initialBooks, remoteBooks]);

  const searchPending =
    Boolean(activeQuery) && (inputPending || isSearching || remoteBooks === null);

  const value = useMemo<HomeBooksSearchContextValue>(
    () => ({
      inputValue,
      setInputValue,
      displayedBooks,
      activeQuery,
      searchError,
      searchPending,
      favoritesEnabled,
      isLoggedIn,
      favoriteBookIds,
      toggleFavorite,
      openFavoriteLoginDialog,
    }),
    [
      activeQuery,
      displayedBooks,
      favoriteBookIds,
      favoritesEnabled,
      inputValue,
      isLoggedIn,
      openFavoriteLoginDialog,
      searchError,
      searchPending,
      toggleFavorite,
    ],
  );

  return (
    <HomeBooksSearchContext.Provider value={value}>
      {children}
      <FavoriteLoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </HomeBooksSearchContext.Provider>
  );
}

export function HomeSearchBar() {
  const t = useTranslations("home");
  const { inputValue, setInputValue, searchPending } = useHomeBooksSearch();

  return (
    <div
      role="search"
      className="flex min-w-0 flex-1 max-w-md items-center gap-sm"
    >
      <Search className="size-5 shrink-0 text-brand-muted" aria-hidden />
      <Input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        maxLength={200}
        enterKeyHint="search"
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        aria-busy={searchPending}
        className="h-input-default min-w-0 flex-1 border-hairline-strong bg-canvas-soft font-sans text-body-md placeholder:text-brand-muted"
      />
    </div>
  );
}

export function HomeBooksMainSection() {
  const t = useTranslations("home");
  const {
    displayedBooks,
    activeQuery,
    searchPending,
    searchError,
    favoritesEnabled,
    isLoggedIn,
    favoriteBookIds,
    toggleFavorite,
    openFavoriteLoginDialog,
  } = useHomeBooksSearch();

  const showNoResultsCopy =
    activeQuery.length > 0 &&
    !searchPending &&
    !searchError &&
    displayedBooks.length === 0;

  const showEmptyLibrary =
    !activeQuery && displayedBooks.length === 0 && !searchError;

  const showGrid =
    !searchError &&
    !showEmptyLibrary &&
    !showNoResultsCopy &&
    displayedBooks.length > 0;

  return (
    <section
      id="newest"
      className="mx-auto w-full max-w-content px-base pb-xl pt-md md:px-lg xl:px-xl"
      aria-labelledby="newest-heading"
    >
      <div className="mb-md flex flex-wrap items-baseline gap-x-xs gap-y-xxs">
        <h2
          id="newest-heading"
          className="font-sans text-display-sm font-bold uppercase tracking-tight text-ink/80"
        >
          {t("newestTitle")}
        </h2>
        <span className="text-title-sm font-medium text-body-color">
          {t("seeMoreDecorative")}
        </span>
      </div>

      {searchError ? (
        <p className="text-body-md text-brand-muted">{t("searchError")}</p>
      ) : null}

      {!searchError && searchPending && activeQuery ? (
        <p className="mb-sm text-body-sm text-brand-muted" aria-live="polite">
          {t("searchingBooks")}
        </p>
      ) : null}

      {showEmptyLibrary ? (
        <p className="text-body-md text-brand-muted">{t("emptyLibrary")}</p>
      ) : null}

      {showNoResultsCopy ? (
        <p className="text-body-md text-brand-muted">
          {t("noSearchResults", { query: activeQuery })}
        </p>
      ) : null}

      {showGrid ? (
        <ul className="grid list-none grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-x-6">
          {displayedBooks.map((book) => (
            <li key={book.id} className="min-w-0">
              <BookCover
                coverSrc={resolveBookCoverSrc(book.coverUrl)}
                bookName={book.title}
                authorName={book.author}
                coverAlt={t("coverAlt", { title: book.title })}
                coverAdornment={
                  favoritesEnabled ? (
                    <BookFavoriteHeartButton
                      bookId={book.id}
                      isFavorite={favoriteBookIds.has(book.id)}
                      isLoggedIn={isLoggedIn}
                      onToggle={toggleFavorite}
                      onRequireLogin={openFavoriteLoginDialog}
                    />
                  ) : null
                }
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
