# Ascendra Workspaces

Developer machine management dashboard — take-home assignment.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Component library | shadcn/ui |
| Data fetching | TanStack Query v5 |
| Linting | ESLint (Next.js config) |
| Formatting | Prettier + prettier-plugin-tailwindcss |

## Project structure

```
src/
  app/
    api/                     # Mock backend — Next.js Route Handlers
      developer/machines/    # GET /api/developer/machines
      admin/fleet/           # GET /api/admin/fleet
      admin/vms/             # GET /api/admin/vms
      admin/templates/       # GET /api/admin/templates
  types/
    index.ts                 # All domain types (VM, VMTemplate, User, Policy, FleetUtilization)
  mocks/
    users.ts                 # 3 users (2 engineers, 1 admin)
    templates.ts             # 3 VM templates (small / medium / large)
    vms.ts                   # 7 VMs across 3 owners, mixed statuses
    fleet.ts                 # Fleet-wide utilization with 24h trend data
  lib/
    api/
      client.ts              # apiFetch() — typed fetch wrapper with error handling
      developer.ts           # getDeveloperMachines()
      admin.ts               # getFleetOverview(), getAllVms(), getTemplates()
    utils/
      delay.ts               # simulateDelay() — artificial network latency
    utils.ts                 # cn() helper (from shadcn)
```

## Mock backend

All data lives in `src/mocks/`. The API routes in `src/app/api/` serve that data via Next.js Route Handlers — no external server needed.

Each route:
1. Calls `simulateDelay()` to add 500–1000ms of artificial latency
2. Returns `{ data, meta: { timestamp, count? } }` — a consistent envelope for future extensibility

### Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/api/developer/machines` | `ApiResponse<VM[]>` — VMs owned by the current user |
| GET | `/api/admin/fleet` | `ApiResponse<FleetUtilization>` — aggregate metrics + 24h trend |
| GET | `/api/admin/vms` | `ApiResponse<VM[]>` — all VMs across all users |
| GET | `/api/admin/templates` | `ApiResponse<VMTemplate[]>` — available VM templates |

The current user is hardcoded to `CURRENT_USER_ID = "usr-001"` (Alice Chen) in `src/mocks/users.ts`.

## Environment variables

Copy `.env.example` to `.env.local` (already done):

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## What's next

- [ ] Route groups `(developer)` and `(admin)` with layouts and navigation
- [ ] `Providers` wrapper for TanStack Query (`QueryClientProvider`)
- [ ] Query key factory (`src/lib/query/keys.ts`)
- [ ] `useSuspenseQuery` hooks for each endpoint
- [ ] Server-side prefetching with `HydrationBoundary` in page components
- [ ] Developer view: My Machines list, VM detail, lifecycle controls
- [ ] Admin view: Fleet overview, VM inventory, utilization charts, templates
