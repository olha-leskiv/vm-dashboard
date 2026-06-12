export const queryKeys = {
  developer: {
    machines: () => ["developer", "machines"] as const,
  },
  vms: {
    metrics: (vmId: string) => ["vms", vmId, "metrics"] as const,
  },
  admin: {
    fleet: () => ["admin", "fleet"] as const,
    vms: () => ["admin", "vms"] as const,
    templates: () => ["admin", "templates"] as const,
  },
} as const;
