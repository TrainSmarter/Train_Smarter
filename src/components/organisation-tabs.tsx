"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrganisationTabsProps {
  defaultTab?: "athletes" | "teams";
  athletesContent: React.ReactNode;
  teamsContent: React.ReactNode;
}

export function OrganisationTabs({
  defaultTab = "athletes",
  athletesContent,
  teamsContent,
}: OrganisationTabsProps) {
  const t = useTranslations("teams");

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="athletes">{t("tabAthletes")}</TabsTrigger>
        <TabsTrigger value="teams">{t("tabTeams")}</TabsTrigger>
      </TabsList>

      <TabsContent value="athletes">{athletesContent}</TabsContent>
      <TabsContent value="teams">{teamsContent}</TabsContent>
    </Tabs>
  );
}
