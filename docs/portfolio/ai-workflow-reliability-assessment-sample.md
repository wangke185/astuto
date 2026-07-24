# AI Workflow Reliability Assessment — Public Sample

> Hypothetical planning and review exercise. This document does not describe confidential client work, a production audit, or affiliation with any named automation vendor.

## 1. Scenario

A small B2B SaaS uses an automated lead-qualification workflow:

1. a website form submits a lead;
2. an enrichment API adds company data;
3. an LLM classifies fit and drafts a short summary;
4. qualified leads are created or updated in the CRM;
5. a sales notification is posted to Slack;
6. failures are retried by the workflow platform.

The workflow looks successful in demos, but operators report duplicate CRM records, inconsistent classifications, lost failures, and occasional sensitive data in logs.

## 2. Assessment objective

Determine whether the workflow is safe and reliable enough for continued production use, identify the smallest corrective controls, and produce a bounded implementation plan.

The review focuses on:

- correctness and duplicate prevention;
- retries, timeouts, and failure recovery;
- data classification and secrets handling;
- LLM-output validation and human oversight;
- observability and operational ownership;
- change safety and rollback;
- cost and vendor dependency.

It does **not** certify legal or regulatory compliance, perform penetration testing, or authorize access beyond the agreed environment.

## 3. System boundary

### In scope

- website form endpoint;
- webhook or event trigger;
- enrichment API request and response;
- LLM prompt, response schema, and decision threshold;
- CRM create/update operation;
- Slack notification;
- retry behavior and failure queue;
- workflow execution logs and metrics;
- deployment and change process.

### Out of scope

- redesign of the website form;
- sales strategy or lead-scoring policy ownership;
- legal interpretation of privacy obligations;
- unrestricted production administration;
- replacement of the automation platform unless evidence shows it is necessary.

## 4. Assumptions requiring verification

| Assumption | Why it matters | Evidence requested |
|---|---|---|
| Each form submission has a stable event identifier | Required for idempotency | Request samples and event schema |
| CRM supports an external unique key or deterministic lookup | Required to prevent duplicate records | CRM API documentation and current field configuration |
| Enrichment and LLM calls have documented timeout behavior | Required to avoid hanging executions | Workflow configuration and execution history |
| Failed runs are retained and visible | Required for recovery | Failure queue, run history, and retention settings |
| Sensitive fields are not required in prompts or logs | Required to reduce data exposure | Data-flow sample and redacted log export |
| A human owns classification-policy changes | Required because model output is probabilistic | Named owner and approval process |

## 5. Reliability model

### Expected invariants

1. One source event creates at most one active CRM lead record.
2. Retrying the same event does not create new business side effects.
3. A temporary vendor failure does not silently discard the lead.
4. A malformed LLM response cannot be written directly to the CRM.
5. A low-confidence classification is routed for human review rather than treated as certain.
6. Secrets and unnecessary personal data do not appear in logs.
7. Every failed terminal run has an owner, reason, and recovery path.
8. A workflow change can be rolled back without losing queued events.

### Failure classes

- duplicate delivery;
- out-of-order delivery;
- enrichment timeout;
- vendor rate limiting;
- LLM schema violation;
- low-confidence or contradictory classification;
- CRM conflict or partial write;
- Slack failure after CRM success;
- expired credential;
- workflow edit that changes behavior without review;
- excessive token or API cost;
- missing operational owner.

## 6. Example findings register

| ID | Finding | Impact | Likelihood | Priority | Smallest corrective control |
|---|---|---:|---:|---:|---|
| R-01 | CRM create action has no idempotency key | Duplicate records and repeated sales work | High | P0 | Use source event ID as a unique external key and implement upsert behavior |
| R-02 | Entire workflow retries after Slack failure | Previously successful CRM write may repeat | High | P0 | Separate business write from notification and retry each step independently |
| R-03 | LLM output is accepted as free-form text | Invalid or invented fields can reach CRM | High | P0 | Require a versioned JSON schema and reject invalid responses |
| R-04 | Low-confidence results are auto-qualified | False positives reach sales without review | Medium | P1 | Add threshold and human-review state |
| R-05 | Raw form body is stored in execution logs | Unnecessary personal data exposure | Medium | P1 | Redact or disable payload logging; retain only required identifiers |
| R-06 | API keys are stored directly inside workflow steps | Rotation and access control are weak | Medium | P1 | Move credentials to the platform secret store and document ownership |
| R-07 | No dead-letter or terminal failure queue | Lost leads are discovered only through complaints | High | P0 | Persist terminal failures with replay controls and alerting |
| R-08 | Prompt edits have no review or version record | Classification behavior can drift silently | Medium | P1 | Version prompts and require approval for policy-impacting changes |
| R-09 | Vendor calls have no explicit timeouts | Runs can hang and consume concurrency | Medium | P1 | Set per-call timeout and bounded retry policy |
| R-10 | No cost metric per processed lead | Cost increases are detected late | Medium | P2 | Record enrichment, model, and platform cost per completed lead |

