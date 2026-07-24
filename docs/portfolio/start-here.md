# Start Here — Software Rescue, Integrations, and Product Planning

I am Wang Ke, a technical generalist focused on bounded software rescue, webhook and API reliability, AI workflow review, and implementation-ready product planning.

This page is designed for a fast evidence review. It separates actual code work from public hypothetical planning samples and proposes small paid starting points rather than vague long-term commitments.

## Best-fit problems

### An inherited or neglected SaaS needs stabilization

Useful when a previous developer is unavailable, the deployment path is unclear, customer-facing defects are accumulating, or the owner needs an evidence-based repair plan before committing more money.

Start with the [Astuto Webhook Rescue Case Study](../case-studies/astuto-webhook-rescue.md). It documents an actual public codebase rescue covering webhook correctness, header parsing, SSRF and redirect risk, network timeouts, unsafe default credentials, focused tests, CI, and deployment verification.

### A webhook or integration path is unreliable

Useful when duplicate delivery, replay, malformed payloads, partial success, retry storms, or weak observability can create incorrect downstream state.

Review the [runnable secure Next.js webhook receiver](../../examples/secure-nextjs-webhook-receiver/README.md) and the companion [technical article](./secure-nextjs-webhook-receiver.md). The implementation includes HMAC verification, replay-window checks, payload limits, event validation, idempotency and queue boundaries, focused tests, type checking, and a production build.

### An AI automation works in a demo but is not operationally trustworthy

Useful when an LLM or multi-step workflow needs clearer failure handling, human review, data boundaries, monitoring, replay, or cost controls.

Review the [AI Workflow Reliability Assessment](./ai-workflow-reliability-assessment-sample.md). This is a public hypothetical exercise, not a client claim. It covers stable event identity, partial success, retries, terminal failure recovery, structured LLM outputs, confidence thresholds, human review, data handling, observability, tests, rollout, and GO / CONDITIONAL GO / NO-GO gates.

### A feature is too ambiguous to hand to engineering

Useful for multi-role, multi-tenant, booking, payment, cancellation, notification, permission, or lifecycle-heavy product areas.

Review the [Multi-Tenant Club Booking Waitlist planning sample](./multitenant-club-booking-waitlist-planning-sample.md). This is a public hypothetical exercise showing policy decisions, state transitions, edge cases, API boundaries, implementation tickets, acceptance criteria, rollout, metrics, and unresolved decisions.

## Bounded paid starting points

### Technical assessment — USD 199–399

A read-only or non-production review with a written time cap. Typical outputs:

- verified facts and unsupported assumptions;
- reproducible defects or failure paths;
- security and reliability observations within the agreed scope;
- risk register and prioritized repair plan;
- effort ranges and dependencies;
- GO / CONDITIONAL GO / NO-GO recommendation.

### Seven-day rescue sprint — USD 800–2,000

One explicitly defined repair or stabilization objective. Examples include a webhook defect, broken deployment path, unsafe default, recurring integration failure, missing focused tests, or one bounded product workflow.

The sprint requires written scope, acceptance criteria, access boundaries, a change cap, and a rollback or handover plan.

### Planning or automation trial — 3–5 paid hours

A small task used to evaluate actual work before a larger contract. Deliverables can include:

- workflow and state model;
- decision log and open questions;
- risk and failure matrix;
- implementation-ready tickets;
- observable acceptance criteria;
- test and rollout plan.

### Ongoing maintenance — USD 300–800/month

Available only after the system, support burden, response windows, access, and included work are understood. No unlimited support or undefined production on-call commitment.

## Working rules

- Written scope, price, time cap, deliverables, and acceptance criteria before work starts.
- Read-only or non-production access first when practical.
- No passwords, production secrets, regulated customer data, or one-time codes sent by email.
- No claim of legal, security, healthcare, privacy, or regulatory compliance without appropriate evidence and qualified review.
- No guarantee of revenue growth, churn reduction, or production safety before the relevant system and data are inspected.
- Changes should be understandable, tested, reviewable, and reversible.

## Evidence index

- [Astuto Webhook Rescue Case Study](../case-studies/astuto-webhook-rescue.md) — actual public codebase rescue.
- [Runnable secure Next.js webhook receiver](../../examples/secure-nextjs-webhook-receiver/README.md) — actual public implementation and CI evidence.
- [Secure webhook technical article](./secure-nextjs-webhook-receiver.md) — technical communication sample.
- [AI Workflow Reliability Assessment](./ai-workflow-reliability-assessment-sample.md) — public hypothetical assessment sample.
- [Multi-Tenant Club Booking Waitlist](./multitenant-club-booking-waitlist-planning-sample.md) — public hypothetical product-planning sample.
- [Technical Rescue Assessment Template](../services/technical-rescue-assessment-template.md) — reusable assessment structure.

## Truth boundary

This repository is an unofficial maintenance and portfolio demonstration. It does not claim affiliation with the original Astuto maintainers, ownership of the original product, confidential client work, an established commercial SaaS user base, or certification of any system for production or regulatory use.

For a scoped trial or assessment, use the application, marketplace, or outreach thread that provided this page. Do not send secrets or customer data in the first message.
