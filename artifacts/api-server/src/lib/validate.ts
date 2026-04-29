import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodType, infer as zInfer } from "zod/v4";

/**
 * Zod request-body validation middleware.
 *
 * Returns 422 on invalid payloads with a stable shape:
 *   { error: "Invalid request body", issues: [...] }
 *
 * On success, replaces `req.body` with the parsed (and coerced) value so
 * downstream handlers receive the typed shape.
 */
export function validateBody<S extends ZodType>(schema: S): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        error: "Invalid request body",
        issues: result.error.issues.map((i) => ({
          path: i.path,
          message: i.message,
          code: i.code,
        })),
      });
      return;
    }
    req.body = result.data as zInfer<S>;
    next();
  };
}
