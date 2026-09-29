import { NextRequest } from "next/server";
import { getEventsByEndpointId } from "@/lib/events-service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  const { endpointId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial handshake
        controller.enqueue(
          encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", endpointId, timestamp: Date.now() })}\n\n`)
        );

        // Send current events
        const initialEvents = await getEventsByEndpointId(endpointId);
        controller.enqueue(
          encoder.encode(`event: batch\ndata: ${JSON.stringify({ events: initialEvents })}\n\n`)
        );

        // Keep-alive heartbeat every 15 seconds
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
          } catch {
            clearInterval(heartbeatInterval);
          }
        }, 15000);

        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeatInterval);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        });
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
