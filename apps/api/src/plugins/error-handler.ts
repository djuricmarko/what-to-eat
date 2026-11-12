import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../lib/errors.js';

function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, details } };
}

function handleError(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send(errorBody('VALIDATION_ERROR', 'Invalid request', error.validation));
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(errorBody(error.code, error.message, error.details));
  }

  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;
  if (isServerError) request.log.error(error);

  const code = error.code ?? 'INTERNAL_ERROR';
  const message = isServerError ? 'Something went wrong' : error.message;
  return reply.status(statusCode).send(errorBody(code, message));
}

function handleNotFound(request: FastifyRequest, reply: FastifyReply) {
  const message = `Route ${request.method} ${request.url} not found`;
  return reply.status(404).send(errorBody('NOT_FOUND', message));
}

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler(handleError);
  app.setNotFoundHandler(handleNotFound);
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
