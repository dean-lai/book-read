├── app/                  # Next.js App Router (Pages, Layouts, Server Actions)
│   ├── (auth)/           # Authentication routes (Login/Signup)
│   ├── (dashboard)/      # Protected routes for reading and listening
│   ├── admin/            # CMS for uploading and summarizing books
│   └── api/              # API Route handlers (Edge functions for AI)
├── components/           # UI Components (Shadcn UI, AudioPlayer, ChatBox)
├── db/                   # Database layer
│   ├── schema.ts         # Drizzle ORM schema definitions
│   └── index.ts          # Supabase/Drizzle connection
├── lib/                  # Shared utilities and configurations
│   ├── supabase/         # Supabase client (Client & Server)
│   └── utils.ts          # General helper functions
├── services/             # Core Business Logic (The "Brain")[cite: 2]
│   ├── ai-service.ts     # OpenAI Summarization logic[cite: 2]
│   ├── rag-service.ts    # Vector search and Chat logic[cite: 2]
│   └── tts-service.ts    # ElevenLabs audio generation[cite: 2]
└── types/                # TypeScript interfaces and definitions[cite: 2]