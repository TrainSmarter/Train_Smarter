"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary for auth flows. Catches unhandled errors
 * (e.g., Supabase unreachable) and shows a user-friendly fallback.
 */
export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AuthErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

function AuthErrorFallback({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("auth");

  return (
    <Alert variant="destructive" className="max-w-md mx-auto mt-8">
      <AlertTitle>{t("errorBoundary.title")}</AlertTitle>
      <AlertDescription className="mt-2">
        {t("errorBoundary.message")}
      </AlertDescription>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {t("errorBoundary.retry")}
      </Button>
    </Alert>
  );
}
