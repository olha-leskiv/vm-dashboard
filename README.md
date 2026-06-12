# Ascendra Workspaces

Developer machine management dashboard — take-home assignment for the Product Design Engineer role.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll land on the sign-in page. Choose either role:

- **Sign in as Engineer** — shows your personal machines (3 VMs owned by the demo user)
- **Sign in as Admin** — shows the full fleet overview and all admin tools

No real auth is involved. Role is stored in a cookie; sign out returns you to the sign-in page.

---

## Part A — Product & UX thinking

### How I read the brief

The brief describes two fundamentally different jobs-to-be-done:

- **Developer**: "Is my machine running? Can I get to my IDE?" — high-frequency, low-breadth. They only care about their own 1–3 machines. Every extra screen is friction.
- **Admin**: "Is the fleet healthy? Are we wasting money?" — lower-frequency, high-breadth. They need to spot outliers (idle, hot, over-quota) across hundreds of machines and act on them.

These aren't the same tool. I separated them into distinct route groups with different layouts, navigation, and data scopes rather than trying to share screens with conditional visibility.

### Information architecture

```
/sign-in                        Role selector (demo auth)

/(developer)
  /developer/machines           My Machines — the developer's entire experience

/(admin)
  /admin/overview               Fleet dashboard (KPIs, utilization charts, hot/idle VM tables)
  /admin/machines               Full VM inventory — searchable, filterable
  /admin/fleet                  Fleet utilization drill-down
  /admin/templates              VM template management (create / edit / view)
  /admin/users                  User list + per-user detail
  /admin/policies               Placeholder (see "what's left")
  /admin/account                Account / sign-out
```

### Key decisions

**1. Parallel routes on the admin overview.**
The overview page uses Next.js `@slots` (parallel routes) so each widget — KPIs, cost, utilization chart, running-VM count, hot VMs, idle VMs — loads and fails independently. A slow chart doesn't block the cost widget. This is how real observability dashboards behave.

**2. Developer view = one page, zero tabs.**
Developers don't need navigation. Everything they care about (status, resources, controls, IDE link) is on their machine cards. A detail drawer slides in for deeper metadata without a page change.

**3. Lifecycle state machine in the card, not in a modal.**
Start / Stop / Restart / Cancel are inline on the card with proper disabled states, animated transitions, and an elapsed timer. This avoids "are you sure?" dialogs for low-stakes operations and makes state immediately visible.

**4. Idle VM surfacing on the admin overview.**
A VM last active more than 14 days ago appears in the "Idle VMs" table on the overview. This makes the cost-savings opportunity visible without making the admin dig into the full inventory.

**5. Mock backend through Next.js API routes, not MSW.**
Each API route imports from `src/mocks/` and calls `simulateDelay()`. The client never knows it's talking to a mock. This means loading, error, and empty states are exercised exactly as they would be with a real backend, and swapping to a real API is a one-file change per endpoint.

### Trade-offs I made

- **Breadth over per-feature depth.** I covered all core requirements for both personas at a working level rather than polishing one side to perfection.
- **No time-series sparklines on the developer side.** The VM detail drawer shows current utilization bars. The "usage over time" charts the brief asks for are missing — the Recharts + trend data infrastructure already exists on the admin side and could be reused, but I ran out of time.
- **Policies page is a stub.** It's listed as optional/stretch in the brief, so I scaffolded the route and left a placeholder. The `Policy` type and mock data are defined; the UI is not.
- **Auth is role-cookie, not real SSO.** The brief implies OAuth/SSO in production. The sign-in page notes this and the server action that sets the role cookie would be replaced by the real auth callback.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js App Router | Parallel routes, server components, and built-in API routes made the admin overview architecture clean |
| Language | TypeScript | Required by brief |
| Styling | Tailwind CSS v4 | Utility-first; works well with shadcn |
| Components | shadcn/ui + Base UI | Accessible primitives, dark mode ready, unstyled enough to customise |
| Data fetching | TanStack Query v5 | Suspense queries, smart refetch intervals, mutation + invalidation |
| Forms | react-hook-form + Zod | Used for template create/edit |
| Charts | Recharts v3 | Composable, SSR-compatible, good TypeScript support |
| Notifications | Sonner | Minimal toast library |
| Icons | lucide-react | Consistent icon set |
| Theme | next-themes | Dark mode toggle |

---

## Project structure

