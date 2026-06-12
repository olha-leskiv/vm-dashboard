# Ascendra Workspaces

Developer machine management dashboard — take-home assignment for the Product Design Engineer role.

## Running locally

```bash
npm install
npm run dev
```

**Live preview:** [vm-dashboard-eight.vercel.app](https://vm-dashboard-eight.vercel.app/sign-in)

Or run locally and open [http://localhost:3000](http://localhost:3000). Choose a role on the sign-in page:

- **Engineer** — your personal machines (3 demo VMs)
- **Admin** — full fleet overview and management tools

No real auth. Role stored in a cookie; sign out returns to sign-in.

---

## Why Next.js

It's the framework I know best, and it fits the task well — API routes let me simulate a backend without a separate server, and the framework handles a lot of optimization out of the box: SSR components, prefetching, and parallel routing.

---

## UX thinking

I'm used to working from sparse briefs. Even so, before designing anything I researched the problem space:

- What VMs actually are and how they're used
- What engineers care about day-to-day
- What admins are responsible for

**Engineers** want to start working as fast as possible. The system is just an intermediate step between them and their IDE. Their access should be limited and their view frictionless — one page, no tabs, everything inline.

**Admins** need to keep the fleet healthy and reduce costs. I also assumed admins can be engineers too, so their dashboard includes an engineer-style view alongside fleet management tools.

---

## Key implementation decisions

**Parallel routing on the admin overview.** Each dashboard card (KPIs, cost, utilization, hot VMs, idle VMs) loads and fails independently. A slow chart doesn't block the rest of the page.

**Action Center on the admin overview.** Admins managing infrastructure expect a single place to see what needs their attention right now. The Action Center surfaces active alerts grouped by severity so nothing critical gets buried in the fleet table. This wasn't in the brief but felt like an obvious expectation for the persona.

**Cross-navigation links throughout.** Clicking a VM or user from any table takes you directly to their detail — no dead ends.

**Mock backend via Next.js API routes.** The client talks to real endpoints that import from `src/mocks/` and add simulated latency. Loading, error, and empty states work exactly as they would with a real backend.

---

## What's next

Missing pages need to be finished (Policies, VM time-series in the detail drawer).

The Fleet Utilization chart period selector (Real-time / Hour / Day / Week…) is wired to the UI but all periods render the same 24-hour mock dataset — the chart is not truly interactive over time. Real backend data per period would make this functional.

The admin dashboard needs a second pass — I'd re-evaluate each card and ask whether it actually earns its space.

Code cleanup and Storybook for component management would improve maintainability.

Known gaps: fleet utilization chart lack a full data table alternative for screen reader users; ARIA live regions for VM status changes are not yet implemented.

But the most important next step: **usability testing with real users.** Everything here is an assumption. I'd recruit 5 real engineers and admins, run task-based sessions, and follow up with short interviews. The design should be validated against actual behavior, not just good intentions.

---

## Accessibility

The app has been audited against WCAG 2.2 AA. Fixes applied:



---

## Stack


|               |                       |
| ------------- | --------------------- |
| Framework     | Next.js App Router    |
| Language      | TypeScript            |
| Styling       | Tailwind CSS v4       |
| Components    | shadcn/ui             |
| Data fetching | TanStack Query v5     |
| Charts        | Recharts v3           |
| Forms         | react-hook-form + Zod |


