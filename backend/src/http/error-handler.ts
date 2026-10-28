import { STATUS_CODES } from 'node:http';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from '../errors/app-error.js';

type FieldError = {
  field: string;
  message: string;
};

const clientErrorMessages: Record<number, string> = {
  400: 'Corpo da requisição inválido',
  413: 'Corpo da requisição excede o tamanho permitido',
  415: 'Tipo de conteúdo não suportado',
};

function sendError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  errors?: FieldError[],
): FastifyReply {
  return reply.status(statusCode).send({
    statusCode,
    error: STATUS_CODES[statusCode],
    message,
    ...(errors && { errors }),
  });
}

function toFieldErrors(
  validation: { instancePath: string; message?: string }[],
  context?: string,
): FieldError[] {
  return validation.map(({ instancePath, message }) => ({
    field: instancePath.slice(1).replaceAll('/', '.') || context || 'body',
    message: message ?? 'Valor inválido',
  }));
}

function isClientError(statusCode: number | undefined): statusCode is number {
  return statusCode !== undefined && statusCode >= 400 && statusCode < 500;
}

function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return sendError(
      reply,
      400,
      'Dados inválidos',
      toFieldErrors(error.validation, error.validationContext),
    );
  }

  if (error instanceof AppError) {
    return sendError(reply, error.statusCode, error.message);
  }

  if (isClientError(error.statusCode)) {
    return sendError(
      reply,
      error.statusCode,
      clientErrorMessages[error.statusCode] ?? 'Requisição inválida',
    );
  }

  request.log.error(error);
  return sendError(reply, 500, 'Erro interno do servidor');
}

function notFoundHandler(_request: FastifyRequest, reply: FastifyReply) {
  return sendError(reply, 404, 'Rota não encontrada');
}

export function registerErrorHandlers(app: FastifyInstance): void {
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);
}
