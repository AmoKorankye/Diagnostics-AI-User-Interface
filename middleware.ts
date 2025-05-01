import { betterFetch } from "@better-fetch/fetch";
import type { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
 
type Session = typeof auth.$Infer.Session;

const publicRoutes = ["/login", "/signup", "/auth/callback", "/reset-password"]
 
export async function middleware(request: NextRequest) {
	const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
		baseURL: request.nextUrl.origin,
		headers: {
			cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
		},
	});
 
	if (!session && !publicRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if(session && publicRoutes.includes(request.nextUrl.pathname)) {
		return NextResponse.redirect(new URL("/", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};