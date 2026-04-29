import { CDSInputs, CDSOutput, DDxResponse, APResponse, ScribeInsights, MedicationSuggestion, ICD10Suggestion, CDSMode, SpeakerSegment } from '@/types/cds';
import { eventBus } from './eventBus';

export interface AICallTelemetry {
  id: string;
  provider: string;
  method: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  inputTokensEstimate: number;
  outputTokensEstimate: number;
  success: boolean;
  error?: string;
}

export interface AIProvider {
  name: string;
  generateCDSContent(inputs: CDSInputs, mode: CDSMode, sessionId: string, deep?: boolean, citations?: boolean): Promise<CDSOutput>;
  generateDDx(inputs: CDSInputs, deep?: boolean): Promise<DDxResponse>;
  generateAP(inputs: CDSInputs, deep?: boolean): Promise<APResponse>;
  generateLiveInsights(segments: SpeakerSegment[]): Promise<ScribeInsights>;
  generateMedicationSuggestions(inputs: CDSInputs): Promise<MedicationSuggestion[]>;
  generateICD10Suggestions(content: string): Promise<ICD10Suggestion[]>;
}

const TELEMETRY_KEY = 'ai_call_telemetry';
const MAX_TELEMETRY = 200;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function storeTelemetry(entry: AICallTelemetry): void {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    const entries: AICallTelemetry[] = raw ? JSON.parse(raw) : [];
    entries.unshift(entry);
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(entries.slice(0, MAX_TELEMETRY)));
  } catch {
    /* storage full */
  }
}

export function getTelemetryLog(): AICallTelemetry[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function withTelemetry<T>(provider: string, method: string, fn: () => Promise<T>, inputEstimate: string): Promise<T> {
  const startedAt = new Date().toISOString();
  const start = performance.now();
  let success = true;
  let error: string | undefined;
  let result: T;

  try {
    result = await fn();
  } catch (e) {
    success = false;
    error = e instanceof Error ? e.message : String(e);
    throw e;
  } finally {
    const completedAt = new Date().toISOString();
    const durationMs = Math.round(performance.now() - start);
    const entry: AICallTelemetry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      provider,
      method,
      startedAt,
      completedAt: completedAt,
      durationMs,
      inputTokensEstimate: estimateTokens(inputEstimate),
      outputTokensEstimate: 0,
      success,
      error,
    };
    storeTelemetry(entry);
    eventBus.emit('ai.called', {
      payload: { provider, method, durationMs, success },
    });
  }

  return result!;
}

class MockAIProvider implements AIProvider {
  name = 'MockAI';

  private mockAI: typeof import('./mockAI') | null = null;

  private async getMockAI() {
    if (!this.mockAI) {
      this.mockAI = await import('./mockAI');
    }
    return this.mockAI;
  }

  async generateCDSContent(inputs: CDSInputs, mode: CDSMode, sessionId: string, deep = false, citations = true): Promise<CDSOutput> {
    return withTelemetry(this.name, 'generateCDSContent', async () => {
      const ai = await this.getMockAI();
      return ai.generateCDSContent(mode, inputs, deep, citations, sessionId);
    }, JSON.stringify(inputs));
  }

  async generateDDx(inputs: CDSInputs, deep = false): Promise<DDxResponse> {
    return withTelemetry(this.name, 'generateDDx', async () => {
      const ai = await this.getMockAI();
      const output = await ai.generateCDSContent('ddx', inputs, deep, true, 'ddx-session');
      return {
        caseDiscussion: output.contentMarkdown,
        diagnosticNextSteps: [],
        differentials: [],
        citations: output.citations,
      };
    }, JSON.stringify(inputs));
  }

  async generateAP(inputs: CDSInputs, deep = false): Promise<APResponse> {
    return withTelemetry(this.name, 'generateAP', async () => {
      const ai = await this.getMockAI();
      const output = await ai.generateCDSContent('assessment-plan', inputs, deep, true, 'ap-session');
      return {
        clinicalImpression: output.contentMarkdown,
        problems: [],
        safetyNetting: [],
      };
    }, JSON.stringify(inputs));
  }

  async generateLiveInsights(segments: SpeakerSegment[]): Promise<ScribeInsights> {
    return withTelemetry(this.name, 'generateLiveInsights', async () => {
      const ai = await this.getMockAI();
      return ai.generateLiveInsights(segments.map(s => `${s.speaker}: ${s.text}`).join('\n'));
    }, JSON.stringify(segments));
  }

  async generateMedicationSuggestions(inputs: CDSInputs): Promise<MedicationSuggestion[]> {
    return withTelemetry(this.name, 'generateMedicationSuggestions', async () => {
      const ai = await this.getMockAI();
      return ai.generateMedicationSuggestions(inputs);
    }, JSON.stringify(inputs));
  }

  async generateICD10Suggestions(content: string): Promise<ICD10Suggestion[]> {
    return withTelemetry(this.name, 'generateICD10Suggestions', async () => {
      const ai = await this.getMockAI();
      return ai.generateICD10Suggestions(content);
    }, content);
  }
}

class AIClient {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new MockAIProvider();
  }

  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  generateCDSContent(inputs: CDSInputs, mode: CDSMode, sessionId: string, deep?: boolean, citations?: boolean): Promise<CDSOutput> {
    return this.provider.generateCDSContent(inputs, mode, sessionId, deep, citations);
  }

  generateLiveInsights(segments: SpeakerSegment[]): Promise<ScribeInsights> {
    return this.provider.generateLiveInsights(segments);
  }

  generateMedicationSuggestions(inputs: CDSInputs): Promise<MedicationSuggestion[]> {
    return this.provider.generateMedicationSuggestions(inputs);
  }

  generateICD10Suggestions(content: string): Promise<ICD10Suggestion[]> {
    return this.provider.generateICD10Suggestions(content);
  }
}

export const aiClient = new AIClient();
export type { AIClient };
