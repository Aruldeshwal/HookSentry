import { db } from "@/db";
import { mutationRules } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Operation } from "fast-json-patch";

export interface TargetContractView {
  endpointId: string;
  schemaTitle: string;
  jsonSchema: Record<string, unknown>;
  zodCode: string;
  strictEnforcement: boolean;
  updatedAt: string;
}

export interface MutationRuleView {
  id: string;
  endpointId: string;
  name: string;
  description: string;
  eventTypeMatch: string;
  patches: Operation[];
  isActive: boolean;
  healedCount: number;
  createdAt: string;
  updatedAt: string;
}

// Built-in initial seed contracts for demo endpoints
const DEMO_CONTRACTS_BY_ENDPOINT: Record<string, TargetContractView> = {
  ep_stripe_prod_9011: {
    endpointId: "ep_stripe_prod_9011",
    schemaTitle: "StripeBillingIngestionContract",
    jsonSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "StripeBillingIngestionContract",
      type: "object",
      required: ["id", "customer_id", "amount", "status"],
      properties: {
        id: { type: "string", description: "Stripe object identifier" },
        customer_id: { type: "string", description: "Internal customer reference" },
        amount: { type: "integer", minimum: 0, description: "Amount in cents" },
        status: { type: "string", enum: ["succeeded", "active", "paid", "refunded"] },
      },
    },
    zodCode: `import { z } from "zod";

export const StripeBillingSchema = z.object({
  id: z.string().startsWith("pi_").or(z.string().startsWith("sub_")),
  customer_id: z.string().min(1),
  amount: z.number().int().nonnegative(),
  status: z.enum(["succeeded", "active", "paid", "refunded"]),
});`,
    strictEnforcement: true,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  ep_shopify_store_4412: {
    endpointId: "ep_shopify_store_4412",
    schemaTitle: "ShopifyOrdersIngestionContract",
    jsonSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "ShopifyOrdersIngestionContract",
      type: "object",
      required: ["order_number", "customer_id", "total_price", "line_items"],
      properties: {
        order_number: { type: "integer", description: "Numeric store order number" },
        customer_id: { type: "string", description: "Mandatory customer identification" },
        total_price: { type: "string", description: "Decimal currency string" },
        line_items: {
          type: "array",
          items: {
            type: "object",
            required: ["sku", "quantity", "price"],
            properties: {
              sku: { type: "string" },
              quantity: { type: "integer" },
              price: { type: "string" },
            },
          },
        },
      },
    },
    zodCode: `import { z } from "zod";

export const ShopifyOrderSchema = z.object({
  order_number: z.number().int(),
  customer_id: z.string().min(1),
  total_price: z.string(),
  line_items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number().int(),
      price: z.string(),
    })
  ),
});`,
    strictEnforcement: true,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
};

