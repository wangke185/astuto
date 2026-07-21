# Software Rescue Client Intake Checklist

Use this checklist before accepting repository access, quoting a rescue sprint, or discussing an acquisition. The purpose is to establish authority, business urgency, evidence, scope, and safe access before engineering work starts.

## 1. Project and business context

- Project or company name:
- Product URL:
- Repository URL or source-delivery method:
- Primary contact and role:
- Current status: live / staging / offline / prototype / internal-only
- Number of active users:
- Number of paying customers:
- Approximate monthly revenue, if relevant:
- Main customer workflow:
- Single most urgent technical or operational problem:
- Business impact if the problem remains unresolved:
- Required decision or outcome:
- Deadline and reason for the deadline:

Do not treat registrations, waitlist entries, or social-media followers as paying customers.

## 2. Authority and ownership

The client must confirm in writing that they are authorized to provide the relevant code and access.

- Who owns or controls the source repository?
- Who controls the domain and DNS?
- Who controls cloud and deployment accounts?
- Who controls the production database?
- Who controls payment accounts and subscriptions?
- Who controls app-store accounts, if applicable?
- Are there former developers, agencies, contractors, or partners with unresolved rights?
- Are third-party templates, datasets, models, media, or licenses used?
- Are there restrictions on transferring the code, customer data, or subscriptions?

Stop the engagement if authority is disputed or cannot be documented.

## 3. Technical baseline

- Primary technology stack:
- Framework and runtime versions:
- Database and storage services:
- External integrations:
- Current hosting and deployment path:
- CI/CD status:
- Does the current commit build?
- Does it run in a controlled environment?
- Is there automated test coverage?
- Is there setup or architecture documentation?
- Are production and staging configurations materially different?
- Are backups and recovery procedures documented?

## 4. Minimum safe access

Start with the lowest access level capable of answering the agreed questions.

Preferred first access:

- read-only repository access or a source archive;
- dependency lockfiles and setup instructions;
- synthetic, anonymized, or controlled test data;
- non-production service accounts;
- read-only logs or sanitized error reports;
- billing or usage summaries without payment credentials.

Do not request by email:

- production passwords;
- private keys;
- one-time authentication codes;
- unrestricted cloud administrator access;
- raw customer datasets;
- live payment credentials;
- personal identity documents unless a legitimate contract or payment provider requires them.

## 5. Assessment scope

Before work begins, write one sentence for each item.

- Objective:
- In-scope systems:
- Explicit exclusions:
- Reproduction target:
- Evidence to be reviewed:
- Deliverables:
- Completion date:
- Acceptance method:
- Fee and currency:
- Payment schedule:
- Change-request rule:

An assessment is not an unlimited code audit, penetration test, feature build, production migration, or guarantee that every defect will be discovered.

## 6. Rescue sprint readiness

A rescue sprint should start only when the assessment establishes all of the following:

- the relevant system can be reproduced or the blocking condition is understood;
- the business-critical problem is bounded;
- the client can provide required access safely;
- observable acceptance criteria exist;
- dependencies and third-party constraints are known;
- the client understands exclusions and remaining risks;
- the deposit has cleared;
- the work is authorized in writing.

## 7. Acquisition or partnership readiness

For a purchase, revenue share, or staged acquisition, require additional evidence:

- revenue platform evidence covering an agreed period;
- active customer and subscription evidence;
- operating-cost evidence;
- churn, refund, and chargeback evidence;
- code and license ownership evidence;
- domain and account transfer process;
- payment-subscription transferability;
- customer-data transfer basis and privacy obligations;
- seller support period after handover;
- escrow or staged-payment structure;
- rollback or termination terms if material claims are false.

No capital should be allocated solely because a project appears inexpensive.

## 8. Initial decision

Choose one:

- **Proceed to paid assessment** — authority and evidence are sufficient for bounded review.
- **Request missing evidence** — the opportunity may be viable, but specific gaps must be closed first.
- **Technical case only** — useful for demonstration or learning, but not a commercial engagement.
- **Reject** — demand, authority, economics, or technical scope does not justify further work.

Record the evidence and the next action rather than relying on verbal impressions.