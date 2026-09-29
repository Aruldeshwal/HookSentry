import { Cpu, Lock, Zap, FileCode2, Database, ShieldCheck } from "lucide-react";

export function SpecsBenchmarks() {
  const specs = [
    {
      metric: "Ingestion Latency",
      spec: "p99 < 25ms",
      specAccent: "text-emerald-400",
      mechanism: "Non-blocking Next.js Edge route + lean SQL append write",
      icon: Zap,
    },
    {
      metric: "Delivery Guarantee",
      spec: "At-Least-Once",
      specAccent: "text-zinc-100",
      mechanism: "Transactional Outbox pattern with exponential retry backoff (1s, 5s, 25s)",
      icon: ShieldCheck,
    },
    {
      metric: "Concurrency Lock",
      spec: "Zero Race Conditions",
      specAccent: "text-zinc-100",
      mechanism: "PostgreSQL row-level locks using SELECT ... FOR UPDATE SKIP LOCKED",
      icon: Lock,
    },
    {
      metric: "AI Patch Format",
      spec: "Deterministic JSON",
      specAccent: "text-purple-400",
      mechanism: "RFC 6902 standard validated against strict Zod runtime schemas",
      icon: FileCode2,
    },
    {
      metric: "Signature Verification",
      spec: "sub-5ms HMAC",
      specAccent: "text-emerald-400",
      mechanism: "Native Node.js crypto stream verification directly on raw request text",
      icon: Cpu,
    },
    {
      metric: "Idempotency Protection",
      spec: "100% Unique Enforcement",
      specAccent: "text-zinc-100",
      mechanism: "Database unique composite key on (endpoint_id, idempotency_key)",
      icon: Database,
    },
  ];

  return (
    <section id="specs" className="py-16 sm:py-20 border-b border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Specifications &amp; Benchmarks
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Deterministic performance metrics backed by relational PostgreSQL ACID guarantees and low-latency edge routing.
          </p>
        </div>

        {/* High-Precision Spec Table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/20">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.08] bg-zinc-900/60 text-zinc-400">
                  <th scope="col" className="py-3.5 pl-4 pr-3 font-medium sm:pl-6">
                    Metric
                  </th>
                  <th scope="col" className="px-3 py-3.5 font-medium">
                    Specification
                  </th>
                  <th scope="col" className="px-3 py-3.5 font-medium pr-4 sm:pr-6">
                    Architectural Mechanism
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {specs.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <tr
                      key={index}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap py-3.5 pl-4 pr-3 font-medium text-zinc-200 sm:pl-6 flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                        <span>{item.metric}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span className={`font-semibold ${item.specAccent}`}>
                          {item.spec}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-zinc-400 font-sans text-xs leading-relaxed pr-4 sm:pr-6">
                        {item.mechanism}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
