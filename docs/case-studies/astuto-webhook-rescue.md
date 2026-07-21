# Astuto Webhook Rescue Case Study

## Executive summary

Astuto is an open-source, self-hosted customer-feedback application built with Ruby on Rails, React, PostgreSQL, Docker, Sidekiq, Stripe, OAuth, REST APIs, and configurable outbound webhooks. The upstream project is no longer maintained.

This rescue exercise tested whether an unfamiliar, non-trivial software project could be assessed, repaired, and validated without rewriting the product. The work focused on a narrow production-critical surface: webhook execution and initial deployment credentials.

The result was a bounded rescue patch that:

- restored correct POST, PUT, PATCH, and DELETE webhook behavior;
- prevented custom request headers from failing after database decryption;
- blocked webhook targets that resolve to loopback, private, link-local, multicast, or reserved networks;
- disabled redirect following and added a request timeout;
- replaced the universal bootstrap password with an environment-provided or per-installation generated password;
- added focused job-level and security tests;
- passed both the focused rescue workflow and the repository's original full test workflow.

This was a technical rescue case, not a recommendation to relaunch Astuto as a commercial product.

## Why this project was selected

Astuto was suitable as a rescue sample because it had:

- a real multi-module codebase rather than a tutorial application;
- authentication, authorization, multitenancy, billing, background jobs, APIs, webhooks, and container deployment;
- visible maintenance history and unresolved operational risk;
- an open-source license that permits study and modification subject to its terms;
- a clear upstream statement that the project had reached end of life.

It was not selected as an acquisition target. The original maintainer disclosed weak commercial traction and a saturated customer-feedback market, so the rational objective was to prove rescue capability rather than invest in relaunching the product.

## Initial assessment

### Product surface reviewed

The audit mapped the following paths:

- tenant selection and multitenancy;
- user authentication and role authorization;
- board, post, comment, vote, and moderation flows;
- billing and Stripe webhook handling;
- outbound application webhooks;
- Docker bootstrap and database seeding;
- existing RSpec and GitHub Actions coverage.

### Prioritization rule

Issues were ranked by operational impact:

- **P0:** security exposure, data exposure, or system-wide failure;
- **P1:** core feature gives incorrect results or fails for normal configuration;
- **P2:** reliability, maintainability, or performance weakness;
- **P3:** cosmetic or low-value improvement.

The rescue patch deliberately avoided unrelated dependency upgrades and UI refactors.

## Findings

### 1. Configured HTTP methods were not preserved

Webhook methods were stored by Rails enums as strings such as `http_put`. The execution job compared those values against symbols such as `:http_put`. The comparison failed and the default branch silently selected POST.

**Impact:** a webhook configured as PUT, PATCH, or DELETE could be sent as POST, producing incorrect integrations while the UI appeared correctly configured.

**Fix:** replace the symbol-based `case` statement with an explicit immutable mapping from stored enum strings to HTTParty method symbols, and raise on unsupported values instead of silently falling back.

### 2. Decrypted headers could be parsed twice

The model encrypted the header configuration before persistence and decrypted it into a Ruby array after loading. The execution job then attempted to run `JSON.parse` again.

**Impact:** a webhook with custom headers, including common Authorization headers, could fail at runtime even though a headerless webhook worked.

**Fix:** normalize both supported representations: JSON strings and already-decrypted arrays. Invalid or incomplete header entries now fail explicitly.

### 3. Outbound webhook targets were insufficiently restricted

The application accepted arbitrary HTTP and HTTPS destinations and issued server-side requests. No effective control prevented requests to loopback, private, link-local, multicast, reserved, or cloud metadata networks.

**Impact:** in a multitenant deployment, a tenant administrator could potentially use outbound webhook execution to probe or access services reachable from the application server.

**Fix:** validate the fully rendered URL immediately before execution, resolve all addresses, reject blocked IPv4 and IPv6 ranges, reject embedded credentials, disable redirects, and impose a finite timeout.

The validator compares IPv4 addresses only against IPv4 ranges and IPv6 addresses only against IPv6 ranges. This matters under the project's Ruby 3.0 runtime, where mixed-family `IPAddr` comparisons can produce incorrect classification.

### 4. Every fresh deployment shared a public default password

Database seeding created the same owner credentials for all new instances. The credentials were also documented publicly.

**Impact:** deployments that were exposed before the operator changed the password could be accessed using known credentials.

**Fix:** allow the operator to supply `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD`. When no password is provided, generate a unique high-entropy password and print it once during initial seeding. Existing databases and credentials are not modified.

### 5. Existing tests did not execute the affected behavior

The prior Webhook tests verified validations and enum membership, but did not test the background job that renders and sends the request.

**Impact:** the method mismatch and double-parsing defects could remain undetected while the model test suite stayed green.

**Fix:** add job-level tests covering method selection, decrypted array headers, JSON-encoded headers, timeout and redirect options, and unsupported methods. Add isolated target-validation tests for public, private, loopback, link-local, invalid-scheme, and credential-bearing URLs.

## Validation process

The rescue branch used two independent GitHub Actions paths:

1. a focused rescue workflow that installs the pinned Ruby and JavaScript dependencies, creates a PostgreSQL test database, and runs the new Webhook tests plus the existing Webhook model tests;
2. the repository's original workflow, including production Docker image construction and the complete existing test suite.

The first focused execution failed. The failure exposed an address-family compatibility defect in the initial target validator. The implementation was corrected rather than suppressing the test. After the correction:

- focused Webhook workflow: **passed**;
- original complete workflow: **passed**;
- production Docker image build: **passed**;
- PostgreSQL test database preparation: **passed**.

## Before and after

| Area | Before | After |
|---|---|---|
| HTTP method | Non-POST methods could silently become POST | Configured method preserved; unknown values rejected |
| Custom headers | Could be parsed twice and fail | String and decrypted-array forms normalized |
| Target security | Any formatted HTTP/HTTPS URL accepted | Rendered destination checked against blocked networks |
| Redirects | Could follow to a different destination | Redirect following disabled |
| Network reliability | No bounded webhook timeout | Ten-second request timeout |
| Initial owner password | Universal public password | Operator-defined or per-installation random password |
| Test coverage | Primarily model validation | Job behavior and target-security tests |

## Commercial decision

The codebase was technically rescuable, but the project was not selected for commercial relaunch. The upstream maintainer reported minimal paid traction and identified a crowded market with stronger active alternatives.

This distinction is central to project rescue work:

> A successful code repair does not prove that an asset deserves investment.

The correct outcome was to retain the repair as a capability case and avoid allocating acquisition or marketing capital to a weak commercial thesis.

## Scope and limitations

This case does not claim:

- a complete security audit of the application;
- production penetration testing;
- elimination of DNS rebinding under every network architecture;
- modernization of the full dependency stack;
- commercial viability of the Astuto product.

The patch addresses a specific, testable rescue scope. Production operators should still apply network-level egress controls, secret management, dependency maintenance, monitoring, backups, and independent security review.