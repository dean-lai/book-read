# Book Read

An editorial-style reading web app: browse nonfiction-style titles, read structured summaries, track reading progress, and ask questions in a **book-scoped AI chat** that is grounded in the same source you ingested—not generic web answers.

Stack in short: **Next.js** (App Router, `next-intl` for `en` / `vi`), **Supabase** (Auth + optional Storage), **Postgres** via **Drizzle ORM**, and **Google Gemini** for summarization, embeddings, and chat completions.

---

## About the app

Readers sign in with Supabase Auth. The home and book catalog surfaces are built for a calm, typographic reading experience. Each **book** has metadata (title, author, category, optional cover URL) and a long-form **description** field that holds the editorial summary shown on the book detail page.

Admins maintain the catalog through a **built-in admin CMS** (not a third-party headless CMS): create books, assign categories, upload source files for AI processing, and manage taxonomy.

---

## Summaries and the RAG chat system

### How summaries work

Summaries are produced in the admin flow, not on every page load:

1. An admin uploads a supported ebook (**EPUB** or **PDF**). The server extracts text (see `server/books/services/ebook-text-extractor-service.ts`).
2. Extracted text is capped for safety and cost (**5,000 words** max — `MAX_BOOK_UPLOAD_WORDS` in `lib/book-upload-limits.ts`).
3. **Gemini** runs once per generation with a fixed editor-style system prompt (`server/ai/services/ai-service.ts`): output must be Markdown with sections `# Summary`, `## Key Takeaways`, and `## Detailed Analysis`.
4. The Markdown is stored in Postgres as the book’s **`description`** when the book is saved (`server/books/services/admin-books-service.ts`). That becomes the primary “read the book in minutes” content in the product.

This keeps recurring reader traffic cheap: the model is not re-summarizing on every visit—only when an operator regenerates or edits content in the CMS.

### How RAG works for the chat box

The in-app chat on each book page (`features/books/components/book-chat.tsx` → `app/api/books/[id]/chat/route.ts`) is a **retrieval-augmented** pipeline:

1. **Ingestion (admin or CLI)** splits the full extracted book text into chunks, embeds each chunk with Gemini (`server/ai/services/embeddings-service.ts`), and stores vectors in **`book_chunks`** with **pgvector** (cosine HNSW index in `db/schema.ts`). Implementation: `ingestBookRag` in `server/books/services/rag-service.ts`.
2. **Each user message** is embedded the same way, then the DB returns the closest chunks (`searchBookChunksByVector`). Only matches above a **similarity threshold** (`MIN_CONFIDENCE` in `rag-service.ts`) are kept as evidence.
3. **Gemini** receives a short prompt: answer **only** from those excerpts; if the evidence is weak, the user gets an honest “cannot find it in this book” style reply instead of hallucination.
4. **Chat history** is persisted in **`chat_history`** per user, book, and thread so conversations can resume.

So the chat behaves like “ask this book,” not “ask the internet,” because the model’s context window is filled with retrieved passages from that title’s index.

---

## Why this setup (including cost control)

We optimized for **predictable bills** and a small operational footprint:

- **One AI vendor for both summarization and RAG** (Gemini for generation + embeddings) simplifies billing, quotas, and key rotation compared to mixing providers.
- **RAG instead of “send the whole book every question”** dramatically cuts input tokens per chat turn: only a handful of retrieved chunks go to the model, not tens of thousands of words.
- **One-off summary generation** stores the result in Postgres, so readers do not re-trigger an expensive long-context call on each page view.
- **Supabase bundles Auth, Postgres, and Storage** behind one project, which avoids paying for a separate auth SaaS, a separate vector-only database, and a separate CMS—especially attractive at small scale and for prototypes.
- **Vectors live in Postgres (pgvector)** instead of a dedicated vector SaaS (e.g. Pinecone), which removes another subscription line item and keeps data in one place—at the cost of sizing Postgres appropriately as the library grows.
- **Product-level guardrails**: extracted uploads are word-capped; chat applies a **daily per-user, per-book message limit** (`CHAT_DAILY_USER_MESSAGE_LIMIT` in `server/books/repositories/chat-repository.ts`); identical questions can be **served from cache** (`findCachedAssistantReply`) to avoid duplicate model calls.

Together, these choices favor **lower marginal cost per active reader** and fewer moving parts, at the expense of your team operating the admin CMS and monitoring Gemini usage directly.

---

## Content management (CMS)

There is no separate Sanity/Contentful install: **the admin area is the CMS**.

### Access and permissions

- **URL**: `/admin` for the default locale (`en`); Vietnamese uses `/vi/admin` (see `i18n/routing.ts` and `localePrefix: "as-needed"`).
- **Who can enter**: Only users whose Supabase JWT includes **`app_metadata.role === "admin"`** (`lib/admin/require-admin.ts`). Everyone else is redirected home.

