import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_LOCALES = ["de", "en"] as const;

/**
 * POST /api/account/locale
 * Updates the user's preferred locale in both profiles.locale and user_metadata.locale.
 * After this, all future emails and the UI will use the new language.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale } = body;

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: "Invalid locale. Must be 'de' or 'en'." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update profiles.locale in the database
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ locale })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profiles.locale:", profileError);
      return NextResponse.json(
        { error: "Failed to update locale" },
        { status: 500 }
      );
    }

    // Update user_metadata.locale (for middleware access without DB query)
    const { error: metaError } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, locale },
    });

    if (metaError) {
      console.error("Error updating user_metadata.locale:", metaError);
      // Non-fatal: profiles.locale is the source of truth
    }

    return NextResponse.json({ success: true, locale });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
