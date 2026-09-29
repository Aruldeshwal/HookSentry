import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  unique,
  index,
  jsonb,
  boolean,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ACID Event States
export const eventStatusEnum = pgEnum("event_status", [
  "PENDING",
  "DELIVERED",
  "RETRYING",
  "FAILED_DLQ",
  "DISCARDED",
]);

// Multi-tenant Tier
export const tierEnum = pgEnum("tier", ["COMMUNITY", "PRO"]);

// Endpoints Fleet
export const endpoints = pgTable("endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  targetUrl: text("target_url").notNull(),
  secret: varchar("secret", { length: 255 }).notNull(),
  tier: tierEnum("tier").default("COMMUNITY").notNull(),
  rateLimit: integer("rate_limit").default(10).notNull(), // req/s
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Webhook Events with Idempotency & Queue Indices
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    endpointId: uuid("endpoint_id")
      .references(() => endpoints.id, { onDelete: "cascade" })
      .notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    headers: jsonb("headers").$type<Record<string, string>>(),
    status: eventStatusEnum("status").default("PENDING").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    lastError: text("last_error"),
    responseStatus: integer("response_status"),
    nextRetryAt: timestamp("next_retry_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("endpoint_idempotency_unique").on(table.endpointId, table.idempotencyKey),
    index("event_status_retry_idx").on(table.status, table.nextRetryAt),
  ]
);

// AI Triage RFC 6902 Mutation Rules
export const mutationRules = pgTable("mutation_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  endpointId: uuid("endpoint_id")
    .references(() => endpoints.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  patches: jsonb("patches").notNull(), // RFC 6902 operations
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type Exports
export type Endpoint = typeof endpoints.$inferSelect;
export type NewEndpoint = typeof endpoints.$inferInsert;

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;

export type MutationRule = typeof mutationRules.$inferSelect;
export type NewMutationRule = typeof mutationRules.$inferInsert;

// Drizzle-Zod Schemas
export const insertEndpointSchema = createInsertSchema(endpoints);
export const selectEndpointSchema = createSelectSchema(endpoints);

export const insertWebhookEventSchema = createInsertSchema(webhookEvents);
export const selectWebhookEventSchema = createSelectSchema(webhookEvents);

export const insertMutationRuleSchema = createInsertSchema(mutationRules);
export const selectMutationRuleSchema = createSelectSchema(mutationRules);

// RFC 6902 Patch Operation Zod Schema
export const rfc6902OperationSchema = z.object({
  op: z.enum(["add", "remove", "replace", "move", "copy", "test"]),
  path: z.string().startsWith("/"),
  value: z.any().optional(),
  from: z.string().startsWith("/").optional(),
});

export const rfc6902PatchSchema = z.array(rfc6902OperationSchema);
export type RFC6902Patch = z.infer<typeof rfc6902PatchSchema>;
