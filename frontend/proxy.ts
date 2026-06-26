import { NextResponse, type NextRequest } from "next/server";
import {
  getPreferredLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

function shouldSkip(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/media") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];

  if (!isLocale(firstSegment)) {
    const locale = getPreferredLocale(
      request.headers.get("accept-language"),
      request.cookies.get(localeCookieName)?.value,
    );
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  const pathWithoutLocale = pathname.replace(`/${firstSegment}`, "") || "/";
  url.pathname = pathWithoutLocale;
  url.search = search;

  const response = NextResponse.rewrite(url);
  response.cookies.set(localeCookieName, firstSegment as Locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
