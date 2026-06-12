import type { Alert } from "@/types";

// Pre-sorted: critical first (newest → oldest), then warnings (newest → oldest)
export const MOCK_ALERTS: Alert[] = [
  {
    id: "alt-001",
    severity: "critical",
    message: "VM entered error state",
    detail: "alice-ml-exp · vm-003",
    timestamp: "2025-06-10T11:57:00Z",
    relatedVmId: "vm-003",
    relatedUserId: "usr-001",
  },
  {
    id: "alt-002",
    severity: "critical",
    message: "CPU utilization at 97%",
    detail: "stefan-build-bot · vm-089",
    timestamp: "2025-06-10T11:49:00Z",
    relatedVmId: "vm-089",
  },
  {
    id: "alt-003",
    severity: "critical",
    message: "Disk usage at 96%",
    detail: "marco-data-proc · vm-142",
    timestamp: "2025-06-10T11:26:00Z",
    relatedVmId: "vm-142",
  },
  {
    id: "alt-004",
    severity: "warning",
    message: "Memory utilization at 91%",
    detail: "laura-api-svc · vm-067",
    timestamp: "2025-06-10T11:15:00Z",
    relatedVmId: "vm-067",
  },
  {
    id: "alt-005",
    severity: "warning",
    message: "VM idle for 22 days",
    detail: "igor-sandbox · vm-056",
    timestamp: "2025-06-10T10:00:00Z",
    relatedVmId: "vm-056",
  },
  {
    id: "alt-006",
    severity: "warning",
    message: "VM quota exceeded (5 of 3 allowed)",
    detail: "Priya Patel · usr-016",
    timestamp: "2025-06-10T08:12:00Z",
    relatedUserId: "usr-016",
  },
  {
    id: "alt-007",
    severity: "warning",
    message: "Projected cost nearing $45,000 threshold",
    detail: "Current projection: $43,200",
    timestamp: "2025-06-10T04:00:00Z",
  },
  {
    id: "alt-008",
    severity: "warning",
    message: "Deprecated template in use",
    detail: "kevin-frontend · tpl-v1-legacy",
    timestamp: "2025-06-09T14:30:00Z",
    relatedVmId: "vm-028",
  },
];
