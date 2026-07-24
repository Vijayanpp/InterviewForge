import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "AI_PROVIDER_ERROR"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  VALIDATION_ERROR: 422,
  AI_PROVIDER_ERROR: 502,
  INTERNAL_ERROR: 500,
};

/**
 * Base class for all expected/handled application errors. Route handlers
 * should throw this (or a subclass) for any known failure mode; anything
 * else is treated as an unexpected internal error and logged with full
 * detail but returned to the client as a generic message.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required.") {
    super("UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super("FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super("NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "The request conflicts with the current state.") {
    super("CONFLICT", message);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Too many requests. Please try again shortly.") {
    super("RATE_LIMITED", message);
  }
}

export class AiProviderError extends AppError {
  constructor(message = "The AI provider returned an unexpected response.", details?: unknown) {
    super("AI_PROVIDER_ERROR", message, details);
  }
}

interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * Converts any thrown value into a structured, safe JSON error response.
 * Unknown errors are logged with full detail server-side but never leak
 * internals to the client.
 */
export function toErrorResponse(error: unknown, requestId?: string): NextResponse<ErrorResponseBody> {
  if (error instanceof ZodError) {
    logger.warn({ requestId, issues: error.issues }, "Request validation failed");
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "The request did not pass validation.",
          details: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
          requestId,
        },
      },
      { status: STATUS_BY_CODE.VALIDATION_ERROR }
    );
  }

  if (error instanceof AppError) {
    const level = error.code === "INTERNAL_ERROR" ? "error" : "warn";
    logger[level]({ requestId, code: error.code, details: error.details }, error.message);
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details, requestId } },
      { status: STATUS_BY_CODE[error.code] }
    );
  }

  logger.error({ requestId, err: error }, "Unhandled error");
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
        requestId,
      },
    },
    { status: STATUS_BY_CODE.INTERNAL_ERROR }
  );
}
