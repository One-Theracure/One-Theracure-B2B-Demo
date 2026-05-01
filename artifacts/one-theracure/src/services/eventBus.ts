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

const STORAGE_KEY = 'app_event_store';
const MAX_EVENTS = 1000;

class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private wildcardHandlers: Set<EventHandler> = new Set();

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

    this.persist(event);

    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      typeHandlers.forEach((handler) => {
        try {
          handler(event);
        } catch {
          /* handler error — silently continue */
        }
      });
    }

    this.wildcardHandlers.forEach((handler) => {
      try {
        handler(event);
      } catch {
        /* handler error — silently continue */
      }
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
    return () => {
      this.wildcardHandlers.delete(handler);
    };
  }

  off(type: EventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  private persist(event: AppEvent): void {
    try {
      const events = this.getAll();
      events.unshift(event);
      const trimmed = events.slice(0, MAX_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      /* storage full — silently continue */
    }
  }

  getAll(): AppEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getByType(type: EventType): AppEvent[] {
    return this.getAll().filter((e) => e.type === type);
  }

  getByPatient(patientId: string): AppEvent[] {
    return this.getAll().filter((e) => e.patientId === patientId);
  }

  getByEncounter(encounterId: string): AppEvent[] {
    return this.getAll().filter((e) => e.encounterId === encounterId);
  }

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* silently continue */
    }
  }
}

export const eventBus = new EventBus();
