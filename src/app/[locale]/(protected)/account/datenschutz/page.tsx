import { redirect } from "next/navigation";

/**
 * Legacy route: /account/datenschutz
 * Redirects to /account#datenschutz (consolidated account page, privacy tab).
 * The 301 redirect is handled by middleware, but this serves as a fallback.
 */
export default function LegacyPrivacyPage() {
  redirect("/account");
}
