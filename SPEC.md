# Project Context: HookSentry (Distributed Webhook DLQ & AI Triage Engine)

## 1. System Objective
A high-throughput webhook ingestion engine and self-healing Dead-Letter Queue (DLQ). It guarantees zero message loss, at-least-once delivery, and idempotency. When breaking upstream schema changes cause downstream 4xx failures, an isolated AI triage agent generates deterministic RFC 6902 mutation patches for safe, one-click replay.

## 2. Core Architecture & Tech Stack
- Frontend & Gateway: Next.js 15+ (App Router, Node.js runtime, shadcn/ui, Tailwind CSS).
- Database & State Machine: PostgreSQL + Drizzle ORM (handling ACID event states: PENDING, DELIVERED, RETRYING, FAILED_DLQ, DISCARDED).
- Gateway Defense: In-memory token bucket rate limiting via Redis (`@upstash/ratelimit`) enforcing multi-tenant tier quotas (Community: 10 req/s, Pro: 100 req/s).
- Ingestion Security: Native Node.js `crypto` for sub-5ms HMAC-SHA256 signature checks on raw request text (`req.text()`).
- Asynchronous Workers: Competing consumers queue using BullMQ/Redis or PostgreSQL `SELECT ... FOR UPDATE SKIP LOCKED` for exponential backoff retries (1s, 5s, 25s).
- Idempotency Guarantee: Database unique constraint on `(endpoint_id, idempotency_key)` preventing duplicate provider deliveries.
- AI Triage Pipeline: GPT-4o-mini / Claude 3.5 Sonnet constrained via Zod schemas to output strictly RFC 6902 JSON Patches applied via `fast-json-patch`.
- Observability: Server-Sent Events (SSE) streaming live event feeds and DLQ status to the client dashboard.

## 3. Core Pages
1. `/` (Public Landing & Interactive Sandbox): Live payload trigger (200 OK vs 422 Drift), interactive terminal, and tier rate-limiting switcher.
2. `/endpoints` (Endpoints Hub): Fleet view, endpoint provisioning, and tier quota metrics.
3. `/endpoints/[endpointId]` (Live Stream): High-frequency real-time event log over SSE with search and header inspector.
4. `/endpoints/[endpointId]/dlq/[eventId]` (DLQ Console): Side-by-side JSON diff viewer, AI root-cause analysis, and "Approve Mutation & Replay" action.
5. `/endpoints/[endpointId]/schemas` (Contracts & Rules): Target Zod/JSON schema editor and permanent mutation rule manager.