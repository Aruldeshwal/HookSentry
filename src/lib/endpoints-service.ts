import { db } from "@/db";
import { endpoints, webhookEvents } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export interface EndpointView {
  id: string;
  name: string;
  targetUrl: string;
  secret: string;
  tier: "COMMUNITY" | "PRO";
  rateLimit: number;
  status: "ACTIVE" | "DEGRADED" | "PAUSED";
  eventCount24h: number;
  dlqCount: number;
  errorRate: number;
  createdAt: string;
}

export interface HeaderMetricsData {
  poisonedDlqCount: number;
  eventVolume24h: number;
  ingestionErrorRate: number;
  activeTier: "COMMUNITY" | "PRO";
  currentUsageReqSec: number;
  maxTierQuotaReqSec: number;
}

// Built-in initial seed data for local preview and testing
export const INITIAL_DEMO_ENDPOINTS: EndpointView[] = [
  {
    id: "ep_stripe_prod_9011",
    name: "Stripe Production Billing",
    targetUrl: "https://api.myapp.com/webhooks/stripe",
    secret: "whsec_live_9f83a00c714b2",
    tier: "PRO",
    rateLimit: 100,
    status: "ACTIVE",
    eventCount24h: 42190,
    dlqCount: 0,
    errorRate: 0.04,
    createdAt: "2026-09-20T10:15:00Z",
  },
  {
    id: "ep_shopify_store_4412",
    name: "Shopify Store Orders & Inventory",
    targetUrl: "https://api.myapp.com/webhooks/shopify",
    secret: "whsec_shpf_b291c9981f44",
    tier: "PRO",
    rateLimit: 100,
    status: "DEGRADED",
    eventCount24h: 18450,
    dlqCount: 7,
    errorRate: 2.18,
    createdAt: "2026-09-22T14:30:00Z",
  },
  {
    id: "ep_github_ci_cd_3301",
    name: "GitHub Actions & Webhooks Gateway",
    targetUrl: "https://ci-worker.internal.net/events/github",
    secret: "whsec_gh_81809ba822f0",
    tier: "COMMUNITY",
    rateLimit: 10,
    status: "ACTIVE",
    eventCount24h: 6240,
    dlqCount: 0,
    errorRate: 0.12,
    createdAt: "2026-09-25T08:00:00Z",
  },
  {
    id: "ep_twilio_sms_status_1102",
    name: "Twilio Telephony Dispatch",
    targetUrl: "https://telephony.myapp.com/status-callback",
    secret: "whsec_twlo_55021a88bb39",
    tier: "COMMUNITY",
    rateLimit: 10,
    status: "PAUSED",
    eventCount24h: 910,
    dlqCount: 2,
    errorRate: 4.85,
    createdAt: "2026-09-27T19:45:00Z",
  },
];

export async function getEndpointsWithMetrics(): Promise<{
  endpoints: EndpointView[];
  metrics: HeaderMetricsData;
}> {
  try {
    // Attempt database query if postgres is connected
    const dbEndpoints = await db.select().from(endpoints);

    if (dbEndpoints && dbEndpoints.length > 0) {
      const endpointViews: EndpointView[] = [];
      let totalDlq = 0;
      let totalEvents = 0;

      for (const ep of dbEndpoints) {
        // Query event counts for this endpoint
        const dlqEvents = await db
          .select({ count: sql<number>`count(*)` })
          .from(webhookEvents)
          .where(sql`${webhookEvents.endpointId} = ${ep.id} AND ${webhookEvents.status} = 'FAILED_DLQ'`);

        const totalEpEvents = await db
          .select({ count: sql<number>`count(*)` })
          .from(webhookEvents)
          .where(eq(webhookEvents.endpointId, ep.id));

        const dlqCount = Number(dlqEvents[0]?.count ?? 0);
        const epTotal = Number(totalEpEvents[0]?.count ?? 0);

        totalDlq += dlqCount;
        totalEvents += epTotal;

        endpointViews.push({
          id: ep.id,
          name: ep.name,
          targetUrl: ep.targetUrl,
          secret: ep.secret,
          tier: ep.tier,
          rateLimit: ep.rateLimit,
          status: dlqCount > 0 ? "DEGRADED" : "ACTIVE",
          eventCount24h: epTotal,
          dlqCount,
          errorRate: epTotal > 0 ? Number(((dlqCount / epTotal) * 100).toFixed(2)) : 0,
          createdAt: ep.createdAt.toISOString(),
        });
      }

      return {
        endpoints: endpointViews,
        metrics: {
          poisonedDlqCount: totalDlq,
          eventVolume24h: totalEvents,
          ingestionErrorRate:
            totalEvents > 0
              ? Number(((totalDlq / totalEvents) * 100).toFixed(2))
              : 0.15,
          activeTier: "PRO",
          currentUsageReqSec: 38,
          maxTierQuotaReqSec: 100,
        },
      };
    }
  } catch (error) {
    // Fallback to initial demo data if database connection is offline during local preview
    console.warn("Using demo endpoints data (DB connection not available yet):", error instanceof Error ? error.message : String(error));
  }

  // Calculate metrics from demo endpoints
  const totalDlq = INITIAL_DEMO_ENDPOINTS.reduce((sum, ep) => sum + ep.dlqCount, 0);
  const totalVolume = INITIAL_DEMO_ENDPOINTS.reduce((sum, ep) => sum + ep.eventCount24h, 0);
  const avgErrorRate = Number(
    (
      INITIAL_DEMO_ENDPOINTS.reduce((sum, ep) => sum + ep.errorRate, 0) /
      INITIAL_DEMO_ENDPOINTS.length
    ).toFixed(2)
  );

  return {
    endpoints: INITIAL_DEMO_ENDPOINTS,
    metrics: {
      poisonedDlqCount: totalDlq,
      eventVolume24h: totalVolume,
      ingestionErrorRate: avgErrorRate,
      activeTier: "PRO",
      currentUsageReqSec: 42,
      maxTierQuotaReqSec: 100,
    },
  };
}
