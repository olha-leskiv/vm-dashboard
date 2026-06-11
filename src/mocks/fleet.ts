import type { FleetUtilization } from "@/types";
import { MOCK_VMS } from "./vms";
import { MOCK_USERS } from "./users";

const UTILIZATION_TREND: FleetUtilization["utilizationTrend"] = [
  { timestamp: "2025-06-09T12:00:00Z", cpuPercent: 48, memoryPercent: 52, runningVms: 162 },
  { timestamp: "2025-06-09T13:00:00Z", cpuPercent: 52, memoryPercent: 55, runningVms: 168 },
  { timestamp: "2025-06-09T14:00:00Z", cpuPercent: 55, memoryPercent: 58, runningVms: 174 },
  { timestamp: "2025-06-09T15:00:00Z", cpuPercent: 57, memoryPercent: 59, runningVms: 179 },
  { timestamp: "2025-06-09T16:00:00Z", cpuPercent: 56, memoryPercent: 58, runningVms: 176 },
  { timestamp: "2025-06-09T17:00:00Z", cpuPercent: 53, memoryPercent: 56, runningVms: 171 },
  { timestamp: "2025-06-09T18:00:00Z", cpuPercent: 46, memoryPercent: 51, runningVms: 157 },
  { timestamp: "2025-06-09T19:00:00Z", cpuPercent: 41, memoryPercent: 47, runningVms: 144 },
  { timestamp: "2025-06-09T20:00:00Z", cpuPercent: 37, memoryPercent: 44, runningVms: 134 },
  { timestamp: "2025-06-09T21:00:00Z", cpuPercent: 34, memoryPercent: 41, runningVms: 127 },
  { timestamp: "2025-06-09T22:00:00Z", cpuPercent: 32, memoryPercent: 39, runningVms: 121 },
  { timestamp: "2025-06-09T23:00:00Z", cpuPercent: 30, memoryPercent: 37, runningVms: 116 },
  { timestamp: "2025-06-10T00:00:00Z", cpuPercent: 28, memoryPercent: 35, runningVms: 112 },
  { timestamp: "2025-06-10T01:00:00Z", cpuPercent: 27, memoryPercent: 34, runningVms: 110 },
  { timestamp: "2025-06-10T02:00:00Z", cpuPercent: 27, memoryPercent: 34, runningVms: 110 },
  { timestamp: "2025-06-10T03:00:00Z", cpuPercent: 26, memoryPercent: 33, runningVms: 108 },
  { timestamp: "2025-06-10T04:00:00Z", cpuPercent: 27, memoryPercent: 34, runningVms: 111 },
  { timestamp: "2025-06-10T05:00:00Z", cpuPercent: 30, memoryPercent: 37, runningVms: 118 },
  { timestamp: "2025-06-10T06:00:00Z", cpuPercent: 35, memoryPercent: 42, runningVms: 130 },
  { timestamp: "2025-06-10T07:00:00Z", cpuPercent: 40, memoryPercent: 46, runningVms: 143 },
  { timestamp: "2025-06-10T08:00:00Z", cpuPercent: 45, memoryPercent: 50, runningVms: 157 },
  { timestamp: "2025-06-10T09:00:00Z", cpuPercent: 49, memoryPercent: 53, runningVms: 167 },
  { timestamp: "2025-06-10T10:00:00Z", cpuPercent: 51, memoryPercent: 55, runningVms: 172 },
  { timestamp: "2025-06-10T11:00:00Z", cpuPercent: 50, memoryPercent: 54, runningVms: 184 },
];

// Compute fleet stats from the generated VM data
const runningVms = MOCK_VMS.filter((v) => v.status === "running");
const avgCpu = Math.round(runningVms.reduce((s, v) => s + v.cpuUsagePercent, 0) / runningVms.length);
const peakCpu = runningVms.reduce((m, v) => Math.max(m, v.cpuUsagePercent), 0);
const avgMem = Math.round(runningVms.reduce((s, v) => s + v.memoryUsagePercent, 0) / runningVms.length);
const peakMem = runningVms.reduce((m, v) => Math.max(m, v.memoryUsagePercent), 0);
const totalHourlyCost = Math.round(runningVms.reduce((s, v) => s + v.hourlyCost, 0) * 100) / 100;

export const MOCK_FLEET_UTILIZATION: FleetUtilization = {
  period: "last-24-hours",
  totalVms: MOCK_VMS.length,
  runningVms: runningVms.length,
  stoppedVms: MOCK_VMS.filter((v) => v.status === "stopped").length,
  totalUsers: MOCK_USERS.length,
  avgCpuUtilizationPercent: avgCpu,
  peakCpuUtilizationPercent: peakCpu,
  avgMemoryUtilizationPercent: avgMem,
  peakMemoryUtilizationPercent: peakMem,
  totalHourlyCost,
  monthToDateCost: Math.round(totalHourlyCost * 24 * 10 * 100) / 100,
  projectedMonthlyCost: Math.round(totalHourlyCost * 24 * 30 * 100) / 100,
  utilizationTrend: UTILIZATION_TREND,
  vmMetrics: MOCK_VMS.map((vm) => ({
    vmId: vm.id,
    cpuPercent: vm.cpuUsagePercent,
    memoryPercent: vm.memoryUsagePercent,
    diskPercent: vm.diskUsagePercent,
    status: vm.status,
  })),
};
