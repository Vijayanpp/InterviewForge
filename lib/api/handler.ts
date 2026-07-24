import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { toErrorResponse } from "@/lib/errors";
import { createRequestLogger } from "@/lib/logger";

export interface RouteContext<TParams = Record<string, string>> {
  requestId: string;
  logger: ReturnType<typeof createRequestLogger>;
  params: TParams;
}

type RouteHandler<TParams> = (
  request: NextRequest,
  ctx: RouteContext<TParams>
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Next.js route handler with:
 *  - a request id (surfaced in logs and error responses for support/debugging)
 *  - structured request logging
 *  - centralized error -> HTTP response mapping (see lib/errors.ts)
 *
 * Route handlers should throw `AppError` subclasses for expected failures;
 * anything else is logged as an internal error and returns a generic 500.
 */
export function withApiHandler<TParams = Record<string, string>>(
  handler: RouteHandler<TParams>
) {
  return async (
    request: NextRequest,
    routeArgs: { params: Promise<TParams> | TParams }
  ): Promise<NextResponse> => {
    const requestId = request.headers.get("x-request-id") ?? nanoid(12);
    const log = createRequestLogger(requestId, {
      method: request.method,
      path: request.nextUrl.pathname,
    });

    try {
      const params = await routeArgs.params;
      log.info("request:start");
      const response = await handler(request, { requestId, logger: log, params });
      response.headers.set("x-request-id", requestId);
      log.info({ status: response.status }, "request:end");
      return response;
    } catch (error) {
      const response = toErrorResponse(error, requestId);
      response.headers.set("x-request-id", requestId);
      return response;
    }
  };
}
