"use client";

import { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Server, X, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { useTemplates } from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/layout/page-header";
import { TemplateCard } from "@/components/templates/template-card";
import type { VMTemplate } from "@/types";

// ─── schema ───────────────────────────────────────────────────────────────────

const templateSchema = z.object({
  name: z.string().min(2, "Must be at least 2 characters."),
  description: z.string(),
  baseImage: z.string().min(1, "Base image is required."),
  vCpu: z.string().refine(
    (v) => v !== "" && Number.isInteger(Number(v)) && Number(v) >= 1,
    "Must be a whole number ≥ 1."
  ),
  memoryGb: z.string().refine(
    (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 1,
    "Must be ≥ 1 GB."
  ),
  diskSizeGb: z.string().refine(
    (v) => v !== "" && !isNaN(Number(v)) && Number(v) >= 10,
    "Must be ≥ 10 GB."
  ),
  preinstalledTools: z.array(z.string()),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

// ─── helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `tpl-${Date.now().toString(36)}`;
}

function templateToValues(t: VMTemplate): TemplateFormValues {
  return {
    name: t.name,
    description: t.description,
    baseImage: t.baseImage,
    vCpu: String(t.vCpu),
    memoryGb: String(t.memoryGb),
    diskSizeGb: String(t.diskSizeGb),
    preinstalledTools: [...t.preinstalledTools],
  };
}

function blankValues(): TemplateFormValues {
  return {
    name: "",
    description: "",
    baseImage: "",
    vCpu: "",
    memoryGb: "",
    diskSizeGb: "",
    preinstalledTools: [],
  };
}

// ─── tools tag input ──────────────────────────────────────────────────────────

function ToolsInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tool = draft.trim().replace(/,+$/, "");
    if (tool && !value.includes(tool)) onChange([...value, tool]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="space-y-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder="Type a tool name and press Enter…"
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tool) => (
            <Badge key={tool} variant="secondary" className="gap-1 pr-1 font-mono text-xs">
              {tool}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onChange(value.filter((t) => t !== tool))}
                className="size-3.5 rounded hover:text-foreground"
              >
                <X className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── view drawer ──────────────────────────────────────────────────────────────

export function ViewDrawer({
  template,
  onClose,
  onEdit,
}: {
  template: VMTemplate | null;
  onClose: () => void;
  onEdit?: (t: VMTemplate) => void;
}) {
  const t = template;
  return (
    <Sheet open={!!t} onOpenChange={(open: boolean) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto gap-0 p-0">
        {t && (
          <>
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-start justify-between gap-2 pr-6">
                <div>
                  <SheetTitle>{t.name}</SheetTitle>
                  {t.description && (
                    <SheetDescription className="mt-1 text-xs leading-relaxed">
                      {t.description}
                    </SheetDescription>
                  )}
                </div>
              </div>
            </SheetHeader>

            <div className="px-4 py-4 space-y-5">
              <section>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Base Image
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Server className="size-4 text-muted-foreground shrink-0" />
                  <span className="font-mono">{t.baseImage}</span>
                </div>
              </section>

              <Separator />

              <section>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Hardware Specifications
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Cpu, label: "vCPU", value: String(t.vCpu) },
                    { icon: MemoryStick, label: "Memory", value: `${t.memoryGb} GB` },
                    { icon: HardDrive, label: "Disk", value: `${t.diskSizeGb} GB` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                      <Icon className="size-3.5 text-muted-foreground mb-1.5" />
                      <p className="text-lg font-semibold tabular-nums">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              <section>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Preinstalled Tools
                </p>
                {t.preinstalledTools.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {t.preinstalledTools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="font-mono text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="px-4 pb-4 pt-2 mt-auto border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5"
                onClick={() => onEdit?.(t)}
              >
                <Pencil className="size-3.5" />
                Edit Template
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── create / edit form drawer ────────────────────────────────────────────────

interface FormDrawerProps {
  mode: "create" | "edit" | null;
  defaultValues: TemplateFormValues;
  onClose: () => void;
  onSave: (values: TemplateFormValues, id?: string) => void;
  editId?: string;
}

function FormDrawer({ mode, defaultValues, onClose, onSave, editId }: FormDrawerProps) {
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues,
  });

  const [saving, setSaving] = useState(false);
  const open = mode !== null;

  async function onSubmit(values: TemplateFormValues) {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave(values, editId);
    setSaving(false);
  }

  function handleClose() {
    form.reset();
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && handleClose()}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto gap-0 p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <SheetTitle>
            {mode === "create" ? "Create Template" : "Edit Template"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Define a new VM template for developers to use."
              : "Update the template configuration."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="px-4 py-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name <span className="text-destructive" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} aria-required="true" placeholder="e.g. Dev Standard" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Short description of what this template is for…"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Image <span className="text-destructive" aria-hidden="true">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} aria-required="true" placeholder="e.g. ubuntu-22.04" className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="vCpu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>vCPU <span className="text-destructive" aria-hidden="true">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} aria-required="true" type="number" min={1} step={1} placeholder="4" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memoryGb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory (GB) <span className="text-destructive" aria-hidden="true">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} aria-required="true" type="number" min={1} placeholder="16" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diskSizeGb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disk (GB) <span className="text-destructive" aria-hidden="true">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} aria-required="true" type="number" min={10} placeholder="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preinstalledTools"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preinstalled Tools</FormLabel>
                    <ToolsInput value={field.value} onChange={field.onChange} />
                    <FormDescription>Press Enter or comma to add each tool.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-border flex gap-2 justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : mode === "create" ? "Create Template" : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ─── loading skeleton ─────────────────────────────────────────────────────────

export function TemplatesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── main dashboard ───────────────────────────────────────────────────────────

export function TemplatesDashboard() {
  const { data: res } = useTemplates();
  const [templates, setTemplates] = useState<VMTemplate[]>(() => res.data);

  const [viewTemplate, setViewTemplate] = useState<VMTemplate | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<VMTemplate | null>(null);

  const formDefaults = editTarget ? templateToValues(editTarget) : blankValues();

  function openEdit(t: VMTemplate) {
    setViewTemplate(null);
    setTimeout(() => {
      setEditTarget(t);
      setFormMode("edit");
    }, 150);
  }

  function openCreate() {
    setEditTarget(null);
    setFormMode("create");
  }

  function closeForm() {
    setFormMode(null);
    setEditTarget(null);
  }

  function handleSave(values: TemplateFormValues, id?: string) {
    const template: VMTemplate = {
      id: id ?? generateId(),
      name: values.name.trim(),
      description: values.description.trim(),
      baseImage: values.baseImage.trim(),
      vCpu: Number(values.vCpu),
      memoryGb: Number(values.memoryGb),
      diskSizeGb: Number(values.diskSizeGb),
      preinstalledTools: values.preinstalledTools,
    };

    if (id) {
      setTemplates((ts) => ts.map((t) => (t.id === id ? template : t)));
    } else {
      setTemplates((ts) => [...ts, template]);
    }
    closeForm();
  }

  return (
    <>
      <div className="space-y-5">
        <PageHeader
          title="Templates"
          description="VM templates available to developers when creating machines."
          actions={
            <Button size="sm" onClick={openCreate} className="gap-1.5 shrink-0">
              <Plus className="size-4" />
              Create Template
            </Button>
          }
        />

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 rounded-xl border border-dashed border-border text-center">
            <p className="text-muted-foreground text-sm">No templates yet.</p>
            <Button size="sm" variant="outline" onClick={openCreate} className="gap-1.5">
              <Plus className="size-3.5" />
              Create the first template
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onView={() => setViewTemplate(t)}
                onEdit={() => openEdit(t)}
              />
            ))}
          </div>
        )}
      </div>

      <ViewDrawer
        template={viewTemplate}
        onClose={() => setViewTemplate(null)}
        onEdit={openEdit}
      />

      <FormDrawer
        key={`${formMode}-${editTarget?.id ?? "new"}`}
        mode={formMode}
        defaultValues={formDefaults}
        editId={editTarget?.id}
        onClose={closeForm}
        onSave={handleSave}
      />
    </>
  );
}
