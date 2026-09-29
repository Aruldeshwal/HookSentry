import { db } from "@/db";
import { endpoints, webhookEvents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { INITIAL_DEMO_ENDPOINTS, type EndpointView } from "./endpoints-service";

export interface WebhookEventView {
  id: string;
  endpointId: string;
  idempotencyKey: string;
  eventType: string;
  payload: Record<string, unknown>;
  headers: Record<string, string>;
  status: "PENDING" | "DELIVERED" | "RETRYING" | "FAILED_DLQ" | "DISCARDED";
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  responseStatus: number | null;
  latencyMs: number;
  createdAt: string;
}

// Built-in initial sample events for demo endpoints
const DEMO_EVENTS_BY_ENDPOINT: Record<string, WebhookEventView[]> = {
  ep_stripe_prod_9011: [
    {
      id: "evt_strp_9011_01",
      endpointId: "ep_stripe_prod_9011",
      idempotencyKey: "idemp_strp_88192a01",
      eventType: "payment_intent.succeeded",
      payload: {
        id: "pi_3MtwxL2eZvKYlo2C12345678",
        object: "payment_intent",
        amount: 14900,
        currency: "usd",
        status: "succeeded",
        customer: "cus_N9X4k2m9s",
        metadata: {
          order_id: "ord_990112",
          tier: "pro_annual",
        },
      },
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1758921820,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd",
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "x-idempotency-key": "idemp_strp_88192a01",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 38,
      createdAt: new Date(Date.now() - 15000).toISOString(),
    },
    {
      id: "evt_strp_9011_02",
      endpointId: "ep_stripe_prod_9011",
      idempotencyKey: "idemp_strp_88192a02",
      eventType: "customer.subscription.created",
      payload: {
        id: "sub_1NtwyL2eZvKYlo2C87654321",
        object: "subscription",
        status: "active",
        customer: "cus_N9X4k2m9s",
        current_period_end: 1790467200,
        plan: {
          id: "plan_enterprise_scale",
          amount: 49900,
          currency: "usd",
          interval: "month",
        },
      },
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1758921780,v1=a118e762c4a92918bbda50119e781190bcfa6892e847aa72b9a76d8b9918bc22",
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "x-idempotency-key": "idemp_strp_88192a02",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 44,
      createdAt: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: "evt_strp_9011_03",
      endpointId: "ep_stripe_prod_9011",
      idempotencyKey: "idemp_strp_88192a03",
      eventType: "charge.refunded",
      payload: {
        id: "ch_3Mtz002eZvKYlo2C24681357",
        object: "charge",
        amount_refunded: 2900,
        currency: "usd",
        refunds: {
          total_count: 1,
          data: [{ id: "re_1890a", reason: "requested_by_customer" }],
        },
      },
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1758921700,v1=98bc7211fa98e219aa432b00192eab87cb8911003fae8810237da89c77112001",
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "x-idempotency-key": "idemp_strp_88192a03",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 29,
      createdAt: new Date(Date.now() - 110000).toISOString(),
    },
    {
      id: "evt_strp_9011_dlq_01",
      endpointId: "ep_stripe_prod_9011",
      idempotencyKey: "idemp_strp_drift_9901",
      eventType: "customer.subscription.updated",
      payload: {
        id: "sub_1Qtw882eZvKYlo2C",
        object: "subscription",
        status: "active",
        customer_reference: "cus_N9X4k2m9s",
        current_period_end: 1790467200,
        plan: {
          id: "plan_scale_v2",
          amount: 49900,
          currency: "usd",
        },
      },
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=1758921600,v1=62098bc198a28...",
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "x-idempotency-key": "idemp_strp_drift_9901",
      },
      status: "FAILED_DLQ",
      attempts: 3,
      maxAttempts: 3,
      lastError: "HTTP 422 Unprocessable Entity: Downstream receiver validation failed: missing required field 'customer_id'. Expected string, received undefined.",
      responseStatus: 422,
      latencyMs: 89,
      createdAt: new Date(Date.now() - 360000).toISOString(),
    },
  ],
  ep_shopify_store_4412: [
    {
      id: "evt_shpf_4412_01",
      endpointId: "ep_shopify_store_4412",
      idempotencyKey: "idemp_shpf_9921_drift",
      eventType: "orders.create",
      payload: {
        order_number: 10429,
        line_items: [
          { sku: "SKU-PRO-KEY-01", quantity: 2, price: "45.00" },
        ],
        // Schema Drift: Upstream Shopify renamed 'customer_id' to nested 'billing_customer.id'
        billing_customer: {
          id: "cust_shopify_88910",
          email: "buyer@enterprise.corp",
        },
        total_price: "90.00",
      },
      headers: {
        "content-type": "application/json",
        "x-shopify-topic": "orders/create",
        "x-shopify-hmac-sha256": "4X3y8M0sKlw79...",
        "x-shopify-shop-domain": "acme-flagship.myshopify.com",
      },
      status: "FAILED_DLQ",
      attempts: 3,
      maxAttempts: 3,
      lastError: "HTTP 422 Unprocessable Entity: Target service rejected payload: missing required field 'customer_id' in root schema.",
      responseStatus: 422,
      latencyMs: 142,
      createdAt: new Date(Date.now() - 25000).toISOString(),
    },
    {
      id: "evt_shpf_4412_02",
      endpointId: "ep_shopify_store_4412",
      idempotencyKey: "idemp_shpf_9922_retry",
      eventType: "inventory.level_update",
      payload: {
        inventory_item_id: 88129031,
        location_id: 991,
        available: 340,
        updated_at: "2026-09-29T17:15:00Z",
      },
      headers: {
        "content-type": "application/json",
        "x-shopify-topic": "inventory_levels/update",
        "x-shopify-hmac-sha256": "8P9w1N2s...",
      },
      status: "RETRYING",
      attempts: 2,
      maxAttempts: 3,
      lastError: "HTTP 503 Service Unavailable: Downstream inventory microservice connection timed out after 3000ms.",
      responseStatus: 503,
      latencyMs: 3012,
      createdAt: new Date(Date.now() - 5000).toISOString(),
    },
    {
      id: "evt_shpf_4412_03",
      endpointId: "ep_shopify_store_4412",
      idempotencyKey: "idemp_shpf_9920_ok",
      eventType: "fulfillments.create",
      payload: {
        id: 7729103,
        order_id: 10425,
        status: "success",
        tracking_company: "FedEx",
        tracking_number: "794612349876",
      },
      headers: {
        "content-type": "application/json",
        "x-shopify-topic": "fulfillments/create",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 52,
      createdAt: new Date(Date.now() - 180000).toISOString(),
    },
  ],
  ep_github_ci_cd_3301: [
    {
      id: "evt_gh_3301_01",
      endpointId: "ep_github_ci_cd_3301",
      idempotencyKey: "idemp_gh_4410",
      eventType: "workflow_run.completed",
      payload: {
        action: "completed",
        workflow_run: {
          id: 991823719,
          name: "CI / Production Build & E2E",
          head_branch: "main",
          head_sha: "e305472891bbce",
          conclusion: "success",
        },
        repository: {
          full_name: "acme-corp/api-gateway",
        },
      },
      headers: {
        "content-type": "application/json",
        "x-github-event": "workflow_run",
        "x-github-delivery": "72ee6b30-e889-11ef-9357-1934c718a221",
        "x-hub-signature-256": "sha256=d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 31,
      createdAt: new Date(Date.now() - 8000).toISOString(),
    },
  ],
};

// In-memory runtime event store for live streaming & simulation during the session
const RUNTIME_SIMULATED_EVENTS: WebhookEventView[] = [];

export async function getEndpointById(id: string): Promise<EndpointView | null> {
  try {
    const dbEndpoint = await db.select().from(endpoints).where(eq(endpoints.id, id));
    if (dbEndpoint && dbEndpoint.length > 0) {
      const ep = dbEndpoint[0];
      return {
        id: ep.id,
        name: ep.name,
        targetUrl: ep.targetUrl,
        secret: ep.secret,
        tier: ep.tier,
        rateLimit: ep.rateLimit,
        status: "ACTIVE",
        eventCount24h: 120,
        dlqCount: 1,
        errorRate: 0.8,
        createdAt: ep.createdAt.toISOString(),
      };
    }
  } catch {
    // DB offline, fall through to demo items
  }

  const foundDemo = INITIAL_DEMO_ENDPOINTS.find((ep) => ep.id === id);
  if (foundDemo) return foundDemo;

  // Generic fallback if user navigates to an arbitrary endpoint ID
  return {
    id,
    name: `Custom Endpoint (${id.slice(0, 8)})`,
    targetUrl: "https://api.internal.network/webhooks/receiver",
    secret: `whsec_${id.slice(0, 12)}`,
    tier: "PRO",
    rateLimit: 100,
    status: "ACTIVE",
    eventCount24h: 18,
    dlqCount: 0,
    errorRate: 0,
    createdAt: new Date().toISOString(),
  };
}

export async function getEventsByEndpointId(
  endpointId: string
): Promise<WebhookEventView[]> {
  try {
    const dbEvents = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.endpointId, endpointId))
      .orderBy(desc(webhookEvents.createdAt))
      .limit(50);

    if (dbEvents && dbEvents.length > 0) {
      return dbEvents.map((e) => {
        const payloadObj = (e.payload ?? {}) as Record<string, unknown>;
        return {
          id: e.id,
          endpointId: e.endpointId,
          idempotencyKey: e.idempotencyKey,
          eventType: String(payloadObj.type || payloadObj.event || payloadObj.object || "webhook.event"),
          payload: payloadObj,
          headers: (e.headers ?? {}) as Record<string, string>,
          status: e.status,
          attempts: e.attempts,
          maxAttempts: e.maxAttempts,
          lastError: e.lastError,
          responseStatus: e.responseStatus,
          latencyMs: 35,
          createdAt: e.createdAt.toISOString(),
        };
      });
    }
  } catch {
    // Database offline, use memory/demo events
  }

  const defaultEvents = DEMO_EVENTS_BY_ENDPOINT[endpointId] || [
    {
      id: `evt_gen_${endpointId.slice(0, 6)}_01`,
      endpointId,
      idempotencyKey: `idemp_${Date.now().toString(36)}`,
      eventType: "ping.test",
      payload: {
        zen: "Approachable is better than simple.",
        hook_id: 109281,
        sender: "gateway-tester",
      },
      headers: {
        "content-type": "application/json",
        "user-agent": "HookSentry-Monitor/1.0",
      },
      status: "DELIVERED",
      attempts: 1,
      maxAttempts: 3,
      lastError: null,
      responseStatus: 200,
      latencyMs: 22,
      createdAt: new Date(Date.now() - 30000).toISOString(),
    },
  ];

  // Merge with runtime simulated events for this endpoint
  const runtimeEventsForEp = RUNTIME_SIMULATED_EVENTS.filter((e) => e.endpointId === endpointId);
  return [...runtimeEventsForEp, ...defaultEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function recordSimulatedEvent(event: WebhookEventView) {
  RUNTIME_SIMULATED_EVENTS.unshift(event);
  if (RUNTIME_SIMULATED_EVENTS.length > 100) {
    RUNTIME_SIMULATED_EVENTS.pop();
  }
}

export async function getDlqEventsByEndpointId(
  endpointId: string
): Promise<WebhookEventView[]> {
  const allEvents = await getEventsByEndpointId(endpointId);
  return allEvents.filter((ev) => ev.status === "FAILED_DLQ");
}

export async function getEventById(
  endpointId: string,
  eventId: string
): Promise<WebhookEventView | null> {
  const allEvents = await getEventsByEndpointId(endpointId);
  const found = allEvents.find((e) => e.id === eventId);
  if (found) return found;

  // Check demo events directly
  for (const epEvents of Object.values(DEMO_EVENTS_BY_ENDPOINT)) {
    const match = epEvents.find((e) => e.id === eventId);
    if (match) return match;
  }

  return null;
}

export async function updateEventStatus(
  endpointId: string,
  eventId: string,
  status: WebhookEventView["status"],
  responseStatus: number = 200,
  healedPayload?: Record<string, unknown>
): Promise<boolean> {
  // Update in runtime store if present
  const runtimeItem = RUNTIME_SIMULATED_EVENTS.find(
    (e) => e.id === eventId && e.endpointId === endpointId
  );
  if (runtimeItem) {
    runtimeItem.status = status;
    runtimeItem.responseStatus = responseStatus;
    if (healedPayload) {
      runtimeItem.payload = healedPayload;
    }
  }

  // Also update demo events map if present
  const epDemoList = DEMO_EVENTS_BY_ENDPOINT[endpointId];
  if (epDemoList) {
    const demoItem = epDemoList.find((e) => e.id === eventId);
    if (demoItem) {
      demoItem.status = status;
      demoItem.responseStatus = responseStatus;
      if (healedPayload) {
        demoItem.payload = healedPayload;
      }
    }
  }

  // Update DB if accessible
  try {
    await db
      .update(webhookEvents)
      .set({
        status,
        responseStatus,
        payload: healedPayload,
        updatedAt: new Date(),
      })
      .where(eq(webhookEvents.id, eventId));
  } catch {
    // Database offline fallback
  }

  return true;
}