**Granting admin in Supabase**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication → Users**.
2. Pick a user → edit **User Metadata** / **App Metadata** (depending on UI version) and set JSON similar to:

   ```json
   { "role": "admin" }
   ```

   under **`app_metadata`** (not `user_metadata` alone—the code checks `app_metadata.role`).

Alternatively use the Auth Admin API in a secure script; the important part is that **`role: "admin"`** ends up on **`app_metadata`**.

### What you can manage

| Area | Path | Purpose |
|------|------|---------|
| Dashboard | `/admin` | Overview entry point. |
| Books | `/admin/books` | List titles; link to create/edit flows. |
| New book | `/admin/books/new` | Upload file, generate summary, set title/author/category/cover URL, save. |
| Categories | `/admin/categories` | Taxonomy used when tagging books (`pnpm seed:categories` seeds starter rows). |

### Typical book onboarding workflow

1. Run **`pnpm seed:categories`** once on a fresh database so category pickers are populated (safe to re-run).
2. In **Admin → Books → Add book**, upload the ebook.
3. Optional: set **title/author hints** if the file metadata is messy, then **Generate summary**. Review and edit the Markdown in the form if needed.
4. **Save** with the same uploaded file: the app **creates the `books` row** and runs **RAG ingestion** in one path (`createBookAndIngestFromAdmin`) so chunks exist for chat. If ingestion fails, the book may still be saved—check the error message and fix env or content limits.
5. **Cover URL**: use a public HTTPS URL, or a **public** Supabase Storage object URL; `next.config.ts` whitelists your project’s storage host for `next/image`.

### Re-indexing RAG without the form

If a book exists but chunks are missing or stale, you can run the CLI (after `DATABASE_URL` and `GEMINI_API_KEY` are set):

```bash
BOOK_ID=<uuid> FILE_PATH=./path/to/book.epub pnpm ingest:book-rag
```

Requires a row in `books` with that `id`. See `scripts/ingest-book-rag.ts`.

---

## Installation and local development

### Prerequisites

- **Node.js** 20 or newer (matches `@types/node` in this repo)
- **pnpm** 10.x (see `packageManager` in `package.json`; install with `corepack enable` then `corepack prepare pnpm@10.11.0 --activate`, or use your pnpm installer)

### Quick start (any path)

1. Clone the repository and install dependencies:

   ```bash
   pnpm install
   ```

2. Create a local environment file from the template:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the variables in the table below (new Supabase vs existing is covered in Path A and Path B).

4. Apply the database schema and optional seed data (Path A §5, or Path B §2).

5. Start the dev server:

   ```bash
   pnpm dev
   ```

