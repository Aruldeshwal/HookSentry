# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Backend, platform, and infrastructure engineers operating mission-critical distributed integrations who manage high-volume third-party webhooks (e.g. Stripe, Shopify, GitHub, Twilio) and need guaranteed delivery, zero message loss, and automated Dead-Letter Queue (DLQ) recovery without manual JSON schema debugging.

Secondary: Full-stack developers building webhook-consuming services who require local and staging replay sandbox environments with live SSE inspection and HMAC signature verification.

## Product Purpose

HookSentry eliminates silent webhook ingestion failures, unhandled dead-letter queues, and catastrophic data loss caused by upstream schema changes and downstream service downtime. It turns manual, high-stress webhook triage into an automated, deterministic recovery workflow.

Success means:
- Zero webhook drops (at-least-once delivery with ACID state tracking).
- Immediate detection of 4xx payload drift and upstream contract breaking changes.
- Safe, 1-click mutation and replay powered by deterministic RFC 6902 JSON Patches.

## Positioning

Unlike conventional webhook proxies or message brokers (SQS, Kafka, BullMQ) that merely queue and drop failing events into an unmonitored DLQ bucket, HookSentry combines high-speed rate-limiting gateway defense with an isolated AI triage engine that outputs mathematically deterministic RFC 6902 JSON patches for instant visual diffing, one-click replay, and permanent rule promotion.

## Operating Context

- High-throughput webhook ingestion environments where incoming traffic surges (10 to 100+ req/s) must be rate-limited and cryptographically validated via HMAC-SHA256 signatures before hitting database state machines.
- On-call incident response and schema drift triage: engineers inspecting failed deliveries in real time, inspecting raw vs transformed payloads side-by-side, evaluating AI root cause analysis, and authorizing surgical JSON patches.
- Real-time dashboard usage on desktop workstation monitors, terminal integrations, and high-frequency live stream feeds over Server-Sent Events (SSE).

## Capabilities and Constraints

- Capabilities:
  - Cryptographic HMAC-SHA256 signature verification over raw request bodies (`req.text()`).
  - ACID event state transitions (`PENDING`, `DELIVERED`, `RETRYING`, `FAILED_DLQ`, `DISCARDED`).
  - Exponential backoff worker retries (1s, 5s, 25s) with `(endpoint_id, idempotency_key)` database deduplication.
  - Multi-tenant tier rate limiting (Community: 10 req/s, Pro: 100 req/s).
  - Deterministic RFC 6902 JSON Patch generation validated against Zod schemas.
  - High-frequency Server-Sent Events (SSE) telemetry and payload stream.
  - Side-by-side JSON diff inspection and mutation rule persistence.
- Constraints:
  - Web runtime (Next.js 16 App Router, Node.js runtime, PostgreSQL via Drizzle ORM).
  - No synthetic data fabrication in production state machines.
  - AI engine output must be strictly constrained to RFC 6902 JSON Patches applied via fast-json-patch to prevent hallucinations.

## Brand Commitments

- Name: HookSentry
- Tone & Voice: Precise, mission-critical, deterministic, engineer-first, zero-bullshit, high-confidence.
- Visual Personality: Resilient infrastructure, high-density telemetry, crisp monospace contracts, industrial clarity, dark-mode biased with vivid status accents (Emerald for delivered, Amber for retrying, Rose for DLQ drift, Violet for AI triage).

## Evidence on Hand

- Architecture specification: [SPEC.md](SPEC.md).
- PostgreSQL Drizzle schema and Zod validation contracts: [src/db/schema.ts](src/db/schema.ts).
- Database client and connection pool: [src/db/index.ts](src/db/index.ts).
- Project configuration: Next.js 16, React 19, Tailwind CSS v4, Lucide React icons.

## Product Principles

1. Zero Message Loss Over Everything: An acknowledged webhook must never be discarded without durable ACID storage, persistent idempotency keys, and exhaustive retry attempts.
2. Determinism Over Black-Box Automation: AI suggestions must never blindly alter data; they must produce verifiable RFC 6902 mutation diffs that require explicit operator review or strict rule constraints before replay.
3. Sub-Millisecond Defense: Gateway authentication, HMAC verification, and tier quota checks occur before downstream state evaluation to protect backend infrastructure.
4. Transparent State Visibility: Every transition (PENDING -> RETRYING -> FAILED_DLQ -> DELIVERED) is observable in real-time with comprehensive header, timing, and error logs.
5. Engineer-Grade Density: Interfaces prioritize high-information-density grids, fast keyboards, diff inspectors, and actionable diagnostics over ornamental fluff.

## Accessibility & Inclusion

- Keyboard navigability for all triage actions, replay triggers, and rule approvals.
- High-contrast visual distinctions for event status badges (avoiding reliance solely on hue; using distinct iconography and textual status tags).
- Screen-reader accessible logs and diff announcements.
