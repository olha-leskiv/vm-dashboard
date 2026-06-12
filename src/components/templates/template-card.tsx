"use client";

import type { ElementType } from "react";
import { Cpu, HardDrive, MemoryStick, Pencil, Server } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { VMTemplate } from "@/types";

const MAX_VISIBLE_TOOLS = 4;

function Spec({ icon: Icon, label }: { icon: ElementType; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      {label}
    </span>
  );
}

export interface TemplateCardProps {
  template: VMTemplate;
  onView: () => void;
  onEdit: () => void;
}

export function TemplateCard({ template, onView, onEdit }: TemplateCardProps) {
  const visibleTools = template.preinstalledTools.slice(0, MAX_VISIBLE_TOOLS);
  const overflow = template.preinstalledTools.length - MAX_VISIBLE_TOOLS;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onView(); } }}
      aria-label={`View ${template.name} template`}
      className="group relative cursor-pointer hover:bg-muted/70"
    >
      <CardContent className="flex  flex-col gap-3 transition-all">

        <button
          type="button"
          aria-label={`Edit ${template.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
        </button>

        <div className="pr-7">
          <h3 className="leading-snug">{template.name}</h3>
          {template.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{template.description}</p>
          )}
        </div>

        <Separator />

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Server className="size-3.5 shrink-0" />
          <span className="font-mono">{template.baseImage}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Spec icon={Cpu} label={`${template.vCpu} vCPU`} />
          <Spec icon={MemoryStick} label={`${template.memoryGb} GB RAM`} />
          <Spec icon={HardDrive} label={`${template.diskSizeGb} GB disk`} />
        </div>

        {template.preinstalledTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTools.map((tool) => (
              <Badge key={tool} variant="secondary" className="h-5 px-1.5 py-0 font-mono text-[11px]">
                {tool}
              </Badge>
            ))}
            {overflow > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0 text-[11px] text-muted-foreground">
                +{overflow} more
              </Badge>
            )}
          </div>
        )}

      </CardContent>
    </Card >
  );
}
