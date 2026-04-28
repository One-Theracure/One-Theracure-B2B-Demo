export type EventType =
  | 'transcript.created'
  | 'note.drafted'
  | 'document.uploaded'
  | 'dx.generated'
  | 'followup.sent'
  | 'encounter.created'
  | 'encounter.updated'
  | 'patient.updated'
  | 'ai.called'
  | 'carepath.activated';

export interface AppEvent {
  id: string;
  type: EventType;
  timestamp: string;
  tenantId?: string;
  userId?: string;
  patientId?: string;
  encounterId?: string;
  payload: Record<string, unknown>;
}

type EventHandler = (event: AppEvent) => void;

/**
 * In-memory pub-sub for cross-component coordination within a single tab.
 *
 * Phase 2 removed the `localStorage` persistence layer (`app_event_store`)
 * for two reasons:
 *   1. Healthcare safety — events frequently mention patientId / encounterId
 *      and the persisted blob was readable by anyone who opened DevTools or
 *      installed a malicious browser extension.
 *   2. Cross-tab smearing — two clinicians sharing a kiosk would inadvertently
 *      see each other's selections through the storage event.
 *
 * Durable, attributable history now lives in the server-side audit log
 * (`POST /api/audit`). This bus is for ephemeral, in-tab UI coordination
 * only. Anything that must survive a refresh MUST go through the audit log.
 */
class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private wildcardHandlers: Set<EventHandler> = new Set();
  private recent: AppEvent[] = [];
  private readonly MAX_RECENT = 200;

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  emit(type: EventType, data: Omit<AppEvent, 'id' | 'type' | 'timestamp'>): AppEvent {
    const event: AppEvent = {
      id: this.generateId(),
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    this.recent.unshift(event);
    if (this.recent.length > this.MAX_RECENT) {
      this.recent.length = this.MAX_RECENT;
    }

    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try { handler(event); } catch { /* handler error — silently continue */ }
      });
    }
    this.wildcardHandlers.forEach((handler) => {
      try { handler(event); } catch { /* handler error — silently continue */ }
    });

    return event;
  }

  on(type: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  onAll(handler: EventHandler): () => void {
    this.wildcardHandlers.add(handler);
    return () => { this.wildcardHandlers.delete(handler); };
  }

  off(type: EventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /** In-memory recent events — does NOT survive refresh. */
  getAll(): AppEvent[] {
    return [...this.recent];
  }

  getByType(type: EventType): AppEvent[] {
    return this.recent.filter((e) => e.type === type);
  }

  getByPatient(patientId: string): AppEvent[] {
    return this.recent.filter((e) => e.patientId === patientId);
  }

  getByEncounter(encounterId: string): AppEvent[] {
    return this.recent.filter((e) => e.encounterId === encounterId);
  }

  clear(): void {
    this.recent = [];
  }
}

export const eventBus = new EventBus();
