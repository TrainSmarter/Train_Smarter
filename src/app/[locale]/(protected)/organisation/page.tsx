import { getTranslations } from "next-intl/server";
import { OrganisationTabs } from "@/components/organisation-tabs";
import { AthletesList } from "@/components/athletes-list";
import { TeamsList } from "@/components/teams-list";
import { fetchAthletes } from "@/lib/athletes/queries";
import { fetchTeams } from "@/lib/teams/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: `${t("organisation")} — Train Smarter`,
  };
}

export default async function OrganisationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab === "teams" ? "teams" : "athletes";
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10) || 1);

  const [{ athletes, totalCount, hasMore }, teams] = await Promise.all([
    fetchAthletes(page),
    fetchTeams(),
  ]);

  return (
    <OrganisationTabs
      defaultTab={activeTab as "athletes" | "teams"}
      athletesContent={
        <AthletesList
          athletes={athletes}
          currentPage={page}
          totalCount={totalCount}
          hasMore={hasMore}
        />
      }
      teamsContent={<TeamsList teams={teams} />}
    />
  );
}
