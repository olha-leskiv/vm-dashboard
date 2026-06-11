import { Suspense } from "react";
import { TemplatesDashboard, TemplatesSkeleton } from "@/components/templates/templates-dashboard";

export default function TemplatesPage() {
  return (
    <Suspense fallback={<TemplatesSkeleton />}>
      <TemplatesDashboard />
    </Suspense>
  );
}
