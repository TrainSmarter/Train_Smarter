"use client";

import { useTranslations } from "next-intl";
import { Bell, Construction } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotificationsSection() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-h4">
          <Bell className="h-5 w-5" />
          {t("notificationsTitle")}
        </CardTitle>
        <CardDescription>{t("notificationsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-6 text-center">
          <Construction className="h-5 w-5 text-muted-foreground" />
          <p className="text-body-sm text-muted-foreground">
            {tCommon("comingSoonDescription")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
