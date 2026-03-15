"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelTeamInvitation } from "@/lib/teams/actions";
import type { TeamInvitation } from "@/lib/teams/types";

interface TeamInvitationsListProps {
  teamId: string;
  invitations: TeamInvitation[];
}

export function TeamInvitationsList({
  teamId,
  invitations,
}: TeamInvitationsListProps) {
  const t = useTranslations("teams");
  const locale = useLocale();
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  async function handleCancel(invitationId: string) {
    setCancellingId(invitationId);
    try {
      const result = await cancelTeamInvitation({ teamId, invitationId });
      if (result.success) {
        toast.success(t("invitationCancelled"));
      } else {
        toast.error(t("errorGeneric"));
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="space-y-2">
      {invitations.map((invitation) => {
        const isExpired = new Date(invitation.expiresAt) < new Date();
        return (
          <div
            key={invitation.id}
            className="flex items-center gap-3 rounded-md border border-dashed p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-foreground">
                {invitation.email}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={isExpired ? "error" : "warning"} size="sm">
                  {isExpired ? t("expired") : t("pending")}
                </Badge>
                <span className="flex items-center gap-1 text-caption text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(invitation.createdAt).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-error"
              onClick={() => handleCancel(invitation.id)}
              loading={cancellingId === invitation.id}
              aria-label={t("cancelInvitation")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
