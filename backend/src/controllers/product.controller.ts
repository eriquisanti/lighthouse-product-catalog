import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ListProductsQuery, ProductInput, ProductParams } from '../schemas/product.schema.js';
import type { ProductService } from '../services/product.service.js';

type ListRequest = FastifyRequest<{ Querystring: ListProductsQuery }>;
type ShowRequest = FastifyRequest<{ Params: ProductParams }>;
type CreateRequest = FastifyRequest<{ Body: ProductInput }>;
type UpdateRequest = FastifyRequest<{ Params: ProductParams; Body: ProductInput }>;

export class ProductController {
  constructor(private readonly service: ProductService) {}

  list = async (request: ListRequest, reply: FastifyReply) => {
    const products = await this.service.list(request.query);
    return reply.status(200).send(products);
  };

  getById = async (request: ShowRequest, reply: FastifyReply) => {
    const product = await this.service.getById(request.params.id);
    return reply.status(200).send(product);
  };

  create = async (request: CreateRequest, reply: FastifyReply) => {
    const product = await this.service.create(request.body);
    return reply.status(201).send(product);
  };

  update = async (request: UpdateRequest, reply: FastifyReply) => {
    const product = await this.service.update(request.params.id, request.body);
    return reply.status(200).send(product);
  };

  delete = async (request: ShowRequest, reply: FastifyReply) => {
    await this.service.delete(request.params.id);
    return reply.status(204).send();
  };
}
