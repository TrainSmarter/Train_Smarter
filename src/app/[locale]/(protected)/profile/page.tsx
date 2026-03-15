import { redirect } from "next/navigation";

/**
 * Legacy route: /profile
 * Redirects to /account (consolidated account page).
 * The 301 redirect is handled by middleware, but this serves as a fallback.
 */
export default function LegacyProfilePage() {
  redirect("/account");
}
