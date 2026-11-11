import fp from 'fastify-plugin';
import type { FastifyError } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../lib/errors.js';

export default fp(
  async (app) => {
    app.setErrorHandler<FastifyError>((err, request, reply) => {
      if (hasZodFastifySchemaValidationErrors(err)) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err.validation },
        });
      }
      if (err instanceof AppError) {
        return reply.status(err.statusCode).send({
          error: { code: err.code, message: err.message, details: err.details },
        });
      }
      const status = err.statusCode ?? 500;
      if (status >= 500) request.log.error(err);
      return reply.status(status).send({
        error: {
          code: err.code ?? 'INTERNAL_ERROR',
          message: status >= 500 ? 'Something went wrong' : err.message,
        },
      });
    });

    app.setNotFoundHandler((request, reply) =>
      reply.status(404).send({
        error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` },
      }),
    );
  },
  { name: 'error-handler' },
);
