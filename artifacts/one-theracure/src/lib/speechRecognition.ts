/**
 * Cross-browser Web Speech API accessor.
 *
 * Returns a constructor for `SpeechRecognition`, preferring the standard name
 * and falling back to the `webkit-` prefix. Returns `null` when the browser
 * does not support the API — callers must handle that branch (the scribe and
 * voice-chat surfaces all have a Whisper fallback path).
 */
export function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}
