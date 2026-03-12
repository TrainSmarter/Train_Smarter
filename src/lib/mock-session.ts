/**
 * Mock session — Supabase User shape.
 * PROJ-4 will replace this import with real Supabase auth.
 * No downstream changes needed: all consumers use this shape.
 *
 * Role architecture (Phase 1):
 * - `app_metadata.role`: "ATHLETE" | "TRAINER" — server-controlled, not client-editable
 * - `app_metadata.is_platform_admin`: boolean — grants access to /admin area
 * - NO "ADMIN" UserRole: platform admins are regular TRAINER/ATHLETE accounts with the flag set
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
  /** Server-controlled auth data (used for role-based access control) */
  app_metadata: {
    role: UserRole;
    is_platform_admin: boolean;
  };
}

/**
 * Default mock user — change role/is_platform_admin here to test role-based navigation.
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
    role: "TRAINER",
    is_platform_admin: false,
  },
};