// Initial demo mutation rules
const INITIAL_DEMO_RULES: Record<string, MutationRuleView[]> = {
  ep_shopify_store_4412: [
    {
      id: "rule_shpf_cust_nest_01",
      endpointId: "ep_shopify_store_4412",
      name: "Shopify API 2026-01: Auto-Map billing_customer.id to customer_id",
      description:
        "Promoted from DLQ triage incident #evt_shpf_4412_01. Maps nested customer identifier to root customer_id.",
      eventTypeMatch: "orders.create",
      patches: [
        {
          op: "copy",
          from: "/billing_customer/id",
          path: "/customer_id",
        },
      ],
      isActive: true,
      healedCount: 142,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  ep_stripe_prod_9011: [
    {
      id: "rule_strp_cust_ref_02",
      endpointId: "ep_stripe_prod_9011",
      name: "Stripe Gateway: Auto-Map customer_reference to customer_id",
      description:
        "Normalizes customer_reference into customer_id to satisfy internal billing ingest contract.",
      eventTypeMatch: "customer.subscription.*",
      patches: [
        {
          op: "copy",
          from: "/customer_reference",
          path: "/customer_id",
        },
      ],
      isActive: true,
      healedCount: 89,
      createdAt: new Date(Date.now() - 120000000).toISOString(),
      updatedAt: new Date(Date.now() - 120000000).toISOString(),
    },
  ],
};

// Runtime store for rules created or modified in-memory during testing
const RUNTIME_MUTATION_RULES: MutationRuleView[] = [];

export async function getTargetContractByEndpointId(
  endpointId: string
): Promise<TargetContractView> {
  const demo = DEMO_CONTRACTS_BY_ENDPOINT[endpointId];
  if (demo) return demo;

  // Default contract if none exists yet
  return {
    endpointId,
    schemaTitle: "DefaultWebhookContract",
    jsonSchema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "DefaultWebhookContract",
      type: "object",
      required: ["event", "data"],
      properties: {
        event: { type: "string" },
        data: { type: "object" },
      },
    },
    zodCode: `import { z } from "zod";

export const DefaultWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.string(), z.unknown()),
});`,
    strictEnforcement: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function getMutationRulesByEndpointId(
  endpointId: string
): Promise<MutationRuleView[]> {
  try {
    const dbRules = await db
      .select()
      .from(mutationRules)
      .where(eq(mutationRules.endpointId, endpointId));

    if (dbRules && dbRules.length > 0) {
      return dbRules.map((r) => ({
        id: r.id,
        endpointId: r.endpointId,
        name: r.name,
        description: r.description || "",
        eventTypeMatch: "*",
        patches: (r.patches || []) as Operation[],
        isActive: r.isActive,
        healedCount: 31,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch {
    // Database offline, use memory & demo
  }

  const baseDemo = INITIAL_DEMO_RULES[endpointId] || [];
  const runtimeRules = RUNTIME_MUTATION_RULES.filter((r) => r.endpointId === endpointId);

  return [...runtimeRules, ...baseDemo];
}

export async function addMutationRule(
  endpointId: string,
  rule: {
    name: string;
    description: string;
    eventTypeMatch: string;
    patches: Operation[];
  }
): Promise<MutationRuleView> {
  const newRule: MutationRuleView = {
    id: `rule_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    endpointId,
    name: rule.name,
    description: rule.description,
    eventTypeMatch: rule.eventTypeMatch || "*",
    patches: rule.patches,
    isActive: true,
    healedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  RUNTIME_MUTATION_RULES.unshift(newRule);

  try {
    await db.insert(mutationRules).values({
      endpointId,
      name: rule.name,
      description: rule.description,
      patches: rule.patches,
      isActive: true,
    });
  } catch {
    // DB offline fallback
  }

  return newRule;
}

export async function toggleMutationRule(
  ruleId: string,
  isActive: boolean
): Promise<boolean> {
  const runtime = RUNTIME_MUTATION_RULES.find((r) => r.id === ruleId);
  if (runtime) {
    runtime.isActive = isActive;
    runtime.updatedAt = new Date().toISOString();
  }

  for (const epRules of Object.values(INITIAL_DEMO_RULES)) {
    const demo = epRules.find((r) => r.id === ruleId);
    if (demo) {
      demo.isActive = isActive;
      demo.updatedAt = new Date().toISOString();
    }
  }

  try {
    await db
      .update(mutationRules)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(mutationRules.id, ruleId));
  } catch {
    // DB offline fallback
  }

  return true;
}

export async function deleteMutationRule(ruleId: string): Promise<boolean> {
  const runIdx = RUNTIME_MUTATION_RULES.findIndex((r) => r.id === ruleId);
  if (runIdx !== -1) {
    RUNTIME_MUTATION_RULES.splice(runIdx, 1);
  }

  for (const epRules of Object.values(INITIAL_DEMO_RULES)) {
    const demoIdx = epRules.findIndex((r) => r.id === ruleId);
    if (demoIdx !== -1) {
      epRules.splice(demoIdx, 1);
    }
  }

  try {
    await db.delete(mutationRules).where(eq(mutationRules.id, ruleId));
  } catch {
    // DB offline fallback
  }

  return true;
}
