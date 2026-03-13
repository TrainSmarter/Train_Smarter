import { NextResponse, type NextRequest } from "next/server";

/**
 * Stores an invite token as an httpOnly cookie.
 * Called when a user clicks an invite link: /api/auth/invite-token?token=xxx
 * The token survives email verification on a different device/browser.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token || token.length < 32) {
    return NextResponse.json(
      { error: "Invalid invite token" },
      { status: 400 }
    );
  }

  // Redirect to register page with invite context
  const registerUrl = new URL("/register", request.url);
  const response = NextResponse.redirect(registerUrl);

  // Set httpOnly cookie (7 days TTL, matching invite token expiry)
  response.cookies.set("inviteToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
}
