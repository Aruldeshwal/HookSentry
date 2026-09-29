"use client";

import { useState, useEffect, useMemo } from "react";
import type { EndpointView } from "@/lib/endpoints-service";
import type { WebhookEventView } from "@/lib/events-service";
import { EndpointHeader } from "./EndpointHeader";
import { StreamControlBar, type EventStatusFilter } from "./StreamControlBar";
import { LiveEventTable } from "./LiveEventTable";
import { PayloadInspectorDrawer } from "./PayloadInspectorDrawer";

interface LiveStreamShellProps {
  endpoint: EndpointView;
  initialEvents: WebhookEventView[];
}

export function LiveStreamShell({
  endpoint,
  initialEvents,
}: LiveStreamShellProps) {
  const [events, setEvents] = useState<WebhookEventView[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEventView | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Set up EventSource SSE connection to live stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/endpoints/${endpoint.id}/stream`);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.addEventListener("batch", (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.events && Array.isArray(data.events)) {
            setEvents((prev) => {
              // Combine unique by id
              const existingIds = new Set(prev.map((item) => item.id));
              const newIncoming = data.events.filter((item: WebhookEventView) => !existingIds.has(item.id));
              return [...newIncoming, ...prev];
            });
          }
        } catch {
          // Ignored
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setTimeout(() => setIsConnected(false), 0);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [endpoint.id]);

  // Webhook Simulation Trigger
  const handleSimulateWebhook = async (type: "valid" | "drift_422" | "error_500") => {
    setIsSimulating(true);
    try {
      const res = await fetch(`/api/endpoints/${endpoint.id}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.event) {
        setEvents((prev) => [data.event, ...prev]);
        setSelectedEvent(data.event);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Status filter
      if (statusFilter !== "ALL" && ev.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = ev.idempotencyKey.toLowerCase().includes(q);
        const matchType = ev.eventType.toLowerCase().includes(q);
        const matchStatus = String(ev.responseStatus || "").includes(q);
        const matchError = (ev.lastError || "").toLowerCase().includes(q);
        if (!matchKey && !matchType && !matchStatus && !matchError) {
          return false;
        }
      }
      return true;
    });
  }, [events, statusFilter, searchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: events.length,
      delivered: events.filter((e) => e.status === "DELIVERED").length,
      failedDlq: events.filter((e) => e.status === "FAILED_DLQ").length,
      retrying: events.filter((e) => e.status === "RETRYING").length,
      pending: events.filter((e) => e.status === "PENDING").length,
    };
  }, [events]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-zinc-950">
      {/* Endpoint Header & Gateway Credentials */}
      <EndpointHeader endpoint={endpoint} activeTab="stream" />

      {/* Stream Controls & Live Status */}
      <StreamControlBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isStreamPaused={isStreamPaused}
        onTogglePauseStream={() => setIsStreamPaused(!isStreamPaused)}
        onClearStream={() => setEvents([])}
        counts={counts}
        isConnected={isConnected}
        onSimulateWebhook={handleSimulateWebhook}
        isSimulating={isSimulating}
      />

      {/* Real-time Telemetry Table */}
      <div className="flex-1 overflow-x-auto bg-zinc-950">
        <LiveEventTable
          events={filteredEvents}
          selectedEventId={selectedEvent?.id || null}
          onSelectEvent={(ev) => setSelectedEvent(ev)}
          endpointId={endpoint.id}
        />
      </div>

      {/* Slide-over Payload Inspector Drawer */}
      <PayloadInspectorDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        endpointId={endpoint.id}
      />
    </div>
  );
}
