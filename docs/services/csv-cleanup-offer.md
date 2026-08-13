# CSV / Spreadsheet Cleanup Service

A fixed-scope cleanup service backed by the public [Local CSV Quality Tool](../../examples/local-csv-quality-tool/README.md).

The public tool is the proof and free baseline. Paid work is for customer-specific rules, repeatable automation, multi-file workflows, validation constraints, and delivery in the exact format the customer needs.

## What I can safely deliver

- trim and normalize text fields;
- remove exact duplicates using agreed keys;
- standardize missing-value markers;
- rename or map columns to a target schema;
- filter rows using explicit business rules;
- split or merge columns using written rules;
- combine multiple CSV/TSV files with compatible schemas;
- validate required fields and produce an exception report;
- generate before/after row counts and a change log;
- provide a reusable Python or JavaScript script when requested.

## What is not included by default

- fuzzy entity matching without an agreed rule or review sample;
- guessing ambiguous date formats;
- changing IDs into numbers;
- filling missing values using invented or statistical guesses;
- financial, medical, legal, or compliance conclusions;
- scraping private/login-protected sources;
- handling production credentials.

## Fixed-price packages

### Quick Cleanup — USD 29

For one CSV/TSV file up to 10,000 rows.

Includes:

- deterministic cleanup using agreed rules;
- exact duplicate removal;
- normalized headers and missing markers;
- cleaned CSV;
- short change log;
- one revision for rule interpretation.

Target delivery: 24 hours after scope confirmation and file receipt.

### Rule-Based Cleanup — USD 69

For up to 5 CSV/TSV files or one file with custom transformation rules.

Includes Quick Cleanup plus:

- column mapping/renaming;
- explicit row filters;
- split/merge rules;
- required-field validation;
- exception report;
- reusable cleanup script;
- one revision.

Target delivery: 1–2 days.

### Repeatable Workflow — USD 149

For a recurring cleanup process that the customer needs to run again.

Includes Rule-Based Cleanup plus:

- reusable local script/tool;
- configuration for customer-specific rules;
- batch processing for multiple compatible files;
- quality summary output;
- run instructions;
- two revisions within the agreed scope.

Target delivery: 2–4 days.

## Buyer intake

Before accepting a paid job, require:

1. a sample file or redacted sample with the same structure;
2. the expected output format;
3. exact duplicate key(s), if duplicates are not whole-row exact matches;
4. written rules for dates, categories, missing values, and filters;
5. maximum file count and approximate row count;
6. confirmation that the customer is authorized to share the data.

Do not start ambiguous semantic cleanup until the rule is written down.

## Acceptance criteria

A delivery is complete when:

- output opens correctly in the agreed target format;
- all written transformation rules are applied deterministically;
- before/after row counts are reported;
- rejected or ambiguous rows are listed instead of silently modified when a rule cannot be applied safely;
- reusable scripts, when included, run against the supplied sample without manual code edits.

## Proof

The public Local CSV Quality Tool demonstrates deterministic parsing, header normalization, whitespace cleanup, missing-marker normalization, exact deduplication, column profiling, cleaned CSV export, and quality-report generation without uploading source data.

Test command:

```bash
node examples/local-csv-quality-tool/test-core.js
```
