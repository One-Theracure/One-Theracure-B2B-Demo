import React, { useState, useEffect } from "react";
import { MessageSquare, CheckCircle, XCircle, Clock, Mail, Phone, Send, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommunicationEvent, CommunicationChannel, CommunicationStatus } from "@/types/communication";
import { getPatientCommunications } from "@/services/communicationService";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: Record<CommunicationChannel, React.ElementType> = {
  whatsapp: MessageCircle,
  sms: MessageSquare,
  email: Mail,
  voice: Phone,
  "call-center": Phone,
  "in-app": MessageSquare,
};

const CHANNEL_COLORS: Record<CommunicationChannel, string> = {
  whatsapp: "text-emerald-600 bg-emerald-500/10",
  sms: "text-blue-600 bg-blue-500/10",
  email: "text-violet-600 bg-violet-500/10",
  voice: "text-orange-600 bg-orange-500/10",
  "call-center": "text-orange-600 bg-orange-500/10",
  "in-app": "text-muted-foreground bg-muted",
};

const STATUS_ICONS: Record<CommunicationStatus, React.ElementType> = {
  sent: Send,
  delivered: CheckCircle,
  read: CheckCircle,
  failed: XCircle,
  queued: Clock,
};

const STATUS_COLORS: Record<CommunicationStatus, string> = {
  sent: "text-blue-600",
  delivered: "text-emerald-600",
  read: "text-emerald-600",
  failed: "text-red-600",
  queued: "text-amber-600",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  "appointment-booked": "Appointment Booked",
  "appointment-rescheduled": "Appointment Rescheduled",
  "appointment-cancelled": "Appointment Cancelled",
  "appointment-reminder": "Appointment Reminder",
  "report-uploaded": "Report Uploaded",
  "follow-up-due": "Follow-up Due",
  "note-finalized": "Note Finalized",
  "verification-requested": "Verification Request",
  "outbound-engagement": "Outbound Engagement",
  "inbound-request-triage": "Inbound Request",
};

interface CommunicationEventLogProps {
  patientId: string;
  compact?: boolean;
}

export function CommunicationEventLog({ patientId, compact = false }: CommunicationEventLogProps) {
  const [events, setEvents] = useState<CommunicationEvent[]>([]);

  useEffect(() => {
    setEvents(getPatientCommunications(patientId));
  }, [patientId]);

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No communication events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.slice(0, compact ? 5 : 50).map((ev) => {
        const ChannelIcon = CHANNEL_ICONS[ev.channel] || MessageSquare;
        const StatusIcon = STATUS_ICONS[ev.status] || Send;
        return (
          <div key={ev.id} className="flex items-start gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", CHANNEL_COLORS[ev.channel])}>
              <ChannelIcon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">
                  {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={cn("h-3.5 w-3.5", STATUS_COLORS[ev.status])} />
                  <span className={cn("text-xs capitalize", STATUS_COLORS[ev.status])}>{ev.status}</span>
                </div>
              </div>
              {!compact && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.body}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize py-0">{ev.channel}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