```
src/
  app/
    sign-in/                    # Role selector + server action
    (developer)/
      developer/machines/       # Developer machines page (server-prefetched)
    (admin)/
      admin/overview/           # Fleet dashboard with @slot parallel routes
        @kpis/                  # Top-line counts + utilization %
        @cost/                  # Cost summary (hourly / MTD / projected)
        @utilization/           # CPU + memory time-series chart
        @runningVms/            # Running VM count chart
        @hotVms/                # High-CPU VM table
        @idleVms/               # Idle VM table (>14 days inactive)
        @actionCenter/          # Actionable alert surface
      admin/fleet/              # Fleet utilization drill-down
      admin/machines/           # Full VM inventory
      admin/templates/          # Template CRUD
      admin/users/              # User list + [userId] detail
      admin/policies/           # Stub
    api/
      developer/machines/       # GET — VMs for current user
        [vmId]/restart/         # POST
        [vmId]/stop/            # POST
        [vmId]/cancel/          # POST
      admin/fleet/              # GET — FleetUtilization
      admin/vms/                # GET — all VMs
      admin/templates/          # GET — templates
      admin/alerts/             # GET — alerts

  types/
    index.ts                    # VM, VMStatus, VMTemplate, User, Policy,
                                #   FleetUtilization, Alert, ApiResponse<T>

  mocks/
    vms.ts                      # 257 VMs (184 running, 58 stopped, 15 starting)
    users.ts                    # 112 users (8 admins, 104 engineers)
    templates.ts                # 3 templates (small / medium / large)
    fleet.ts                    # Fleet stats + 24-hour utilization trend
    alerts.ts                   # Mock alert data

  lib/
    api/
      client.ts                 # apiFetch() — typed fetch wrapper + ApiError
      developer.ts              # getDeveloperMachines(), machine mutations
      admin.ts                  # getFleetOverview(), getAllVms(), getTemplates()
    query/
      keys.ts                   # Query key factory
      hooks.ts                  # useDeveloperMachines, useFleetOverview, etc.
      get-query-client.ts       # Singleton QueryClient for server/client boundary
    auth.ts                     # getAuthRole(), getAuthUser() — cookie readers
    auth-actions.ts             # signIn(), signOut() — server actions
    utils/
      delay.ts                  # simulateDelay() — random 300–800ms latency
      format.ts                 # formatPercent, formatRelativeTime, utilizationColor

  components/
    layout/
      sidebar.tsx               # Adaptive sidebar (developer vs admin nav)
      page-header.tsx           # Page title + optional action slot
    vms/
      vm-list.tsx               # MachinesList — React Query client component
      machine-card.tsx          # Full machine card with lifecycle controls
      vm-status-badge.tsx       # Status pill
    overview/
      utilization-chart.tsx     # Recharts dual-line CPU/memory time series
      running-vms-chart.tsx     # Area chart — running VM count over time
      utilization-distribution.tsx  # Distribution visualization
      hot-vms-table.tsx         # Top VMs by CPU
      idle-vms-table.tsx        # VMs inactive > 14 days
      fleet-status-card.tsx     # Summary stat card
      action-center.tsx         # Alert/action panel
    templates/
      templates-dashboard.tsx   # List + create/edit/view drawers
      template-card.tsx         # Template summary card
    vm-drawer.tsx               # Admin VM detail side-drawer
    providers.tsx               # QueryClientProvider + ThemeProvider
```

---

## Mock backend

All data lives in `src/mocks/`. API routes in `src/app/api/` import from there and call `simulateDelay()` before responding. No external server is needed.

Each response follows the same envelope:

```ts
{ data: T, meta: { timestamp: string, count?: number } }
```

### Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/api/developer/machines` | `ApiResponse<VM[]>` — current user's VMs |
| POST | `/api/developer/machines/[vmId]/restart` | `ApiResponse<VM>` |
| POST | `/api/developer/machines/[vmId]/stop` | `ApiResponse<VM>` |
| POST | `/api/developer/machines/[vmId]/cancel` | `ApiResponse<VM>` |
| GET | `/api/admin/fleet` | `ApiResponse<FleetUtilization>` |
| GET | `/api/admin/vms` | `ApiResponse<VM[]>` — all VMs |
| GET | `/api/admin/templates` | `ApiResponse<VMTemplate[]>` |
| GET | `/api/admin/alerts` | `ApiResponse<Alert[]>` |

---

## What I'd do with more time

**High priority (core gaps):**
- **Developer VM time-series charts.** The brief asks for CPU and memory over time on the VM detail. The infrastructure (Recharts, trend data shape) already exists on the admin side — I'd add per-VM sparklines in the detail drawer.
- **Policies page.** The `Policy` type and mock data are defined; I'd build the list + create/edit form using the same pattern as Templates.
- **Start VM endpoint.** The current "Start" button reuses the restart mutation. A real product would have a separate start endpoint that provisions a new VM vs restarting an existing one.

**Medium priority:**
- Real-time updates — extend the 3s polling (currently only active during state transitions) to live-refresh utilization numbers fleet-wide.
- Admin VM detail drill-down with per-VM historical metrics and activity log.
- Proper error recovery — retry buttons on all error states (some parallel route error boundaries just show a message).

**Lower priority / polish:**
- Formal WCAG 2.2 audit — shadcn handles most of it but focus order and ARIA roles on the charts need a pass.
- Empty states for the developer view (first-time user with no VMs).
- Responsive layout testing at mobile breakpoints — the admin tables need horizontal scroll handling.
- E2E tests (Playwright) for the sign-in flow and lifecycle state machine.
