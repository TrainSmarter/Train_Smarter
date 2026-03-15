"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createTeam, updateTeam } from "@/lib/teams/actions";
import { createTeamSchema, type CreateTeamFormData } from "@/lib/validations/teams";

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, the modal acts as "edit" instead of "create" */
  team?: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
  };
}

export function TeamFormModal({ open, onOpenChange, team }: TeamFormModalProps) {
  const t = useTranslations("teams");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isEdit = !!team;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
    },
  });

  // Reset form when modal opens/closes or team changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: team?.name ?? "",
        description: team?.description ?? "",
      });
    }
  }, [open, team, reset]);

  const descriptionValue = watch("description") ?? "";

  async function onSubmit(values: CreateTeamFormData) {
    setIsSubmitting(true);
    try {
      if (isEdit && team) {
        const result = await updateTeam({
          teamId: team.id,
          name: values.name,
          description: values.description,
        });
        if (result.success) {
          toast.success(t("teamUpdated"));
          onOpenChange(false);
        } else {
          toast.error(t("errorGeneric"));
        }
      } else {
        const result = await createTeam({
          name: values.name,
          description: values.description,
        });
        if (result.success) {
          toast.success(t("teamCreated"));
          reset();
          onOpenChange(false);
        } else {
          toast.error(t("errorGeneric"));
        }
      }
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      size="md"
      title={isEdit ? t("editTeam") : t("createTeam")}
      footer={
        <div className="flex w-full gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            type="button"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="team-form"
            loading={isSubmitting}
          >
            {isEdit ? tCommon("save") : t("createTeam")}
          </Button>
        </div>
      }
    >
      <form
        id="team-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="team-name">{t("teamName")}</Label>
          <Input
            id="team-name"
            placeholder={t("teamNamePlaceholder")}
            maxLength={100}
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-body-sm text-error" role="alert">
              {t("errorNameRequired")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-description">
            {t("teamDescription")}
            <span className="ml-1 text-muted-foreground font-normal">
              ({t("optional")})
            </span>
          </Label>
          <Textarea
            id="team-description"
            placeholder={t("teamDescriptionPlaceholder")}
            maxLength={500}
            rows={3}
            {...register("description")}
          />
          <p className="text-caption text-muted-foreground text-right">
            {descriptionValue.length}/500
          </p>
        </div>
      </form>
    </Modal>
  );
}
