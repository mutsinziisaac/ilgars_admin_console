import type { ZodSchema } from "zod";
import { ValidationError } from "./errors";

export const parseWithSchema = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];
    const path = firstError?.path.join(".");
    const message = firstError?.message;

    throw new ValidationError(
      `Schema validation failed${path ? ` at ${path}` : ""}: ${message}`,
      {
        status: 422,
        details: result.error.issues,
      },
    );
  }

  return result.data;
};
