# Local CSV Quality Tool

A zero-install browser tool for cleaning and profiling CSV/TSV/TXT files without uploading data.

## Why this exists

Many spreadsheet cleanup jobs are repetitive: remove blank rows, trim accidental whitespace, normalize common missing-value markers, remove exact duplicates, inspect missingness, then export a clean file. This tool packages those safe, deterministic operations into a single local workflow.

The current version deliberately avoids fuzzy matching, automatic date conversion, numeric coercion and other destructive inference. Those operations can silently alter valid data and should use explicit rules.

## Run

Open `index.html` in a modern browser. No server is required.

1. Drop a `.csv`, `.tsv` or `.txt` file into the page.
2. Review the cleaning options.
3. Click **Clean & profile**.
4. Inspect the quality summary and preview.
5. Download the cleaned CSV and JSON quality report.

## Current features

- automatic delimiter detection for comma, tab, semicolon and pipe-delimited text;
- quoted-field parser, including escaped quotes and embedded delimiters;
- header cleanup with blank-header recovery and duplicate-header disambiguation;
- leading/trailing whitespace removal;
- repeated horizontal whitespace collapse;
- normalization of common missing-value markers such as `NULL`, `N/A`, `none` and `#N/A`;
- fully empty row removal;
- exact duplicate row removal after cleaning;
- per-column missing, non-empty, unique-count and lightweight type profiling;
- cleaned CSV export with UTF-8 BOM for Excel-friendly opening;
- machine-readable JSON quality report;
- all processing in the browser, with no data upload endpoint or external API call.

## Safety boundaries

This is a deterministic cleanup tool, not a semantic data-repair engine. It does not:

- guess whether two near-duplicate names represent the same person;
- parse or rewrite ambiguous date formats;
- convert IDs to numbers;
- fill missing values using statistical guesses;
- mutate source files in place.

## Test

```bash
node test-core.js
```

The deterministic tests cover delimiter detection, quoted-field parsing, cleaning, header normalization and CSV round-trip behavior.

## Product experiment

This folder is also a small commercial-validation experiment: ship a bounded, privacy-first tool first, then only add paid features when users reveal a concrete need. Candidate paid additions include reusable cleaning rules, multi-file batch processing, column mapping, validation constraints, Excel `.xlsx` import/export and branded PDF/HTML quality reports.
