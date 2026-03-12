import {
  LayoutDashboard,
  Dumbbell,
  Calendar,
  ClipboardList,
  BarChart3,
  Heart,
  Apple,
  Scale,
  Users,
  UserCog,
  Settings,
  User,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/mock-session";

export interface NavItem {
  /** Key into messages.nav namespace */
  labelKey: string;
  icon: LucideIcon;
  path: string;
  /** If set, only these roles see this item. Undefined = all roles. */
  allowedRoles?: UserRole[];
  /** If true, only users with is_platform_admin = true see this item. */
  requiresPlatformAdmin?: boolean;
}

export interface NavSection {
  /** Key into messages.nav namespace */
  labelKey: string;
  icon: LucideIcon;
  /** If set, the section is collapsible and this is the base path for auto-expand. */
  basePath?: string;
  items: NavItem[];
  /** If set, only these roles see this section. */
  allowedRoles?: UserRole[];
  /** If true, only users with is_platform_admin = true see this section. */
  requiresPlatformAdmin?: boolean;
}

export type NavEntry =
  | { type: "item"; item: NavItem }
  | { type: "section"; section: NavSection };

/**
 * Full navigation configuration.
 * Role filtering happens at render time in NavMain.
 */
export const navConfig: NavEntry[] = [
  {
    type: "item",
    item: {
      labelKey: "dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
  },
  {
    type: "section",
    section: {
      labelKey: "training",
      icon: Dumbbell,
      basePath: "/training",
      items: [
        {
          labelKey: "trainingCalendar",
          icon: Calendar,
          path: "/training/kalender",
        },
        {
          labelKey: "trainingPrograms",
          icon: ClipboardList,
          path: "/training/programme",
          allowedRoles: ["TRAINER"],
        },
        {
          labelKey: "trainingAnalysis",
          icon: BarChart3,
          path: "/training/auswertung",
          allowedRoles: ["TRAINER"],
        },
      ],
    },
  },
  {
    type: "section",
    section: {
      labelKey: "bodyNutrition",
      icon: Heart,
      basePath: "/body",
      items: [
        {
          labelKey: "bodyMeasurements",
          icon: Scale,
          path: "/body/koerpermasze",
        },
        {
          labelKey: "nutrition",
          icon: Apple,
          path: "/body/ernaehrung",
        },
      ],
    },
  },
  {
    type: "section",
    section: {
      labelKey: "organisation",
      icon: Users,
      basePath: "/organisation",
      allowedRoles: ["TRAINER"],
      items: [
        {
          labelKey: "myAthletes",
          icon: UserCog,
          path: "/organisation/athleten",
        },
      ],
    },
  },
  {
    type: "section",
    section: {
      labelKey: "admin",
      icon: Shield,
      basePath: "/admin",
      requiresPlatformAdmin: true,
      items: [
        {
          labelKey: "userManagement",
          icon: Users,
          path: "/admin/benutzer",
        },
      ],
    },
  },
  {
    type: "item",
    item: {
      labelKey: "account",
      icon: User,
      path: "/account",
    },
  },
  {
    type: "item",
    item: {
      labelKey: "settings",
      icon: Settings,
      path: "/account/einstellungen",
    },
  },
];
