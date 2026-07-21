# Rescue v1.0.0

Release date: 2026-07-21

Status: unofficial maintenance demonstration fork

## Purpose

This snapshot preserves the first completed software-project rescue exercise performed on the archived Astuto codebase. It is a bounded reliability and security hardening release, not a claim that the entire product has been audited or commercially relaunched.

## Included changes

- preserve configured POST, PUT, PATCH, and DELETE webhook methods;
- normalize encrypted/decrypted custom webhook header representations;
- validate fully rendered webhook targets against blocked IPv4 and IPv6 networks;
- reject embedded URL credentials;
- disable outbound webhook redirect following;
- apply a ten-second outbound request timeout;
- replace the universal bootstrap password with an operator-provided or per-installation generated credential;
- add focused Webhook job and target-validator tests;
- add a focused GitHub Actions rescue workflow with persisted test output;
- document the technical findings, validation process, commercial decision, and remaining limitations.

## Validation evidence

The rescue branch passed:

- the focused Webhook rescue workflow;
- the repository's original complete test workflow;
- the production Docker image build performed by the original workflow;
- PostgreSQL test database creation and schema loading.

An initial focused run failed because Ruby 3.0 handled mixed IPv4/IPv6 `IPAddr` comparisons in a way that misclassified a public IPv4 address. The validator was corrected to compare addresses only with blocked networks of the same address family. Both focused and complete workflows then passed.

## Commercial decision

Astuto was retained as a capability case and not selected for commercial relaunch. The upstream maintainer had already disclosed weak paid traction and a crowded customer-feedback market. Technical rescueability did not justify acquisition or continued product investment.

## Limitations

This release does not provide:

- a complete application security audit;
- penetration testing;
- guaranteed prevention of every DNS-rebinding architecture;
- modernization of the full Ruby, Rails, React, or JavaScript dependency stack;
- a rebuilt or published production container image;
- any warranty of fitness for production use;
- affiliation with the original Astuto maintainers.

Production operation would still require independent deployment review, egress controls, secret management, dependency maintenance, monitoring, backups, and security testing.
