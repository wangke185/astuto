# Software Project Rescue

A bounded technical service for small SaaS products, internal tools, and abandoned or unstable codebases.

The objective is not to promise a full rewrite before the problem is understood. The objective is to establish a reproducible baseline, identify the highest-risk defects, define a commercial repair scope, and deliver verifiable improvements.

## Best fit

This service is designed for founders or small teams with one or more of the following problems:

- the product cannot be deployed reliably;
- a critical workflow such as billing, authentication, email, webhooks, or background jobs is unstable;
- cloud or API costs are unclear or increasing;
- the original developer is unavailable;
- the codebase has little test coverage and changes frequently break production;
- a buyer, investor, or partner requires technical diligence before a transaction;
- an internal tool has real users but is not ready to become a supported SaaS product.

It is not a fit for an undefined idea, an unpaid full rebuild, or a project where the owner cannot prove authority over the source code and infrastructure.

## Service 1 — Technical Rescue Assessment

**Typical fee:** USD 199–399

**Typical duration:** 2–4 working days after access is available

**Inputs required:**

- read-only repository access or a source archive;
- setup and deployment instructions, if they exist;
- non-production credentials or a controlled test environment;
- a short description of the business-critical workflows;
- written confirmation that the client is authorized to provide the code and access.

**Deliverables:**

1. reproducibility result: what can and cannot be built or run;
2. architecture and dependency summary;
3. prioritized defect and risk register;
4. security, deployment, and operational observations within the agreed scope;
5. cost and maintenance observations where evidence is available;
6. recommended 7-day rescue scope with exclusions and acceptance criteria;
7. go / no-go recommendation for further work.

The assessment is evidence-led. Findings are tied to code paths, build output, tests, logs, configuration, or documented assumptions.

## Service 2 — Seven-Day Rescue Sprint

**Typical fee:** USD 800–2,000

**Payment:** normally 50% before work starts and 50% after the agreed acceptance tests pass

The sprint addresses one bounded business-critical problem. Examples:

- restore a broken deployment pipeline;
- repair payment or subscription logic;
- harden a webhook or external integration;
- remove unsafe default credentials;
- add focused regression tests around a critical workflow;
- reduce a documented infrastructure or API cost driver;
- prepare a reproducible technical baseline for handover or acquisition.

**Deliverables:**

- isolated repair branch or pull request;
- focused tests for the changed behavior;
- regression and build results;
- deployment or migration notes;
- risk and limitation statement;
- final acceptance checklist.

A sprint does not include an unlimited rewrite, broad feature development, production data migration, or ongoing support unless those items are explicitly priced and written into the scope.

## Service 3 — Maintenance Retainer

**Typical fee:** USD 300–800 per month

Available only after an assessment or rescue sprint has established a reproducible baseline.

Possible scope:

- dependency and security maintenance;
- small bug fixes;
- CI and deployment health checks;
- incident triage;
- monthly technical risk summary;
- limited engineering hours with explicit rollover and response rules.

## Working method

1. **Authority check** — confirm code, domain, account, and data access authority.
2. **Scope freeze** — define the problem, exclusions, evidence, and acceptance tests.
3. **Access minimization** — use read-only or non-production access first.
4. **Reproduce before changing** — establish the current behavior and failure mode.
5. **Focused repair** — make the smallest change that satisfies the agreed outcome.
6. **Verification** — run focused tests, regression tests, and a production-style build where feasible.
7. **Handover** — provide code, test evidence, operational notes, and known limitations.

## Engagement documents

- [Client Intake Checklist](./client-intake-checklist.md) — authority, business evidence, access, scope, and acquisition checks before work starts.
- [Technical Rescue Assessment Template](./technical-rescue-assessment-template.md) — minimum evidence and report structure for a paid assessment.
- [Technical Rescue Statement of Work Template](./technical-rescue-sow-template.md) — scope, exclusions, deliverables, payment milestones, change control, and handover terms.

The statement-of-work template is an operational starting point and not jurisdiction-specific legal advice. A signed engagement should receive appropriate legal review where required.

## Example case

The [Astuto webhook rescue case study](../case-studies/astuto-webhook-rescue.md) documents a bounded maintenance exercise on an abandoned open-source SaaS codebase. The work identified and corrected HTTP method handling, header parsing, webhook target validation, redirect handling, network timeouts, unsafe default credentials, and missing job-level tests. Focused CI, the original test suite, and a production Docker build were used as verification evidence.

This case is a maintenance demonstration, not a claim of affiliation with the original Astuto project and not a complete security audit.

## Initial inquiry

Send the following to **wangke1830125915@gmail.com**:

- product or repository link;
- current business status and number of real users;
- the single most expensive or urgent technical problem;
- technology stack;
- whether the product currently builds and deploys;
- who controls the code, domain, cloud accounts, database, and payment account;
- desired outcome and deadline.

No production password, API secret, private key, one-time code, or customer dataset should be sent by email.