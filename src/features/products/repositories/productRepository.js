import prisma from "../../../config/prisma.js";

export class ProductRepository {
  async findAll() {
    return await prisma.product.findMany({
      include: {
        productImages: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByCategory(categoryName) {
    return await prisma.product.findMany({
      where: {
        category: {
          name: {
            equals: categoryName,
            mode: "insensitive",
          },
        },
      },
      include: {
        productImages: true,
        category: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByIdOrSlug(identifier) {
    return await prisma.product.findFirst({
      where: {
        OR: [
          { id: identifier },
          { slug: identifier },
        ],
      },
      include: {
        productImages: true,
        category: true,
      },
    });
  }
}
