import type { FastifyPluginAsync } from 'fastify';

type HealthRoutesOptions = {
  checkDatabase: () => Promise<void>;
};

export const healthRoutes: FastifyPluginAsync<HealthRoutesOptions> = async (
  app,
  { checkDatabase },
) => {
  app.get('/', async (request, reply) => {
    try {
      await checkDatabase();
      return reply.status(200).send({ status: 'ok' });
    } catch (error) {
      request.log.error(error, 'Health check failed');
      return reply.status(503).send({ status: 'unavailable' });
    }
  });
};
