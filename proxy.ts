import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const intlMiddleware = createMiddleware(routing);

function mergeCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((c) => {
    target.cookies.set(c.name, c.value, c);
  });
}

export async function proxy(request: NextRequest) {
  const sessionResponse = await updateSession(request);
  const intlResponse = intlMiddleware(request);

  if (sessionResponse.status >= 300 && sessionResponse.status < 400) {
    mergeCookies(sessionResponse, intlResponse);
    return sessionResponse;
  }

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    mergeCookies(intlResponse, sessionResponse);
    return intlResponse;
  }

  mergeCookies(intlResponse, sessionResponse);
  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next|_next/static|_next/image|_vercel|.*\\..*).*)",
  ],
};
