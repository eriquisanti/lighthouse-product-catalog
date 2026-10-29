import type { FastifyInstance } from 'fastify';

export function registerJsonBodyParser(app: FastifyInstance): void {
  const defaultJsonParser = app.getDefaultJsonParser('error', 'error');

  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
    const rawBody = body.toString();

    if (rawBody === '') {
      done(null, undefined);
      return;
    }

    defaultJsonParser(request, rawBody, done);
  });
}
