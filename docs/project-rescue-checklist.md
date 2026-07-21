# Software Project Rescue Checklist

This checklist is used to decide whether an abandoned, failing, or underperforming software project should be repaired, operated, acquired, or rejected.

## 1. Ownership and authorization gate

Do not inspect private code or systems until these are clear:

- identity of the owner or authorized representative;
- source-code ownership;
- license obligations;
- rights to domains, trademarks, user data, and third-party assets;
- explicit permission to inspect, modify, deploy, and test;
- restrictions imposed by customer contracts or regulated data.

**Immediate rejection conditions:** disputed ownership, stolen code, unverifiable seller identity, prohibited data access, or pressure to bypass authorization.

## 2. Business evidence gate

Collect evidence before discussing a rebuild:

- active and historical users;
- paid-customer count;
- monthly recurring and one-time revenue;
- refunds, churn, retention, and cohort behavior;
- acquisition channels and their dependence on the founder;
- infrastructure, API, support, and payment costs;
- support burden;
- customer interviews, complaints, and cancellation reasons;
- competing products and switching alternatives.

Distinguish among:

- **technical failure:** demand exists, but the product is broken;
- **product failure:** users reach the product but do not receive enough value;
- **distribution failure:** product works, but qualified customers do not find it;
- **economic failure:** revenue cannot exceed acquisition and service cost;
- **founder fatigue:** viable asset is neglected because the owner lost interest.

## 3. Reproducibility gate

A rescue cannot be estimated responsibly until the system can be reproduced.

Required materials:

- complete repository and commit history;
- startup and deployment instructions;
- environment-variable template without live secrets;
- database schema and safe test data;
- dependency lockfiles;
- error logs and known-issue list;
- external-service inventory;
- test accounts and sandbox credentials;
- current production architecture;
- backup and recovery procedure.

Record whether the system:

- builds from a clean environment;
- starts locally or in a disposable environment;
- creates and migrates its database;
- completes its core user journey;
- runs existing automated tests;
- produces observable logs when it fails.

## 4. Architecture map

Map the system before editing it:

- frontend entry points;
- backend entry points;
- authentication and authorization;
- tenant or organization isolation;
- database models and migrations;
- payments and subscription state;
- background jobs and schedulers;
- external APIs and webhooks;
- email, file storage, and search;
- observability and alerting;
- deployment and rollback;
- backup and recovery.

Identify the single path that creates user value:

> acquisition → signup → activation → repeated use → payment → retention

## 5. Risk classification

### P0 — stop-the-line

- unauthorized data access;
- broken tenant isolation;
- exposed secrets or universal credentials;
- destructive data corruption;
- remote-code execution or equivalent critical exposure;
- inability to restore from backup;
- legal or ownership defect.

### P1 — core-value failure

- cannot deploy or start;
- login, payment, or primary workflow fails;
- materially incorrect results;
- recurring crashes in normal use;
- billing state differs from actual entitlement.

### P2 — operational weakness

- high latency or API cost;
- poor error handling;
- absent tests or monitoring;
- fragile manual deployment;
- difficult maintenance;
- avoidable support burden.

### P3 — low-value improvement

- cosmetic changes;
- speculative features;
- broad rewrites without measurable benefit;
- dependency modernization unrelated to current risk.

Repair P0 and P1 first. Do not use a rescue engagement as permission for an uncontrolled rewrite.

## 6. Rescueability score

Score each category from 0 to its maximum.

| Category | Maximum | Evidence |
|---|---:|---|
| Proven demand | 25 | usage, payment, retention, urgent customer requests |
| Existing assets | 20 | code, domain, data, audience, integrations, search traffic |
| Technical rescueability | 20 | reproducible failure, common stack, bounded defect |
| Commercial upside | 20 | pricing room, cost reduction, expansion, recurring use |
| Ownership and control | 15 | clean rights, access, transparent records, deploy authority |
| **Total** | **100** | |

Decision rule:

- **75–100:** eligible for rescue sprint and possible revenue-share discussion;
- **60–74:** paid diagnosis only until uncertainty is reduced;
- **below 60:** reject or use only as a public technical exercise when legally appropriate.

A high technical score cannot compensate for absent demand or unclear ownership.

## 7. Seven-day rescue sprint design

A sprint must have one bounded outcome, such as:

- restore reproducible deployment;
- repair authentication and core workflow;
- fix billing entitlement;
- reduce a measurable failure or cost;
- close a specific security exposure;
- deliver a minimum sellable version.

Define in writing:

- included modules;
- excluded modules;
- acceptance tests;
- required owner actions;
- rollback plan;
- stop conditions;
- fixed fee and any performance component.

## 8. Engineering execution

Use this sequence:

1. freeze a reproducible baseline;
2. create an isolated branch;
3. add a failing test or observable reproduction;
4. make the smallest defensible change;
5. run focused tests;
6. run regression tests;
7. build the production artifact;
8. document configuration changes;
9. perform a rollback rehearsal when production access exists;
10. record unresolved risks.

Never report success because code was written. Report success only against agreed acceptance evidence.

## 9. Commercial validation after repair

Technical repair is followed by business measurement:

- activation rate;
- time to first value;
- paid conversion;
- retention and churn;
- support tickets per active customer;
- gross margin after infrastructure and API cost;
- founder-dependent acquisition effort;
- expansion and referral behavior.

Possible outcomes:

- **repair and return:** owner pays for the fix;
- **maintenance contract:** recurring technical support;
- **revenue share:** only with transparent revenue data and control rights;
- **staged acquisition:** payments tied to verified performance;
- **shutdown:** preserve data and terminate costs safely;
- **reject:** no further capital or time.

## 10. Stop conditions

Stop the project when any of these become true:

- source or ownership cannot be verified;
- core failure cannot be reproduced;
- required private dependency is unavailable;
- repair cost exceeds realistic asset value;
- no customer will pay after a defined validation sample;
- seller withholds revenue, churn, cost, or access evidence;
- maintenance remains structurally dependent on one unavailable person;
- regulated or safety-critical risk exceeds team capability;
- scope repeatedly expands without corresponding payment or evidence.

## 11. Case-study record

For every completed rescue, preserve:

- initial project score;
- original condition;
- exact defect and business impact;
- files and modules changed;
- failed tests encountered during the repair;
- final test and build evidence;
- remaining limitations;
- time and direct cost;
- commercial decision and rationale;
- reusable code, tests, and lessons.

The case study should show judgment as well as technical work. The strongest result is sometimes a successful repair followed by a disciplined decision not to invest.