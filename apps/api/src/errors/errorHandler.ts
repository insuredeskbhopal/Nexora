import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { formatErrorResponse, ValidationError } from "@agentic/shared";

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const requestId =
    request.requestId ||
    (request.headers["x-request-id"] as string) ||
    "unknown";
  const isProduction = process.env.NODE_ENV === "production";

  // Check if Fastify schema validation error
  if ("validation" in error && error.validation) {
    const valError = new ValidationError(error.message, error.validation);
    const { statusCode, payload } = formatErrorResponse(
      valError,
      requestId,
      isProduction,
    );
    request.log.warn({ requestId, err: error }, "API Validation Error");
    return reply.status(statusCode).send(payload);
  }

  const { statusCode, payload } = formatErrorResponse(
    error,
    requestId,
    isProduction,
  );

  if (statusCode >= 500) {
    request.log.error({ requestId, err: error }, "Unhandled API Server Error");
  } else {
    request.log.warn({ requestId, err: error }, "Handled Client Error");
  }

  return reply.status(statusCode).send(payload);
}
