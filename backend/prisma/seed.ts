import { createPrismaClient } from '../src/lib/prisma.js';

const products = [
  {
    name: 'Fone de Ouvido Bluetooth',
    description: 'Fone sem fio com cancelamento de ruído e 30 horas de bateria.',
    price: '349.90',
    stock: 25,
    category: 'Eletrônicos',
  },
  {
    name: 'Teclado Mecânico',
    description: 'Teclado mecânico ABNT2 com switches marrons e iluminação RGB.',
    price: '429.00',
    stock: 12,
    category: 'Informática',
  },
  {
    name: 'Mouse Sem Fio',
    description: 'Mouse ergonômico com sensor de 16000 DPI.',
    price: '199.99',
    stock: 40,
    category: 'Informática',
  },
  {
    name: 'Monitor 27 Polegadas',
    description: 'Monitor IPS QHD com taxa de atualização de 144 Hz.',
    price: '1899.00',
    stock: 7,
    category: 'Informática',
  },
  {
    name: 'Cafeteira Elétrica',
    description: 'Cafeteira com jarra térmica para até 30 xícaras.',
    price: '259.90',
    stock: 18,
    category: 'Eletrodomésticos',
  },
  {
    name: 'Liquidificador',
    description: 'Liquidificador com 12 velocidades e copo de vidro.',
    price: '189.50',
    stock: 0,
    category: 'Eletrodomésticos',
  },
  {
    name: 'Camiseta Básica Algodão',
    description: 'Camiseta 100% algodão, disponível em várias cores.',
    price: '59.90',
    stock: 120,
    category: 'Vestuário',
  },
  {
    name: 'Tênis de Corrida',
    description: 'Tênis leve com amortecimento para corridas de longa distância.',
    price: '499.99',
    stock: 15,
    category: 'Calçados',
  },
  {
    name: 'Mochila para Notebook',
    description: 'Mochila impermeável com compartimento acolchoado para notebook de até 15,6".',
    price: '229.00',
    stock: 30,
    category: 'Acessórios',
  },
  {
    name: 'Garrafa Térmica',
    description: 'Garrafa de aço inox que mantém a temperatura por 12 horas.',
    price: '89.90',
    stock: 60,
    category: 'Utilidades',
  },
  {
    name: 'Livro Código Limpo',
    description: null,
    price: '94.90',
    stock: 22,
    category: 'Livros',
  },
  {
    name: 'Cadeira de Escritório',
    description: 'Cadeira ergonômica com apoio lombar e braços reguláveis.',
    price: '1299.90',
    stock: 5,
    category: 'Móveis',
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const prisma = createPrismaClient({ databaseUrl, poolMax: 1 });

  try {
    await prisma.product.deleteMany();
    await prisma.product.createMany({ data: products });
    console.log(`Seeded ${products.length} products`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
