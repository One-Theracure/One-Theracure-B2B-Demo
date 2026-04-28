import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, __setDebugForTests } from "@/lib/logger";

describe("logger", () => {
  let debugSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ALL methods (debug/info/warn/error) are silent when debug disabled — PHI must not leak through console.warn/error in production", () => {
    const restore = __setDebugForTests(false);
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    restore();
  });

  it("ALL methods emit when debug explicitly enabled (dev / VITE_DEBUG=1)", () => {
    const restore = __setDebugForTests(true);
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(debugSpy).toHaveBeenCalledWith("[debug]", "d");
    expect(infoSpy).toHaveBeenCalledWith("[info]", "i");
    expect(warnSpy).toHaveBeenCalledWith("[warn]", "w");
    expect(errorSpy).toHaveBeenCalledWith("[error]", "e");
    restore();
  });
});
