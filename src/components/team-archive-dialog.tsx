"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { archiveTeam } from "@/lib/teams/actions";

interface TeamArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
}

export function TeamArchiveDialog({
  open,
  onOpenChange,
  teamId,
  teamName,
}: TeamArchiveDialogProps) {
  const t = useTranslations("teams");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [confirmValue, setConfirmValue] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isMatch = confirmValue === teamName;

  React.useEffect(() => {
    if (open) {
      setConfirmValue("");
      setError(null);
    }
  }, [open]);

  async function handleArchive() {
    if (!isMatch) {
      setError(t("archiveTeamNameMismatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await archiveTeam({
        teamId,
        confirmName: confirmValue,
      });
      if (result.success) {
        toast.success(t("teamArchived"));
        onOpenChange(false);
        router.push("/organisation");
      } else if (result.error === "NAME_MISMATCH") {
        setError(t("archiveTeamNameMismatch"));
      } else {
        toast.error(t("errorGeneric"));
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={t("archiveTeamTitle")}
      description={t("archiveTeamMessage")}
      footer={
        <div className="flex w-full gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            loading={isSubmitting}
            disabled={!isMatch}
          >
            {t("archiveTeam")}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="archive-confirm">
            <span className="font-semibold">{teamName}</span>
          </Label>
          <Input
            id="archive-confirm"
            value={confirmValue}
            onChange={(e) => {
              setConfirmValue(e.target.value);
              setError(null);
            }}
            placeholder={t("archiveTeamConfirmPlaceholder")}
            autoComplete="off"
          />
          {error && (
            <p className="text-body-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
