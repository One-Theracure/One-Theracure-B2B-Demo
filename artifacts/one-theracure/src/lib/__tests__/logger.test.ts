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

  it("warn and error always emit", () => {
    logger.warn("w");
    logger.error("e");
    expect(warnSpy).toHaveBeenCalledWith("[warn]", "w");
    expect(errorSpy).toHaveBeenCalledWith("[error]", "e");
  });

  it("debug/info gated: silent when debug disabled", () => {
    const restore = __setDebugForTests(false);
    logger.debug("d");
    logger.info("i");
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    restore();
  });

  it("debug/info emit when debug explicitly enabled", () => {
    const restore = __setDebugForTests(true);
    logger.debug("d");
    logger.info("i");
    expect(debugSpy).toHaveBeenCalledWith("[debug]", "d");
    expect(infoSpy).toHaveBeenCalledWith("[info]", "i");
    restore();
  });
});
