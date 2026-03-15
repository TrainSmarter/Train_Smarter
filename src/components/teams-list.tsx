"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { TeamCard } from "@/components/team-card";
import { TeamFormModal } from "@/components/team-form-modal";
import type { TeamListItem } from "@/lib/teams/types";

interface TeamsListProps {
  teams: TeamListItem[];
}

export function TeamsList({ teams }: TeamsListProps) {
  const t = useTranslations("teams");
  const [createOpen, setCreateOpen] = React.useState(false);

  const hasAny = teams.length > 0;

  return (
    <>
      {/* Header with create button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-h3 text-foreground">{t("title")}</h2>
          <p className="mt-1 text-body text-muted-foreground">
            {t("subtitle", { count: teams.length })}
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          iconLeft={<Plus className="h-4 w-4" />}
        >
          {t("createTeam")}
        </Button>
      </div>

      {/* Empty State */}
      {!hasAny && (
        <EmptyState
          className="mt-12"
          icon="👥"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            <Button
              onClick={() => setCreateOpen(true)}
              iconLeft={<Plus className="h-4 w-4" />}
            >
              {t("createTeam")}
            </Button>
          }
        />
      )}

      {/* Teams Grid */}
      {hasAny && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <TeamFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
