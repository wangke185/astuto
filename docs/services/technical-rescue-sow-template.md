# Technical Rescue Statement of Work — Template

> This template is an operational scope document, not jurisdiction-specific legal advice. Parties should obtain appropriate legal review before relying on it as a contract.

## 1. Parties and project

- **Client:** [legal name / individual]
- **Service provider:** Wang Ke
- **Project:** [project name]
- **Effective date:** [date]
- **Primary contacts:** [names and email addresses]

The client confirms that it is authorized to provide the source code, documentation, test data, and access described in this statement of work.

## 2. Engagement type

Select one:

- Technical Rescue Assessment
- Seven-Day Rescue Sprint
- Maintenance Retainer
- Transaction / Handover Diligence

## 3. Business objective

[Describe one bounded business outcome. Example: determine whether the current marketplace architecture can be safely launched, or restore reliable delivery of subscription webhooks.]

## 4. In-scope systems

- Repository and commit or archive hash:
- Application or service components:
- Test or staging environment:
- External integrations:
- Business-critical workflow:

Only the systems and workflow listed above are included.

## 5. Explicit exclusions

Unless added through a written change request, the engagement excludes:

- unlimited feature development or a full product rewrite;
- production penetration testing or a complete security audit;
- legal, tax, privacy, regulatory, or accounting advice;
- production customer-data migration;
- transfer or custody of payment funds;
- twenty-four-hour support or guaranteed response times;
- work on systems not listed in Section 4;
- remediation of every issue discovered during an assessment;
- third-party service fees, licenses, infrastructure, or API usage.

Project-specific exclusions:

- [exclusion]
- [exclusion]

## 6. Client inputs and responsibilities

The client will provide:

- written confirmation of authority over the relevant assets;
- read-only repository access or a source archive;
- setup and deployment instructions, where available;
- non-production credentials or a controlled test environment;
- synthetic or appropriately authorized test data;
- a description of expected behavior and known failures;
- timely decisions and clarification from an authorized contact.

The client will not send production passwords, private keys, one-time authentication codes, or unrestricted administrator credentials by email.

Delays in required access, evidence, or decisions may move the delivery date.

## 7. Deliverables

### Assessment deliverables

- reproducibility and build result;
- architecture and dependency summary;
- prioritized findings register with supporting evidence;
- operational, deployment, and security observations within scope;
- cost observations where records are available;
- recommended rescue scope and acceptance criteria;
- final GO / CONDITIONAL / NO-GO recommendation.

### Rescue-sprint deliverables

- isolated repair branch or pull request;
- focused tests for the agreed behavior;
- regression and production-style build results where feasible;
- deployment, migration, or rollback notes;
- known risks and limitations;
- acceptance checklist.

Project-specific deliverables:

1. [deliverable]
2. [deliverable]
3. [deliverable]

## 8. Acceptance criteria

The work is accepted when all agreed observable criteria below are satisfied or when the client approves a documented exception:

1. [command, test, workflow, or measurable result]
2. [command, test, workflow, or measurable result]
3. [regression, build, deployment, or handover condition]

A finding or recommendation is not a promise that the client will achieve a particular commercial, revenue, security, or operational result.

## 9. Schedule

- Access available by: [date]
- Work begins: [date]
- Target delivery: [date]
- Client review period: [number] business days

If the client does not report a specific acceptance failure with evidence during the review period, the deliverables will be considered accepted for billing purposes, subject to applicable law and the parties' final agreement.

## 10. Fees and payment

- Fixed fee or hourly cap: [amount and currency]
- Deposit: [normally 50% for a rescue sprint]
- Balance trigger: [acceptance criteria pass / delivery and review]
- Payment method: [agreed method]
- Third-party costs: [client-approved separately]

Work begins only after the required deposit is confirmed as cleared funds. Payment screenshots are not proof of receipt.

## 11. Change requests

Any request that changes the business objective, in-scope systems, deliverables, acceptance criteria, schedule, or access requirements must be documented in writing.

The change request must state:

- requested change;
- reason;
- price or hourly impact;
- schedule impact;
- revised acceptance criteria.

No additional work is implied by informal messages, meetings, or access to adjacent systems.

## 12. Source code and work product

- Pre-existing client code and materials remain the client's property or the property of their lawful owner.
- Pre-existing service-provider tools, templates, methods, and general know-how remain the service provider's property.
- Ownership or license terms for project-specific code changes: [define clearly].
- Open-source and third-party components remain subject to their original licenses.
- The client is responsible for verifying that it has rights to all materials it provides.

No public case study, client name, private code, or confidential metric will be published without written permission. Publicly available information and independently developed generic methods are not treated as client confidential information unless otherwise agreed.

## 13. Confidentiality and data handling

Each party will use non-public information only for the agreed engagement and will limit access to those who need it.

Preferred controls:

- read-only and time-limited access;
- non-production accounts;
- synthetic or anonymized test data;
- removal of access after handover;
- no secrets stored in source control or reports;
- written record of exceptional sensitive access.

Required retention or deletion terms:

[terms]

## 14. Warranties and limitations

The service provider will perform the agreed work using reasonable professional care and will report material limitations known within the agreed scope.

Unless explicitly stated in the final agreement, the service does not guarantee:

- discovery of every vulnerability or defect;
- uninterrupted operation;
- regulatory compliance;
- future compatibility with third-party services;
- revenue, customer growth, investment, or acquisition completion.

Any liability cap, warranty period, dispute process, governing law, and termination rights should be defined in the parties' final signed agreement.

## 15. Termination and handover

Either party may request termination according to the final agreement. On termination:

- completed work and evidence will be delivered after payment of amounts properly due;
- client access will be removed or returned;
- confidential materials will be handled according to Section 13;
- unfinished work will be documented without representing it as production-ready;
- prepaid amounts and refunds will follow the signed commercial terms.

## 16. Approval

**Client**

Name:

Title:

Signature:

Date:

**Service provider**

Name: Wang Ke

Signature:

Date: