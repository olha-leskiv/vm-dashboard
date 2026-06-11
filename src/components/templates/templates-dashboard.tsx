"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, Pencil, Server, X, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { useTemplates } from "@/lib/query/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { VMTemplate } from "@/types";
import { cn } from "@/lib/utils";

// ─── form types ───────────────────────────────────────────────────────────────

interface FormFields {
  name: string;
  description: string;
  baseImage: string;
  vCpu: string;
  memoryGb: string;
  diskSizeGb: string;
  preinstalledTools: string[];
}

interface FormErrors {
  name?: string;
  baseImage?: string;
  vCpu?: string;
  memoryGb?: string;
  diskSizeGb?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function blankForm(): FormFields {
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

function templateToForm(t: VMTemplate): FormFields {
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

function validate(f: FormFields): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim()) e.name = "Name is required.";
  else if (f.name.trim().length < 2) e.name = "Must be at least 2 characters.";
  if (!f.baseImage.trim()) e.baseImage = "Base image is required.";
  const vCpu = Number(f.vCpu);
  if (!f.vCpu || isNaN(vCpu) || vCpu < 1 || !Number.isInteger(vCpu))
    e.vCpu = "Must be a whole number ≥ 1.";
  const mem = Number(f.memoryGb);
  if (!f.memoryGb || isNaN(mem) || mem < 1) e.memoryGb = "Must be ≥ 1 GB.";
  const disk = Number(f.diskSizeGb);
  if (!f.diskSizeGb || isNaN(disk) || disk < 10) e.diskSizeGb = "Must be ≥ 10 GB.";
  return e;
}

function generateId() {
  return `tpl-${Date.now().toString(36)}`;
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
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tool))}
                className="rounded hover:text-foreground transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── form field wrapper ───────────────────────────────────────────────────────

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── spec chip ────────────────────────────────────────────────────────────────

function Spec({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3 shrink-0" />
      {label}
    </span>
  );
}

// ─── template card ────────────────────────────────────────────────────────────

const MAX_VISIBLE_TOOLS = 4;

interface TemplateCardProps {
  template: VMTemplate;
  onView: () => void;
  onEdit: () => void;
}

function TemplateCard({ template, onView, onEdit }: TemplateCardProps) {
  const visibleTools = template.preinstalledTools.slice(0, MAX_VISIBLE_TOOLS);
  const overflow = template.preinstalledTools.length - MAX_VISIBLE_TOOLS;

  return (
    <div
      onClick={onView}
      className="group relative flex flex-col rounded-xl border border-border bg-card ring-1 ring-foreground/10 cursor-pointer hover:border-foreground/20 hover:ring-foreground/20 transition-all p-4 gap-3"
    >
      {/* edit button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground transition-all"
      >
        <Pencil className="size-3.5" />
      </button>

      {/* name + description */}
      <div className="pr-7">
        <h3 className="leading-snug">{template.name}</h3>
        {template.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {template.description}
          </p>
        )}
      </div>

      <Separator />

      {/* base image */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Server className="size-3.5 shrink-0" />
        <span className="font-mono">{template.baseImage}</span>
      </div>

      {/* hardware specs */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Spec icon={Cpu} label={`${template.vCpu} vCPU`} />
        <Spec icon={MemoryStick} label={`${template.memoryGb} GB RAM`} />
        <Spec icon={HardDrive} label={`${template.diskSizeGb} GB disk`} />
      </div>

      {/* tools */}
      {template.preinstalledTools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleTools.map((tool) => (
            <Badge key={tool} variant="secondary" className="font-mono text-[11px] px-1.5 py-0 h-5">
              {tool}
            </Badge>
          ))}
          {overflow > 0 && (
            <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 text-muted-foreground">
              +{overflow} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// ─── view drawer ──────────────────────────────────────────────────────────────

function ViewDrawer({
  template,
  onClose,
  onEdit,
}: {
  template: VMTemplate | null;
  onClose: () => void;
  onEdit: (t: VMTemplate) => void;
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
              {/* base image */}
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

              {/* hardware */}
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

              {/* tools */}
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
                onClick={() => onEdit(t)}
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
  initial: FormFields;
  onClose: () => void;
  onSave: (fields: FormFields, id?: string) => void;
  editId?: string;
}

function FormDrawer({ mode, initial, onClose, onSave, editId }: FormDrawerProps) {
  const [fields, setFields] = useState<FormFields>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  // reset when mode/initial changes
  const open = mode !== null;

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    onSave(fields, editId);
    setSaving(false);
  }

  function handleClose() {
    setErrors({});
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-4 py-4 space-y-4">
            <FormField label="Name" required error={errors.name}>
              <Input
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Dev Standard"
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField label="Description" error={undefined}>
              <Textarea
                value={fields.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Short description of what this template is for…"
                rows={2}
              />
            </FormField>

            <FormField label="Base Image" required error={errors.baseImage}>
              <Input
                value={fields.baseImage}
                onChange={(e) => set("baseImage", e.target.value)}
                placeholder="e.g. ubuntu-22.04"
                aria-invalid={!!errors.baseImage}
                className="font-mono"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="vCPU" required error={errors.vCpu}>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={fields.vCpu}
                  onChange={(e) => set("vCpu", e.target.value)}
                  placeholder="4"
                  aria-invalid={!!errors.vCpu}
                />
              </FormField>

              <FormField label="Memory (GB)" required error={errors.memoryGb}>
                <Input
                  type="number"
                  min={1}
                  value={fields.memoryGb}
                  onChange={(e) => set("memoryGb", e.target.value)}
                  placeholder="16"
                  aria-invalid={!!errors.memoryGb}
                />
              </FormField>

              <FormField label="Disk (GB)" required error={errors.diskSizeGb}>
                <Input
                  type="number"
                  min={10}
                  value={fields.diskSizeGb}
                  onChange={(e) => set("diskSizeGb", e.target.value)}
                  placeholder="100"
                  aria-invalid={!!errors.diskSizeGb}
                />
              </FormField>
            </div>

            <FormField
              label="Preinstalled Tools"
              error={undefined}
            >
              <ToolsInput
                value={fields.preinstalledTools}
                onChange={(v) => set("preinstalledTools", v)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Press Enter or comma to add each tool.
              </p>
            </FormField>
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

  const formInitial = editTarget ? templateToForm(editTarget) : blankForm();

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

  function handleSave(fields: FormFields, id?: string) {
    const template: VMTemplate = {
      id: id ?? generateId(),
      name: fields.name.trim(),
      description: fields.description.trim(),
      baseImage: fields.baseImage.trim(),
      vCpu: Number(fields.vCpu),
      memoryGb: Number(fields.memoryGb),
      diskSizeGb: Number(fields.diskSizeGb),
      preinstalledTools: fields.preinstalledTools,
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
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1>Templates</h1>
            <p className="text-muted-foreground mt-0.5">
              VM templates available to developers when creating machines.
            </p>
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1.5 shrink-0">
            <Plus className="size-4" />
            Create Template
          </Button>
        </div>

        {/* grid */}
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
        initial={formInitial}
        editId={editTarget?.id}
        onClose={closeForm}
        onSave={handleSave}
      />
    </>
  );
}
