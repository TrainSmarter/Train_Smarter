/**
 * Mock session — Supabase User shape.
 * PROJ-4 will replace this import with real Supabase auth (`@supabase/ssr` + `getUser()`).
 * Shape intentionally mirrors the real Supabase JWT so PROJ-4 is a drop-in replacement.
 *
 * Role architecture (Phase 1 — defined in PROJ-4):
 * - `app_metadata.roles`: UserRole[] — stored as ARRAY (e.g. ["TRAINER"]) for Dual-Role readiness (PROJ-11+)
 * - `app_metadata.is_platform_admin`: boolean — grants access to /admin area (manual SQL-only)
 * - NO "ADMIN" UserRole: platform admins are regular TRAINER/ATHLETE accounts with is_platform_admin=true
 */

export type UserRole = "ATHLETE" | "TRAINER";

export interface MockUser {
  id: string;
  email: string;
  /** Client-editable profile data (display only, never used for access control) */
  user_metadata: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  /** Server-controlled auth data (set via Supabase Edge Function with service-role key) */
  app_metadata: {
    /** Array of roles — use roles[0] for single-role access; supports future Dual-Role (PROJ-11+) */
    roles: UserRole[];
    is_platform_admin: boolean;
  };
}

/**
 * Default mock user — change roles/is_platform_admin here to test role-based navigation.
 * TRAINER sees: Dashboard, Training (all), Body & Ernährung, Organisation, Account, Settings.
 * ATHLETE sees: Dashboard, Training (Kalender only), Body & Ernährung, Account, Settings.
 * is_platform_admin: true → additionally sees Admin section.
 */
export const mockUser: MockUser = {
  id: "mock-user-001",
  email: "lukas@trainsmarter.app",
  user_metadata: {
    first_name: "Lukas",
    last_name: "Kitzberger",
    avatar_url: undefined,
  },
  app_metadata: {
    roles: ["TRAINER"],
    is_platform_admin: false,
  },
};
