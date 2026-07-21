# Technical Rescue Assessment — Report Template

> This template defines the minimum structure for a paid software rescue assessment. Replace bracketed text with project-specific evidence. Remove sections that are explicitly out of scope rather than leaving unsupported conclusions.

## 1. Engagement summary

- **Client / project:** [name]
- **Assessment date:** [date]
- **Repository / version:** [repository and commit or archive hash]
- **Environment assessed:** [local / staging / controlled test environment]
- **Business-critical workflow:** [single workflow or bounded set]
- **Assessment objective:** [decision or outcome]
- **Explicit exclusions:** [production penetration testing, data migration, full code audit, etc.]

## 2. Authority and access record

- Source-code authority confirmed by: [name / role / written confirmation]
- Repository access level: [read-only / archive / temporary collaborator]
- Infrastructure access level: [none / read-only / test account]
- Data used: [synthetic / anonymized / controlled test data]
- Secrets received: [none expected; document exception and handling]

## 3. Reproducibility result

### 3.1 Build and setup

| Check | Result | Evidence | Blocking issue |
|---|---|---|---|
| Dependency installation | PASS / FAIL / PARTIAL | [command/log] | [issue] |
| Database initialization | PASS / FAIL / PARTIAL | [command/log] | [issue] |
| Application startup | PASS / FAIL / PARTIAL | [command/log] | [issue] |
| Focused workflow | PASS / FAIL / PARTIAL | [test/log] | [issue] |
| Production-style build | PASS / FAIL / NOT RUN | [command/log] | [issue] |

### 3.2 Baseline conclusion

[State exactly what can be reproduced and what cannot. Do not infer production health from a local startup alone.]

## 4. System map

- Entry points: [web, mobile, API, scheduled jobs]
- Core services: [list]
- Datastores: [list]
- External integrations: [payments, email, AI APIs, webhooks, etc.]
- Deployment path: [CI/CD, manual, unknown]
- Highest-risk dependency chain: [description]

## 5. Findings register

| ID | Severity | Finding | Business impact | Evidence | Recommended action |
|---|---|---|---|---|---|
| F-01 | Critical / High / Medium / Low | [finding] | [impact] | [file, log, test] | [action] |

Severity guidance:

- **Critical:** immediate loss, compromise, or inability to operate the main workflow;
- **High:** likely outage, security exposure, billing/data failure, or blocked handover;
- **Medium:** material reliability, maintainability, or cost issue;
- **Low:** bounded improvement with limited immediate business impact.

## 6. Security and operational observations

Only include checks supported by the agreed scope and available evidence.

- credential and secret handling;
- authentication and authorization boundaries;
- webhook and outbound request handling;
- dependency and framework status;
- logging and error visibility;
- backup and recovery evidence;
- timeout, retry, and idempotency behavior;
- production configuration differences;
- ownership of cloud, domain, email, payment, and app-store accounts.

## 7. Cost and maintenance observations

| Cost or workload driver | Current evidence | Risk | Possible action | Expected confidence |
|---|---|---|---|---|
| [cloud/API/support item] | [invoice/config/log] | [risk] | [action] | High / Medium / Low |

Do not claim savings without a bill, usage report, configuration record, or measurable baseline.

## 8. Recommended rescue sprint

### Objective

[One bounded outcome.]

### In scope

- [item]
- [item]

### Out of scope

- [item]
- [item]

### Acceptance criteria

1. [observable test or result]
2. [observable test or result]
3. [build / deployment / regression condition]

### Delivery evidence

- repair branch or pull request;
- focused automated or repeatable tests;
- regression/build output;
- deployment or migration notes;
- known limitations and rollback notes.

### Commercial structure

- Fixed sprint fee: [amount]
- Deposit: [normally 50%]
- Balance trigger: [acceptance tests pass / agreed handover]
- Change-request rule: [new scope requires written estimate]

## 9. Transaction or handover readiness

Use this section when the assessment supports an acquisition, partnership, or developer handover.

| Asset | Owner / controller | Transfer evidence | Risk |
|---|---|---|---|
| Source repository | [party] | [evidence] | [risk] |
| Domain | [party] | [evidence] | [risk] |
| Cloud infrastructure | [party] | [evidence] | [risk] |
| Database / customer data | [party] | [evidence] | [risk] |
| Payment account / subscriptions | [party] | [evidence] | [risk] |
| Third-party licenses and data | [party] | [evidence] | [risk] |

## 10. Final recommendation

Choose one and explain the evidence:

- **GO — rescue sprint:** the system is reproducible and the primary risk is bounded;
- **GO — conditional:** proceed only after listed ownership, access, or evidence gaps are closed;
- **NO-GO — commercial:** technical repair may be possible, but demand or transferability is insufficient;
- **NO-GO — technical:** the current evidence does not support a bounded repair;
- **ARCHIVE — case only:** useful as a demonstration or learning asset, not a commercial engagement.

## 11. Limitations

[State untested areas, unavailable environments, missing evidence, and assumptions.]
