# Software Rescue Lead Feed — Public Sample

This directory demonstrates a compact lead-intelligence format for software rescue, backend reliability, API integration, and AI automation work.

It is **public implementation evidence**, not prior client work and not a guarantee that any listed opportunity remains available. The sample was assembled from public business pages and public job posts on 2026-07-29.

## What the feed adds

Raw job boards create noise. This format adds a decision layer:

1. Verify that the source still exists.
2. Separate paid trials from unpaid prototypes.
3. Check whether the requested stack matches available public evidence.
4. Record competition and access constraints.
5. Recommend one action: pursue, monitor, hold, or reject.

## Fields

- `buyer_or_channel`: public company, buyer, or contractor network.
- `opportunity`: the specific paid need.
- `source_url`: original public source.
- `payment_signal`: evidence that the work is paid or compensation is discussed.
- `scope_signal`: whether the first milestone is bounded.
- `competition_signal`: visible competition or applicant volume.
- `evidence_fit`: fit with the public webhook, API, PostgreSQL, TypeScript, and reliability proof in this repository.
- `main_risk`: the most important commercial or delivery risk.
- `decision`: pursue, monitor, hold, or reject.
- `score`: 0–100 internal prioritization score.

## Scoring model

The sample score uses five weighted factors:

- Payment certainty: 30
- Speed to cash: 25
- Evidence fit: 20
- Downside control: 15
- Repeatability: 10

A score is a prioritization aid, not a prediction of winning.

## Safety and operating rules

- Use only public business information, official application routes, and public job posts.
- Do not bypass login, anti-bot controls, or regional restrictions.
- Do not request production credentials before scope and payment are agreed.
- Prefer sandbox, throwaway, or redacted environments.
- Do not build unpaid prototypes when the buyer has not defined acceptance and payment.
- Do not claim production experience that is not supported by public evidence.

## Included sample

See [`sample-leads.csv`](./sample-leads.csv). The rejected rows are intentional: filtering out weak opportunities is part of the product value.