The app is usually available at [http://localhost:3000](http://localhost:3000). Locales are `en` (default, often without a URL prefix) and `vi`.

### Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes* | Supabase project URL (Auth, client SDK, image domains). |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes* | Supabase publishable (anon) key for the browser and server helpers. |
| `DATABASE_URL` | Yes (for DB features) | Postgres connection URI for Drizzle (`pg`). Used by server code and scripts. |
| `GEMINI_API_KEY` | Yes (for AI/RAG) | Google AI API key for chat and embeddings. |
| `GEMINI_MODEL` | No | Chat model override (default: `gemini-2.5-flash`). |
| `GEMINI_EMBEDDING_MODEL` | No | Embedding model override (default: `gemini-embedding-2`). |
| `DATABASE_POOL_MAX` | No | Max connections in the Node `pg` pool (default `5`, cap `20`). |
| `OPENAI_API_KEY` | No | Listed in `.env.example` for convenience; the current codebase uses Gemini for embeddings, not OpenAI. |

\*If these are missing, auth middleware skips Supabase session handling (`hasEnvVars` in `lib/utils.ts`), but most product flows expect them.

Scripts such as `pnpm seed:categories` and `pnpm ingest:book-rag` load `.env.local` and `.env` via `dotenv`.

### Path A — New Supabase project and empty database

Use this when you are setting up **everything from scratch** (new Supabase org/project and a database that does not yet have this app’s tables).

#### 1. Create a Supabase project

In the [Supabase dashboard](https://supabase.com/dashboard), create a project and wait until the database is ready.

#### 2. Enable Postgres extensions

The schema uses **pgvector** for embeddings and **pg_trgm** for text search indexes on book titles and authors.

In Supabase: **Database → Extensions**, enable:

- `vector`
- `pg_trgm`

Alternatively, run in the SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

#### 3. Configure `.env.local`

From **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` → Project URL  
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → anon / publishable key  

From **Project Settings → Database** (or the connection pooler docs):

- `DATABASE_URL` → **URI** connection string (often the *Session* or *Direct* string for migrations from your laptop).  
  If you see `(EMAXCONNSESSION) max clients reached` under load, lower `DATABASE_POOL_MAX` or switch to the **Transaction** pooler (port `6543`) for the app while keeping a direct string for one-off migrations if needed.

From Google AI Studio (or your Google Cloud AI setup):

- `GEMINI_API_KEY`

#### 4. Supabase Auth URLs

So email magic links and OTP flows land in this app, set URLs under **Authentication → URL configuration**:

- **Site URL**: e.g. `http://localhost:3000` for local dev.
- **Redirect URLs** (add patterns that match your deployment):

  - `http://localhost:3000/auth/confirm`
  - `http://localhost:3000/vi/auth/confirm`
  - Production equivalents with your real origin.

The confirm route lives at `app/[locale]/(auth)/auth/confirm/route.ts` and expects Supabase to redirect there with `token_hash` and `type` query parameters.

#### 5. Database migrations and seed

This repo’s Drizzle output directory is `db/migrations` (see `drizzle.config.ts`). If there are no migration files yet, generate them from the schema, then apply:

```bash
pnpm db:generate
pnpm db:migrate
```

Then seed default categories (idempotent):

```bash
pnpm seed:categories
```

#### 6. Storage (optional)

If you store book covers in a **public** Supabase Storage bucket, `next.config.ts` already allows images from `NEXT_PUBLIC_SUPABASE_URL` under `/storage/v1/object/public/**`. Create buckets and policies in Supabase as your product requires.

### Path B — Use your **existing** Supabase project

Use this when you already have a Supabase project (for example you are cloning the repo on a second machine, or onboarding a teammate) and want to point at **the same** database and Auth configuration.

#### 1. Copy environment values from your current setup

Take the same keys from your working `.env.local`, team vault, or Supabase dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `GEMINI_API_KEY` (and optional `GEMINI_*` overrides)

Paste them into a new `.env.local` in this clone. **Do not commit** `.env.local`; it should stay gitignored.

#### 2. Align the database with this codebase

Pick the case that matches your database:

| Situation | What to do |
|-----------|------------|
| This Supabase DB **already** has the tables from this app (migrations were applied before). | Run `pnpm install` and `pnpm dev`. Skip `db:migrate` unless you are upgrading after pulling new migrations. |
| The project exists but the DB is **empty** or from another app. | Enable `vector` and `pg_trgm` (same as Path A), then `pnpm db:generate` (if your branch has no migrations committed) and `pnpm db:migrate`, then `pnpm seed:categories` if you want the default categories. |
| You are **not sure** what is deployed. | Open Supabase **Table Editor** or run `\dt` in the SQL editor and confirm tables such as `books`, `book_chunks`, `categories`, etc. match `db/schema.ts`. If they are missing, run migrations after enabling extensions. |

#### 3. Auth redirect URLs

If this is a **new** local URL or staging domain, add it under **Authentication → URL configuration** redirect allowlist (same patterns as Path A). Existing production URLs can stay; add any new origins you use.

#### 4. Run the app

```bash
pnpm install
pnpm dev
```

### Optional scripts

| Command | When to use |
|---------|-------------|
| `pnpm seed:categories` | (Re)populate starter categories; skips existing slugs. |
| `BOOK_ID=<uuid> FILE_PATH=./path/to/book.epub pnpm ingest:book-rag` | Chunk and embed one book for RAG; requires `DATABASE_URL`, `GEMINI_API_KEY`, and an existing `books` row with that `id`. On **PowerShell**: `$env:BOOK_ID="<uuid>"; $env:FILE_PATH=".\path\to\book.epub"; pnpm ingest:book-rag`. |

### Other commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Next.js development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server after `build` |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generate SQL migrations from `db/schema.ts` |
| `pnpm db:migrate` | Apply migrations to the database in `DATABASE_URL` |
| `pnpm test:rag` | Node test runner for RAG-related server tests |

### Troubleshooting

- **`DATABASE_URL is required`**: Set `DATABASE_URL` in `.env.local` and restart the dev server or rerun the script.
- **`GEMINI_API_KEY is not set`**: Required for embedding and chat paths that call Gemini.
- **Supabase pooler / max clients**: Reduce `DATABASE_POOL_MAX` or use the transaction pooler connection string for concurrent server workloads (see comment in `db/index.ts`).
- **Migration errors mentioning `vector` or `gin_trgm_ops`**: Enable the `vector` and `pg_trgm` extensions before running migrations.

---

## License

Private project (`"private": true` in `package.json`). Add a public license file here if you open-source the repo.
