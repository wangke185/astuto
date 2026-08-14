# Client Operations — CSV / Excel Cleanup Service

This playbook is for the live Project Catalog service:

> You will get clean, standardized, and deduplicated Excel or CSV data

## 1. First response

Hi — I can help with this. Please upload the file(s), tell me the desired output format (CSV, XLSX, or both), describe the cleanup rules you want applied, and identify the column(s) that should be used for duplicate matching if deduplication is required. If any columns or formatting must remain unchanged, please list them before I start.

Do not promise fuzzy matching, date coercion, numeric coercion, or business-rule interpretation until the rules are explicit.

## 2. Order intake gate

Before processing, confirm:

- all source files received;
- requested output format known;
- cleanup rules known;
- duplicate key known when deduplication is requested;
- protected columns/formatting known;
- selected package matches file count and scope.

If a rule is ambiguous, ask for that rule only. Do not infer destructive transformations.

## 3. Scope by package

### Starter — Quick Cleanup

- 1 file;
- trim cells;
- standardize common missing-value markers;
- remove empty rows;
- remove exact duplicates;
- export cleaned data.

### Standard — Rule-Based Cleanup

- up to 3 files;
- custom field rules;
- validation;
- business-key deduplication when rules are supplied;
- cleaned output;
- summary/report.

### Advanced — Repeatable Workflow

- up to 5 files;
- reusable Python workflow;
- configurable rules;
- audit/change logs;
- validation/reporting;
- recurring-dataset support.

## 4. Execution SOP

1. Preserve source files unchanged.
2. Inspect delimiter, encoding, sheet layout, headers, and row counts.
3. Confirm target schema and cleanup rules.
4. Profile missing values, uniqueness, and obvious type patterns.
5. Apply only deterministic rules that were agreed.
6. Run validation after cleaning.
7. Reconcile row counts: input, removed, review, output.
8. Verify deduplication keys and retained-record logic.
9. Export requested CSV/XLSX outputs.
10. Verify the output opens cleanly before delivery.

## 5. Hard safety boundaries

Do not silently:

- fuzzy-dedupe names/companies/addresses without an agreed rule;
- impute missing business data;
- coerce ambiguous dates;
- coerce ambiguous numbers or IDs;
- remove rows based on guessed business logic;
- modify protected columns;
- overwrite source files;
- send private client data to external analysis APIs.

## 6. Message when ambiguity is found

I found an ambiguous cleanup case: [brief description]. I can preserve these rows unchanged, place them in a review output, or apply a rule you specify. I will not make a destructive assumption without confirmation.

## 7. Delivery message — Starter

Hi — the cleanup is complete. I preserved the original file and attached the cleaned output in the requested format. The cleanup covered the agreed basic normalization and exact-duplicate removal only; no fuzzy matching or inferred business rules were applied.

## 8. Delivery message — Standard

Hi — the rule-based cleanup is complete. I attached the cleaned output and the cleanup summary/report. The agreed validation and deduplication rules were applied, and ambiguous records were preserved or flagged rather than silently changed.

## 9. Delivery message — Advanced

Hi — the reusable cleanup workflow is complete. I included the cleaned output, audit/change information, validation results, and the reusable workflow/rule configuration for similar future datasets. The original source files remain unchanged.

## 10. Revision boundary

A revision covers correction of a rule that was already part of the agreed scope.

It does not automatically include:

- additional source files;
- new business rules introduced after delivery;
- a new target schema;
- fuzzy/entity matching not originally agreed;
- manual research to fill missing data;
- unrelated spreadsheet redesign.

Use when scope expands:

That request introduces a new cleanup rule or dataset scope that was not included in the original order. I can review it separately and confirm whether it fits the current package before applying it.

## 11. Internal acceptance checklist

Before delivery confirm:

- source files preserved;
- output file count correct;
- input/output row counts reconciled;
- duplicate-removal count explained;
- required fields validated;
- protected columns unchanged;
- no unintended type coercion;
- ambiguous rows retained or clearly flagged;
- CSV/XLSX files reopen successfully;
- reports/logs are non-empty when included;
- no real client data used in public examples.
