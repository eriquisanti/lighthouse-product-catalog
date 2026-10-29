import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { ProductController } from './controllers/product.controller.js';
import type { PrismaClient } from './generated/prisma/client.js';
import { registerErrorHandlers } from './http/error-handler.js';
import { registerJsonBodyParser } from './http/json-body-parser.js';
import { PrismaProductRepository } from './repositories/prisma-product.repository.js';
import { healthRoutes } from './routes/health.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { ProductService } from './services/product.service.js';

type BuildAppOptions = {
  prisma: PrismaClient;
  corsOrigin: string[];
  logger?: boolean;
};

export async function buildApp({
  prisma,
  corsOrigin,
  logger = false,
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerJsonBodyParser(app);
  registerErrorHandlers(app);

  await app.register(cors, {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const productRepository = new PrismaProductRepository(prisma);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  await app.register(healthRoutes, {
    prefix: '/health',
    checkDatabase: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
  });
  await app.register(productRoutes, { prefix: '/products', controller: productController });

  return app;
}
