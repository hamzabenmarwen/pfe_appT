import { z, ZodTypeAny } from 'zod';

function toValidationError(issues: z.ZodIssue[]) {
  return {
    status: 400,
    name: 'ValidationError',
    message: issues.map((issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`).join(' | '),
  };
}

export function validateBody<T extends ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw toValidationError(parsed.error.issues);
  }
  return parsed.data;
}

export function validateQuery<T extends ZodTypeAny>(schema: T, query: unknown): z.infer<T> {
  const parsed = schema.safeParse(query);
  if (!parsed.success) {
    throw toValidationError(parsed.error.issues);
  }
  return parsed.data;
}
