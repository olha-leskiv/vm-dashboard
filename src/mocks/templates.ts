import type { VMTemplate } from "@/types";

export const MOCK_TEMPLATES: VMTemplate[] = [
  {
    id: "tpl-small",
    name: "Dev Starter",
    description: "Lightweight environment for frontend and scripting work.",
    baseImage: "ubuntu-22.04",
    vCpu: 2,
    memoryGb: 4,
    diskSizeGb: 50,
    preinstalledTools: ["vscode-server", "node", "git"],
  },
  {
    id: "tpl-medium",
    name: "Dev Standard",
    description: "General-purpose environment with Docker and build tooling.",
    baseImage: "ubuntu-22.04",
    vCpu: 4,
    memoryGb: 16,
    diskSizeGb: 100,
    preinstalledTools: ["vscode-server", "node", "docker", "git", "python3"],
  },
  {
    id: "tpl-large",
    name: "Dev Power",
    description: "High-memory environment for ML, large builds, and databases.",
    baseImage: "ubuntu-22.04",
    vCpu: 8,
    memoryGb: 32,
    diskSizeGb: 200,
    preinstalledTools: ["vscode-server", "node", "docker", "git", "python3", "cuda-toolkit"],
  },
];
