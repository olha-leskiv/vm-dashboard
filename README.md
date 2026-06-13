# Ascendra Workspaces

Virtual machine management dashboard.

<img width="950" height="494" alt="image" src="https://github.com/user-attachments/assets/18d18187-679a-428d-959b-ee4971cf9666" />

## Running locally

```bash
npm install
npm run dev
```

**Live preview:** [vm-dashboard-eight.vercel.app](https://vm-dashboard-eight.vercel.app/sign-in)

Or run locally and open [http://localhost:3000](http://localhost:3000). Choose a role on the sign-in page:

- **Engineer** — your personal machines
- **Admin** — full fleet overview and management tools

No real auth right now. Role stored in a cookie; sign out returns to sign-in.

---

## Why Next.js

It's the framework I know best, and it fits the task well — API routes let me simulate a backend without a separate server, and the framework handles a lot of optimization out of the box: SSR components, prefetching, and parallel routing.

---

## UX Thinking & Assumptions

I'm used to working from sparse briefs, so before designing anything I spent time understanding the domain and the people using the system.

I started by researching:

- What virtual machines are and how they're typically used
- The day-to-day workflow of software engineers
- The responsibilities of DevOps and DevEx administrators
- Common infrastructure management dashboards and the information they surface

Figma research board with a couple of references:
https://www.figma.com/board/9Se0qBrXQj5EXnhRPA5eDe/Untitled?node-id=0-1&t=uhJrmffSqenqEicf-1

### Engineer persona

My main takeaway was that engineers don't use this system for its own sake. Their goal is to get into a working environment as quickly as possible and start building software.

The dashboard is therefore a short step between the engineer and their IDE. Because of that, I intentionally kept the experience focused on a small number of tasks:

- Seeing their machines and current status
- Understanding whether a machine is healthy and available
- Starting, stopping, or restarting a machine
- Opening their development environment

I assumed engineers should not be responsible for infrastructure configuration, templates, quotas, or policies. Those concerns belong to platform administrators rather than end users.

### Admin persona

Admins have a fundamentally different job.

Their primary responsibility is maintaining a healthy, cost-efficient infrastructure while ensuring engineers have the resources they need. They care less about a single VM and more about the overall fleet.

The questions I expected admins to ask are:

- How many machines are running right now?
- Are resources being overutilized?
- Are resources being wasted?
- Which machines require attention?
- What is the infrastructure costing us?

This led me to prioritize fleet health, utilization, idle resources, and cost visibility throughout the admin experience.

### Assumptions

Several important product decisions were not explicitly defined in the brief, so I made a number of assumptions to create a coherent experience:

- Engineers manage and use machines but do not manage templates, policies, or quotas.
- Admins can also act as engineers when needed and may occasionally need access to developer workflows.
- Fleet-wide visibility, utilization, and cost monitoring are higher-priority admin concerns than deep analytics for individual machines.
- Operational issues should be surfaced proactively, which led to the addition of an Action Center on the admin dashboard.
- The admin and engineer experiences should be clearly separated because their goals, workflows, and information needs are significantly different.

Rather than attempting to support every possible interpretation of the brief, I documented these assumptions and optimized for clarity and usability.

## What I'd validate with real users

Everything above is an assumption. The most important next step would be recruiting 5 real engineers and admins, running task-based sessions, and following up with short interviews. The design should be validated against actual behavior, not just good intentions.

---

## Key implementation decisions

**Parallel routing on the admin overview.** Each dashboard card (KPIs, cost, utilization, hot VMs, idle VMs) loads and fails independently. A slow chart doesn't block the rest of the page.

**Action Center on the admin overview.** Admins managing infrastructure expect a single place to see what needs their attention right now. The Action Center surfaces active alerts grouped by severity so nothing critical gets buried in the fleet table. This wasn't explicitly requested in the brief, but emerged naturally from the responsibilities of the admin persona during the discovery phase.

**Cross-navigation links throughout.** Clicking a VM or user from any table takes you directly to their detail — no dead ends.

**Mock backend via Next.js API routes.** The client talks to real endpoints that import from `src/mocks/` and add simulated latency. Loading, error, and empty states work exactly as they would with a real backend.

---

## What's next

Missing pages need to be finished (Policies, VM time-series in the detail drawer).

Authentication is currently a role cookie with no real identity layer. A production system would replace the sign-in action with OAuth or SSO, and derive role and permissions from the identity provider.

The Fleet Utilization chart period selector (Real-time / Hour / Day / Week…) is wired to the UI but all periods render the same 24-hour mock dataset — the chart is not truly interactive over time. Real backend data per period would make this functional.

The admin dashboard needs a second pass — I'd re-evaluate each card and ask whether it actually earns its space.

Code cleanup and Storybook for component management would improve maintainability.

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
