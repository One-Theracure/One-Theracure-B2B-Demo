import { useState } from "react";
import { motion } from "framer-motion";
import { Send, BellRing, MessageSquare, Sparkles, TrendingUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDemoStore } from "@/stores/useDemoStore";
import { followUpHero } from "@/data/seed/followUps";
import Sparkline from "@/components/ai/Sparkline";
import type { FollowUpSegment } from "@/types/demo";
import { cn } from "@/lib/utils";

const SEGMENTS: { key: FollowUpSegment | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "high-risk", label: "High risk" },
  { key: "chronic", label: "Chronic care" },
  { key: "missed", label: "Missed visits" },
];

export default function FollowUps() {
  const followUps = useDemoStore((s) => s.followUps);
  const markSent = useDemoStore((s) => s.markFollowUpSent);
  const [seg, setSeg] = useState<FollowUpSegment | "all">("all");
  const [bulkSending, setBulkSending] = useState(false);

  const filtered = seg === "all" ? followUps : followUps.filter((f) => f.segment === seg);
  const pending = followUps.filter((f) => f.status !== "sent");
  const sent = followUps.length - pending.length;
  const totalRevenue = pending.reduce((acc, f) => acc + f.estimatedRevenue, 0);

  const handleBulkSend = () => {
    setBulkSending(true);
    pending.forEach((f, i) => {
      setTimeout(() => markSent(f.id), i * 250);
    });
    setTimeout(() => setBulkSending(false), pending.length * 250 + 200);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-playfair">Follow-Up Engine</h1>
          <p className="text-sm text-muted-foreground">AI-segmented patient outreach · WhatsApp + app push · auto-personalized messages.</p>
        </div>
        <Button
          onClick={handleBulkSend}
          disabled={pending.length === 0 || bulkSending}
          className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg gap-2"
        >
          <Send className="h-4 w-4" />
          {bulkSending ? "Sending…" : `Send all ${pending.length} reminders`}
        </Button>
      </div>

      {/* Hero strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-widest font-bold opacity-90">Revenue recovered · last 8 weeks</div>
            <Sparkles className="h-4 w-4 opacity-90" />
          </div>
          <div className="mt-2 text-4xl font-bold tabular-nums">₹{(followUpHero.revenueRecovered / 100000).toFixed(1)}L</div>
          <div className="text-xs opacity-90">{followUpHero.patientsContacted} patients contacted · {followUpHero.responseRate}% response rate</div>
          <div className="mt-3"><Sparkline data={followUpHero.trend} width={300} height={40} color="#ffffff" stroke={2.5} /></div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5"><BellRing className="h-3 w-3 text-amber-600" /> Pending</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{pending.length}</div>
          <div className="text-xs text-muted-foreground">awaiting outreach</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-2">≈ ₹{(totalRevenue / 1000).toFixed(1)}k expected revenue</div>
        </div>
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wide flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-emerald-600" /> Sent today</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{sent}</div>
          <div className="text-xs text-muted-foreground">via WhatsApp + app</div>
        </div>
      </div>

      {/* Segments */}
      <Tabs value={seg} onValueChange={(v) => setSeg(v as FollowUpSegment | "all")}>
        <TabsList className="bg-muted/50">
          {SEGMENTS.map((s) => (
            <TabsTrigger key={s.key} value={s.key} className="text-xs">{s.label}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={seg} className="mt-4 space-y-3">
          {filtered.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-card border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-3",
                f.segment === "high-risk" ? "border-red-200/70 dark:border-red-900/40" : "border-border/60",
                f.status === "sent" && "opacity-60"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                  f.segment === "high-risk" && "bg-gradient-to-br from-red-500 to-rose-600",
                  f.segment === "chronic" && "bg-gradient-to-br from-violet-500 to-indigo-600",
                  f.segment === "missed" && "bg-gradient-to-br from-amber-500 to-orange-600"
                )}>
                  {f.patientName.split(" ").slice(-1)[0].charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{f.patientName}</div>
                    <span className={cn(
                      "text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md tracking-wide",
                      f.segment === "high-risk" && "bg-red-100 text-red-800",
                      f.segment === "chronic" && "bg-violet-100 text-violet-800",
                      f.segment === "missed" && "bg-amber-100 text-amber-800"
                    )}>{f.segment}</span>
                    <span className="text-[10px] text-muted-foreground">· {f.daysOverdue}d overdue</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.reason}</div>
                  <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                    <Sparkles className="h-3 w-3 text-[#B7791F] flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] italic text-foreground/80 leading-snug">"{f.recommendedMessage}"</div>
                  </div>
                </div>
              </div>
              <div className="flex md:flex-col items-end gap-2 md:w-44">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Est. revenue</div>
                  <div className="text-base font-bold tabular-nums">₹{f.estimatedRevenue.toLocaleString("en-IN")}</div>
                </div>
                {f.status === "sent" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold">✓ Sent</span>
                ) : (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => markSent(f.id)}>
                      <MessageSquare className="h-3 w-3" /> WhatsApp
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 hidden lg:inline-flex" onClick={() => markSent(f.id)}>
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No follow-ups in this segment.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
