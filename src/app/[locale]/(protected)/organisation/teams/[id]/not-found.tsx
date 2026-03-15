import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default async function TeamNotFound() {
  const t = await getTranslations("teams");

  return (
    <EmptyState
      className="mt-24"
      icon={<Users className="h-12 w-12" />}
      title={t("title")}
      description={t("emptyDescription")}
    />
  );
}