## 7. Recommended target flow

```text
Receive form event
  -> validate required fields and size
  -> derive stable event_id
  -> reserve event_id atomically
  -> enqueue processing job
  -> call enrichment service with timeout
  -> validate and normalize enrichment response
  -> call LLM with minimum required data
  -> validate versioned JSON output
  -> route low-confidence result to human review
  -> upsert CRM record using event_id/external key
  -> record business outcome
  -> send notification as an independent retryable step
  -> mark event complete
```

A failure after the CRM upsert must not cause the CRM action to run as a new create operation. Notification retries must be independent from the business write.

## 8. Suggested event states

| State | Meaning | Allowed next states |
|---|---|---|
| `RECEIVED` | Input accepted but not yet reserved | `QUEUED`, `REJECTED` |
| `QUEUED` | Durable job exists | `PROCESSING`, `FAILED_TERMINAL` |
| `PROCESSING` | Enrichment/classification in progress | `REVIEW_REQUIRED`, `CRM_PENDING`, `RETRY_WAIT`, `FAILED_TERMINAL` |
| `REVIEW_REQUIRED` | Human decision required | `CRM_PENDING`, `REJECTED` |
| `CRM_PENDING` | Validated result ready for upsert | `CRM_WRITTEN`, `RETRY_WAIT`, `FAILED_TERMINAL` |
| `CRM_WRITTEN` | Business side effect completed | `NOTIFICATION_PENDING`, `COMPLETE` |
| `NOTIFICATION_PENDING` | Slack/email message pending | `COMPLETE`, `RETRY_WAIT`, `FAILED_TERMINAL` |
| `RETRY_WAIT` | Bounded retry scheduled | Prior failed operational state |
| `FAILED_TERMINAL` | Automatic retries exhausted | `QUEUED` only through authorized replay |
| `REJECTED` | Invalid input or explicit human rejection | Terminal |
| `COMPLETE` | Required business outcome recorded | Terminal |

## 9. Retry policy example

| Operation | Timeout | Automatic retries | Backoff | Retry conditions | Non-retry conditions |
|---|---:|---:|---|---|---|
| Enrichment API | 8 s | 3 | Exponential + jitter | timeout, 429, selected 5xx | invalid request, unauthorized after one credential check |
| LLM classification | 20 s | 2 | Exponential + jitter | timeout, 429, selected 5xx | schema-invalid response after one constrained repair attempt |
| CRM upsert | 10 s | 3 | Exponential + jitter | timeout, 409 where safe, selected 5xx | validation error, permission denial |
| Slack notification | 5 s | 5 | Exponential | timeout, 429, selected 5xx | invalid channel or revoked access |

All retries must preserve the same event identifier. Retry count must be bounded. Terminal failures must remain visible and replayable by an authorized operator.

## 10. LLM control boundary

The model may assist with classification and summarization, but it does not own business policy.

### Required controls

- versioned prompt and output schema;
- allow-listed output values;
- numeric confidence or explicit uncertainty field;
- deterministic validation before side effects;
- minimum necessary data in the prompt;
- no secrets in prompt content;
- human review for low confidence, conflicting evidence, or high-impact outcomes;
- sampled quality review against labeled examples;
- documented fallback if the model is unavailable;
- cost and latency monitoring by model/version.

### Example response contract

```json
{
  "schema_version": "1.0",
  "classification": "qualified",
  "confidence": 0.84,
  "reason_codes": ["company_size_match", "industry_match"],
  "summary": "Mid-market manufacturing company requesting quoting automation.",
  "requires_human_review": false
}
```

Free-form model output must never be used as an authorization decision or written directly into structured business fields without validation.

## 11. Data and secret controls

- classify each field as required, optional, sensitive, or prohibited;
- remove unnecessary personal data before enrichment or model calls;
- store API credentials in the platform secret manager;
- restrict credential visibility and rotation permissions;
- redact payloads, tokens, and sensitive fields from logs;
- set log and failed-run retention intentionally;
- document subprocessors and data regions where relevant;
- use non-production or redacted samples during assessment;
- do not send credentials through email or chat.

Legal conclusions and regulatory scope must be confirmed by qualified owners or counsel.

