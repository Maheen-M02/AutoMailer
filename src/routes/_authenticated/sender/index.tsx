import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { senderNav } from "@/lib/sender-nav";
import { SenderAPI } from "@/services/api";
import { useAuth } from "@/lib/auth";
import type { CSVFile } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyStateSimple } from "@/components/ui/empty-state";
import { Inbox, FileSpreadsheet, Send, ArrowRight, Info, MoreVertical } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";

export const Route = createFileRoute("/_authenticated/sender/")({
  component: SenderHome,
});

function SenderHome() {
  const { user } = useAuth();
  const [csvs, setCsvs] = useState<CSVFile[]>([]);
  const [active, setActive] = useState<CSVFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    SenderAPI.myAssignedCSVs(user.id)
      .then((arr) => {
        setCsvs(arr);
        setActive(arr[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardShell
      nav={senderNav}
      navTitle="Sender"
      title="Assigned Databases"
      subtitle="Lead sheets assigned to you for campaigns"
    >
      <FadeIn>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start select-none">
          {/* Left Side: Sheet List */}
          <SlideIn direction="right" delay={0}>
            <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" /> Active Datasets
                    </h3>
                    <p className="text-[10px] text-gray-400 font-semibold">Cohorts for custom messaging</p>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-gray-50 border border-gray-100 animate-pulse" />
                    ))
                  ) : csvs.length > 0 ? (
                    csvs.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActive(c)}
                        className={`w-full text-left rounded-xl p-3 transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
                          active?.id === c.id
                            ? "bg-indigo-50/50 border-indigo-200 text-indigo-700 shadow-sm"
                            : "hover:bg-gray-50/80 border-gray-100 text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        <div className="text-xs font-bold truncate flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 shrink-0" />
                          {c.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1.5 font-semibold">
                          {c.rows.length} prospects
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-12">
                      <EmptyStateSimple
                        icon={Inbox}
                        title="No assignments"
                        description="Your admin hasn't linked any contact spreadsheets yet."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Guide hint at bottom */}
              <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Select sheet to preview
                </span>
              </div>
            </div>
          </SlideIn>

          {/* Right Side: Data table preview */}
          {active ? (
            <SlideIn delay={80}>
              <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[460px] overflow-hidden">
                <div>
                  <div className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-gray-50 pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" /> {active.name}
                      </h3>
                      {active.segments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {active.segments.map((s) => (
                            <Badge
                              key={s.id}
                              variant="secondary"
                              className="text-[9px] font-bold px-2 py-0 bg-gray-100 border-none text-gray-600 shadow-none"
                            >
                              {s.label} · {s.rowIds.length} leads
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                        {active.rows.length} Leads
                      </span>
                      <Link to="/sender/compose">
                        <Button
                          size="sm"
                          className="h-8.5 text-xs font-bold rounded-lg cursor-pointer bg-gray-900 hover:bg-black text-white px-3 flex items-center gap-1.5 shadow-sm"
                        >
                          Compose <Send className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* CSV Data Table */}
                  <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-gray-100 rounded-xl bg-[#fbfbfe]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                          {active.columns.map((c) => (
                            <th
                              key={c}
                              className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4 py-3"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {active.rows.map((r, rIdx) => (
                          <tr
                            key={r._id ?? rIdx}
                            className="hover:bg-indigo-50/10 transition-colors"
                          >
                            {active.columns.map((c) => (
                              <td
                                key={c}
                                className="text-xs px-4 py-3 max-w-[200px] truncate text-gray-650 font-medium"
                              >
                                {r[c]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom guide details */}
                <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center text-xs">
                  <span className="text-[10px] text-gray-400 font-semibold">Verify segment status before blast</span>
                  <Link to="/sender/compose" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-0.5">
                    Launch Campaign <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </SlideIn>
          ) : (
            !loading && (
              <div className="bg-white rounded-[20px] p-12 border border-gray-100 shadow-sm text-center text-gray-500 py-20 min-h-[380px] flex items-center justify-center">
                <div className="space-y-3">
                  <Inbox className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-900">Waiting for lists</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    When your admin assigns leads, they will appear here.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </FadeIn>
    </DashboardShell>
  );
}
