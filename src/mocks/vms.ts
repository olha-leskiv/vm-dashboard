import type { VM, VMStatus } from "@/types";
import { MOCK_USERS } from "./users";

const REGIONS = ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"];
const TEMPLATES = ["tpl-small", "tpl-medium", "tpl-large"];
const HOURLY_COSTS: Record<string, number> = {
  "tpl-small": 0.09,
  "tpl-medium": 0.24,
  "tpl-large": 0.64,
};
const VM_NAME_SUFFIXES = [
  "dev-main", "api-svc", "ml-exp", "frontend", "backend",
  "staging", "build-bot", "test-env", "analytics", "infra-tools",
  "data-proc", "sandbox", "preview", "compiler", "research",
];

function pad(n: number, digits = 3): string {
  return String(n).padStart(digits, "0");
}

function isoHoursAgo(hoursAgo: number): string {
  const d = new Date("2025-06-10T12:00:00Z");
  d.setTime(d.getTime() - hoursAgo * 3_600_000);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function isoDaysAgo(daysAgo: number): string {
  return isoHoursAgo(daysAgo * 24);
}

function genVms(): VM[] {
  // Build a flat owner-id list matching each user's vmCount (total = 257)
  const ownerIds: string[] = [];
  for (const user of MOCK_USERS) {
    for (let v = 0; v < user.vmCount; v++) ownerIds.push(user.id);
  }

  const userById = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  return ownerIds.map((ownerId, i) => {
    const vmNum = i + 1;
    const userFirstName = userById[ownerId].name.split(" ")[0].toLowerCase();
    const nameSuffix = VM_NAME_SUFFIXES[i % VM_NAME_SUFFIXES.length];
    const templateId = TEMPLATES[i % 3];
    const region = REGIONS[i % 4];
    const hourlyCost = HOURLY_COSTS[templateId];

    // Status buckets: 0-183 running, 184-241 stopped, 242-256 starting
    let status: VMStatus;
    let cpuUsagePercent: number;
    let memoryUsagePercent: number;
    let startedAt: string | null;
    let lastActiveAt: string;

    if (i < 184) {
      status = "running";
      // Pseudo-random CPU 5–95% cycling through all values (17 is coprime to 91)
      cpuUsagePercent = ((i * 17 + 13) % 91) + 5;
      memoryUsagePercent = Math.min(95, Math.max(10, Math.round(cpuUsagePercent * 0.85 + (i * 7 % 15) - 5)));
      startedAt = isoHoursAgo((i * 3 + 1) % 47 + 1);
      lastActiveAt = isoHoursAgo(i % 3);
    } else if (i < 242) {
      status = "stopped";
      cpuUsagePercent = 0;
      memoryUsagePercent = 0;
      startedAt = null;
      lastActiveAt = isoHoursAgo((i * 5) % 120 + 24);
    } else {
      status = "starting";
      cpuUsagePercent = (i * 3) % 7 + 2;
      memoryUsagePercent = (i * 5) % 12 + 5;
      startedAt = null;
      lastActiveAt = isoHoursAgo(1);
    }

    const diskUsagePercent = (i * 11 + 7) % 70 + 10;
    const daysAgo = (i * 7 + 30) % 365 + 1;

    return {
      id: `vm-${pad(vmNum)}`,
      name: `${userFirstName}-${nameSuffix}`,
      ownerId,
      templateId,
      status,
      region,
      createdAt: isoDaysAgo(daysAgo),
      startedAt,
      lastActiveAt,
      cpuUsagePercent,
      memoryUsagePercent,
      diskUsagePercent,
      hourlyCost,
    };
  });
}

export const MOCK_VMS = genVms();