## 12. Observability requirements

### Minimum metrics

- events received;
- events rejected;
- duplicate events suppressed;
- completion rate;
- terminal failure count;
- retry count by dependency;
- end-to-end latency;
- human-review rate;
- CRM upsert conflicts;
- notification failures;
- model schema-invalid rate;
- model cost and enrichment cost per completed event.

### Minimum alerts

- terminal failures above threshold;
- failure queue age above threshold;
- credential or authorization failures;
- sudden increase in duplicate events;
- model schema-invalid rate increase;
- cost per event outside the expected range;
- no successful events during an expected traffic window.

## 13. Verification plan

### Functional tests

1. Valid event produces one CRM record.
2. Duplicate delivery produces no duplicate side effect.
3. Missing required field is rejected before vendor calls.
4. Enrichment timeout retries within the defined limit.
5. Invalid LLM JSON is rejected.
6. Low-confidence output enters human review.
7. CRM timeout does not create multiple records.
8. Slack failure does not repeat the CRM upsert.
9. Terminal failure appears in the failure queue.
10. Authorized replay reuses the original event identifier.

### Operational tests

- rotate one non-production credential;
- restore a failed event from the terminal queue;
- roll back a workflow version;
- verify log redaction;
- simulate vendor 429 and 5xx responses;
- verify alerts reach the named owner;
- compare estimated and observed cost per event.

### Acceptance criteria

- duplicate delivery tests create exactly one business record;
- retries are bounded and observable;
- terminal failures are retained and replayable;
- model output is schema-validated before side effects;
- sensitive values do not appear in sampled logs;
- workflow version and rollback procedure are documented;
- a named person owns alerts, replay, and policy changes.

## 14. Five-hour paid assessment structure

### Hour 0–0.5 — Scope and evidence

- confirm business outcome, boundaries, and non-goals;
- obtain redacted workflow export, run history, and dependency list;
- identify decision owner and operational owner.

### Hour 0.5–1.5 — Flow and failure map

- map triggers, data transformations, side effects, and vendors;
- identify duplicate, partial-success, retry, and data-exposure paths.

### Hour 1.5–2.5 — Evidence review

- inspect representative successful, failed, and retried executions;
- verify identifiers, timeout settings, secret storage, and logs.

### Hour 2.5–3.5 — Control design

- define the smallest idempotency, retry, validation, human-review, and failure-queue controls;
- separate required corrections from later improvements.

### Hour 3.5–4.5 — Test and rollout plan

- produce functional and operational test cases;
- define phased deployment, metrics, rollback, and ownership.

### Hour 4.5–5 — Decision report

Deliver a concise GO / CONDITIONAL GO / NO-GO recommendation with evidence, prioritized findings, and next-step scope.

## 15. Client-facing deliverables

1. Current-state workflow map.
2. Verified facts, assumptions, and missing evidence.
3. Prioritized reliability and security findings register.
4. Recommended target flow and state model.
5. Retry, timeout, and idempotency policy.
6. LLM validation and human-review controls.
7. Test, rollout, rollback, and monitoring plan.
8. GO / CONDITIONAL GO / NO-GO recommendation.

## 16. Decision gates

### GO

- stable event identity exists;
- business side effects can be made idempotent;
- failed runs are visible and recoverable;
- data and secret handling are acceptable for the agreed scope;
- model output is validated and bounded;
- an operator owns failures and changes.

### CONDITIONAL GO

- workflow value is real, but one or more P0 controls must be completed before broader use;
- production scope remains limited while evidence or ownership gaps are closed.

### NO-GO

- duplicate side effects cannot be controlled;
- failures are silently discarded;
- credentials or sensitive data are handled through insecure channels;
- high-impact model decisions have no validation or human boundary;
- no one owns incidents, replay, or policy changes;
- the client refuses the minimum evidence required for a bounded assessment.

## 17. Example executive summary

The workflow can remain useful, but it should not scale in its current form. The highest risks are duplicate CRM writes, whole-workflow retries after partial success, unvalidated model output, and missing terminal-failure recovery. The smallest viable correction is to introduce a stable event ID, atomic idempotency reservation, independent step retries, versioned model-output validation, and a visible replayable failure queue. Growth or additional automation should wait until these controls are verified with duplicate, timeout, partial-success, and rollback tests.

## 18. Truth boundary

This sample demonstrates a review method and deliverable structure. A real engagement would require written authorization, redacted or read-only evidence, provider-specific documentation, and explicit confirmation of business and legal owners. It does not claim that every automation platform exposes the same controls or that this document alone makes a workflow production-safe.