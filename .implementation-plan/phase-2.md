# Phase 2: Admin CMS & Content Ingestion

This phase focuses on building the management interface to populate our platform with high-quality book summaries.

## 1. CMS Objectives
* Build a protected Admin Dashboard for content management.
* Create a "Smart Ingestion" form to process raw book data into summaries.
* Integrate OpenAI logic directly into the CMS workflow.

## 1.1 Folder structure

app/admin/
├── page.tsx            # Dashboard Overview (Stats & Recent Books)
├── books/
│   ├── page.tsx        # List of all books (DataTable)
│   └── new/
│       └── page.tsx    # The "Ingestion" Form (Where the magic happens)
├── categories/         # Manage book categories[cite: 2]
└── layout.tsx          # Admin Sidebar & Protection[cite: 2]

## 2. Core Features
### 2.1. Book Management (CRUD)
- **Dashboard:** Overview of total books and processing status.
- **Book List:** A Shadcn DataTable showing all summaries with Edit/Delete actions.
- **Category Manager:** Simple interface to organize books (Tech, Poker, Game Design, etc.).

### 2.2. The Ingestion Pipeline
#### 2.2.1 The generateSummaryAction Logic
This Server Action handles the bridge between raw input and structured AI output also the streaming UI.

### Workflow:
1. **Input:** Receives `rawText` from the Admin Form.
2. **System Prompt:** Instructs GPT-4o-mini to:
   - Identify the book title and author if not provided.
   - Create a Markdown summary with headers: # Summary, ## Key Takeaways, ## Detailed Analysis.
   - Keep the tone professional and insightful.
3. **OpenAI Call:** Uses `openai.chat.completions.create`.
4. **Validation:** Checks if the response is valid Markdown.
5. **Return:** Returns the generated string to the UI for user review.

## 2. The saveBookAction Logic
Once the user reviews and edits the summary:
1. **Input:** Receives the finalized `title`, `author`, `summaryContent`, and `categoryId`.
2. **Drizzle Transaction:** 
   - Inserts the record into the `books` table.
   - Returns the new `bookId`.
3. **Navigation:** Redirects the admin back to the Book List page.
1. **Source Input:** Textarea for raw book content (or file upload).
2. **AI Summary Generation:** A button to trigger `generateSummaryAction`.
3. **Review Area:** A Markdown editor (like `react-markdown` or `tiptap`) to polish the AI's output before saving to the database.

## 3. Technical Stack for CMS
- **UI Components:** Shadcn UI (Forms, Tables, Dialogs, Sidebar).
- **State Management:** Next.js Server Actions for processing.
- **Form Handling:** React Hook Form + Zod for validation.

## 4. Implementation Steps
- [ ] Create `/admin` layout with navigation sidebar.
- [ ] Define the `IngestionForm` component with a loading state for AI generation.
- [ ] Implement `upsertBook` Server Action to save to Drizzle.
- [ ] (Optional) Add a "Generate Audio" toggle in the form to trigger TTS.

## 5. Cursor Prompts
- "Using @shadcn/ui, build an Admin Sidebar with navigation for Books and Categories."
- "Create a Server Action in `app/admin/books/actions.ts` that takes raw text, calls OpenAI to generate a summary, and returns the markdown."