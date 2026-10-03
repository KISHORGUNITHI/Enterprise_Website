import prisma from '../../../config/prisma.js';

export class AdminProductRepository {
  /**
   * Find all products with category and images
   */
  async findAll(where = {}, skip = 0, take = 20, orderBy = { createdAt: 'desc' }) {
    const products = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        availability: true,
        stock: true,
        rating: true,
        reviews: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        productImages: {
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true
          },
          orderBy: { isPrimary: 'desc' }
        },
        variants: {
          select: {
            id: true,
            availability: true,
            priceOverride: true,
            attributeValues: {
              select: {
                id: true,
                value: true,
                displayValue: true,
                attribute: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            variants: true,
            orderItems: true
          }
        }
      }
    });

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    return {
      products: products.map(p => ({
        ...p,
        variantsCount: p._count?.variants || (p.variants?.length || 0),
        primaryImage: p.productImages?.find(img => img.isPrimary) || p.productImages?.[0] || null,
        _count: undefined
      })),
      total
    };
  }

  /**
   * Find product by ID with all relations
   */
  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        availability: true,
        stock: true,
        rating: true,
        reviews: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        productImages: {
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true
          },
          orderBy: { isPrimary: 'desc' }
        },
        variants: {
          select: {
            id: true,
            availability: true,
            priceOverride: true,
            attributeValues: {
              select: {
                id: true,
                value: true,
                displayValue: true,
                attribute: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            variants: true,
            orderItems: true
          }
        }
      }
    });
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug }
    });
  }

  /**
   * Create a new product
   */
  async create(data) {
    return prisma.product.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        availability: true,
        stock: true,
        rating: true,
        reviews: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        productImages: {
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true
          }
        }
      }
    });
  }

  /**
   * Update product by ID
   */
  async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        brand: true,
        price: true,
        availability: true,
        stock: true,
        rating: true,
        reviews: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        productImages: {
          select: {
            id: true,
            imageUrl: true,
            isPrimary: true
          },
          orderBy: { isPrimary: 'desc' }
        },
        _count: {
          select: {
            variants: true,
            orderItems: true
          }
        }
      }
    });
  }

  /**
   * Replace product images
   */
  async updateImages(productId, images) {
    await prisma.productImage.deleteMany({
      where: { productId }
    });

    if (Array.isArray(images) && images.length > 0) {
      const hasPrimary = images.some(img => typeof img === 'object' && img.isPrimary);
      await prisma.productImage.createMany({
        data: images.map((img, idx) => ({
          productId,
          imageUrl: (typeof img === 'string' ? img : (img.url || img.imageUrl)).trim(),
          isPrimary: typeof img === 'object' ? (hasPrimary ? !!img.isPrimary : idx === 0) : (idx === 0)
        }))
      });
    }
  }

  /**
   * Delete product by ID
   */
  async remove(id) {
    return prisma.product.delete({
      where: { id }
    });
  }

  /**
   * Check if category exists by ID or Name
   */
  async categoryExists(identifier) {
    if (!identifier) return null;
    const byId = await prisma.category.findUnique({
      where: { id: identifier }
    });
    if (byId) return byId;

    return prisma.category.findFirst({
      where: {
        name: { equals: identifier, mode: 'insensitive' }
      }
    });
  }
}
