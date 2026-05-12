import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(1200),
  lang: z.enum(["en", "vi"]),
});

const DEFAULT_VOICES: Record<
  "en" | "vi",
  { name: string; languageCode: string }
> = {
  en: { name: "en-US-Neural2-C", languageCode: "en-US" },
  vi: { name: "vi-VN-Neural2-A", languageCode: "vi-VN" },
};

type GoogleTtsErrorBody = {
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { text, lang } = parsed.data;
  const voice = DEFAULT_VOICES[lang];

  let ttsResp: Response;
  try {
    ttsResp = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: voice.languageCode, name: voice.name },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0,
          },
        }),
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  if (!ttsResp.ok) {
    let body: GoogleTtsErrorBody | null = null;
    try {
      body = (await ttsResp.json()) as GoogleTtsErrorBody;
    } catch {
      body = null;
    }
    const status = body?.error?.status;
    if (status === "RESOURCE_EXHAUSTED" || ttsResp.status === 429) {
      return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
    }
    if (
      status === "PERMISSION_DENIED" ||
      status === "UNAUTHENTICATED" ||
      ttsResp.status === 401 ||
      ttsResp.status === 403
    ) {
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  let data: { audioContent?: string };
  try {
    data = (await ttsResp.json()) as { audioContent?: string };
  } catch {
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }
  if (!data.audioContent) {
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }

  const audio = Buffer.from(data.audioContent, "base64");
  return new Response(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
      "Content-Length": String(audio.length),
    },
  });
}
