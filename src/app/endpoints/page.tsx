import type { Metadata } from "next";
import { getEndpointsWithMetrics } from "@/lib/endpoints-service";
import { EndpointsShell } from "@/components/endpoints/EndpointsShell";

export const metadata: Metadata = {
  title: "Endpoints Fleet Hub — HookSentry",
  description:
    "Fleet view, endpoint provisioning, and tier quota metrics for distributed webhook ingestion.",
};

export default async function EndpointsPage() {
  const { endpoints, metrics } = await getEndpointsWithMetrics();

  return (
    <EndpointsShell
      initialEndpoints={endpoints}
      initialMetrics={metrics}
    />
  );
}
