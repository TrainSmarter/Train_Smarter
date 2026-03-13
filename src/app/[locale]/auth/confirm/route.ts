import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Extract locale from URL path
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const locale =
    pathParts[1] === "de" || pathParts[1] === "en" ? pathParts[1] : "de";

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(`/${locale}/login`, origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    // Token expired or invalid
    if (type === "recovery") {
      return NextResponse.redirect(
        new URL(
          `/${locale}/reset-password?error=${encodeURIComponent(error.code || "otp_expired")}&error_description=${encodeURIComponent(error.message)}`,
          origin
        )
      );
    }
    return NextResponse.redirect(
      new URL(
        `/${locale}/verify-email?error=${encodeURIComponent(error.code || "verification_failed")}`,
        origin
      )
    );
  }

  // Success — redirect based on type
  switch (type) {
    case "recovery":
      return NextResponse.redirect(
        new URL(`/${locale}/reset-password`, origin)
      );
    case "invite":
      return NextResponse.redirect(
        new URL(`/${locale}/onboarding`, origin)
      );
    case "magiclink":
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, origin)
      );
    case "email_change":
      return NextResponse.redirect(
        new URL(`/${locale}/settings`, origin)
      );
    case "signup":
    case "email":
      return NextResponse.redirect(
        new URL(`/${locale}/onboarding`, origin)
      );
    default:
      return NextResponse.redirect(
        new URL(`/${locale}/dashboard`, origin)
      );
  }
}
