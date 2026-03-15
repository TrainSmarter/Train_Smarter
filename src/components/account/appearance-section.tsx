"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", icon: Sun, labelKey: "themeLight" },
  { value: "dark", icon: Moon, labelKey: "themeDark" },
  { value: "system", icon: Monitor, labelKey: "themeSystem" },
] as const;

export function AppearanceSection() {
  const t = useTranslations("account");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-h4">
            <Palette className="h-5 w-5" />
            {t("appearanceTitle")}
          </CardTitle>
          <CardDescription>{t("appearanceDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {THEMES.map(({ value, icon: Icon, labelKey }) => (
              <Button
                key={value}
                variant="outline"
                size="lg"
                className="flex-1 max-w-48 justify-start gap-3"
                disabled
              >
                <Icon className="h-4 w-4" />
                {t(labelKey)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h4">
          <Palette className="h-5 w-5" />
          {t("appearanceTitle")}
        </CardTitle>
        <CardDescription>{t("appearanceDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          {THEMES.map(({ value, icon: Icon, labelKey }) => (
            <Button
              key={value}
              variant={theme === value ? "default" : "outline"}
              size="lg"
              className={cn(
                "flex-1 max-w-48 justify-start gap-3",
                theme === value && "ring-2 ring-primary/20"
              )}
              onClick={() => setTheme(value)}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
