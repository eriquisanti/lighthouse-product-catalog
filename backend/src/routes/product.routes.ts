import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { ProductController } from '../controllers/product.controller.js';
import {
  listProductsQuerySchema,
  productBodySchema,
  productParamsSchema,
} from '../schemas/product.schema.js';

type ProductRoutesOptions = {
  controller: ProductController;
};

export const productRoutes: FastifyPluginAsyncZod<ProductRoutesOptions> = async (
  app,
  { controller },
) => {
  app.get('/', { schema: { querystring: listProductsQuerySchema } }, controller.list);

  app.get('/:id', { schema: { params: productParamsSchema } }, controller.getById);

  app.post('/', { schema: { body: productBodySchema } }, controller.create);

  app.put(
    '/:id',
    { schema: { params: productParamsSchema, body: productBodySchema } },
    controller.update,
  );

  app.delete('/:id', { schema: { params: productParamsSchema } }, controller.delete);
};
