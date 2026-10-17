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
        offer: true,
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
        giftsGiven: {
          select: {
            id: true,
            giftProductId: true,
            giftProduct: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                slug: true,
                productImages: {
                  select: { imageUrl: true, isPrimary: true },
                  orderBy: { isPrimary: 'desc' }
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
        gifts: (p.giftsGiven || []).map(g => ({
          giftLinkId: g.id,
          id: g.giftProduct?.id,
          name: g.giftProduct?.name,
          brand: g.giftProduct?.brand,
          price: g.giftProduct?.price,
          slug: g.giftProduct?.slug,
          primaryImage: g.giftProduct?.productImages?.find(img => img.isPrimary)?.imageUrl || g.giftProduct?.productImages?.[0]?.imageUrl || ''
        })),
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
        offer: true,
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
        giftsGiven: {
          select: {
            id: true,
            giftProductId: true,
            giftProduct: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                slug: true,
                productImages: {
                  select: { imageUrl: true, isPrimary: true },
                  orderBy: { isPrimary: 'desc' }
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
        offer: true,
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
        offer: true,
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

  /**
   * Update offer for a single product
   */
  async updateOffer(id, offer) {
    const offerVal = (offer !== null && offer !== undefined && offer !== '' && Number(offer) >= 0)
      ? parseFloat(offer)
      : null;

    return prisma.product.update({
      where: { id },
      data: {
        offer: offerVal
      },
      select: {
        id: true,
        name: true,
        price: true,
        offer: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  /**
   * Update offer for an entire category
   */
  async updateCategoryOffer(categoryIdentifier, offer, giftProductIds, clearGifts = false) {
    const offerVal = (offer !== null && offer !== undefined && offer !== '' && Number(offer) > 0)
      ? parseFloat(offer)
      : null;

    const norm = String(categoryIdentifier).trim().toLowerCase();

    // Map common aliases to category names
    const aliasToNames = {
      'mobiles': ['Mobile', 'Mobiles'],
      'mobile': ['Mobile', 'Mobiles'],
      'tvs': ['TV', 'TVs', 'Television'],
      'tv': ['TV', 'TVs', 'Television'],
      'acs': ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
      'ac': ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
      'air-conditioners': ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
      'air conditioners': ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
      'home-theatres': ['Home Theatre', 'Home Theatres', 'Home Theater', 'Home Theaters'],
      'home theatres': ['Home Theatre', 'Home Theatres', 'Home Theater', 'Home Theaters'],
      'kitchen': ['Kitchen Ware', 'Kitchen Appliances', 'Kitchen'],
      'kitchen appliances': ['Kitchen Ware', 'Kitchen Appliances', 'Kitchen'],
      'refrigerators': ['Refrigerator', 'Refrigerators', 'Fridge'],
      'refrigerator': ['Refrigerator', 'Refrigerators', 'Fridge'],
    };

    let targetCatIds = [];

    if (norm === 'all') {
      const allCats = await prisma.category.findMany({ select: { id: true, name: true } });
      targetCatIds = allCats.map(c => c.id);
    } else {
      const targetNames = aliasToNames[norm] || [categoryIdentifier];
      const matchingCats = await prisma.category.findMany({
        where: {
          OR: [
            { id: categoryIdentifier },
            { name: { in: targetNames, mode: 'insensitive' } },
            { name: { contains: norm, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true }
      });
      targetCatIds = matchingCats.map(c => c.id);
    }

    if (targetCatIds.length === 0) {
      const direct = await this.categoryExists(categoryIdentifier);
      if (direct) targetCatIds = [direct.id];
    }

    if (targetCatIds.length === 0) {
      throw new Error(`Category "${categoryIdentifier}" not found`);
    }

    const updateRes = await prisma.product.updateMany({
      where: {
        categoryId: { in: targetCatIds }
      },
      data: {
        offer: offerVal
      }
    });

    // Handle gifts for products in the category if specified
    const productsInCategory = await prisma.product.findMany({
      where: {
        categoryId: { in: targetCatIds }
      },
      select: { id: true }
    });

    if (clearGifts) {
      const prodIds = productsInCategory.map(p => p.id);
      if (prodIds.length > 0) {
        await prisma.productGift.deleteMany({
          where: { productId: { in: prodIds } }
        });
      }
    } else if (giftProductIds !== undefined && Array.isArray(giftProductIds)) {
      for (const prod of productsInCategory) {
        await this.syncProductGifts(prod.id, giftProductIds);
      }
    }

    return {
      affectedCount: updateRes.count,
      categoryIds: targetCatIds,
      offer: offerVal,
      giftsUpdated: giftProductIds !== undefined || clearGifts
    };
  }

  /**
   * Sync gifts for a product (ensuring uniqueness and no self-gifting)
   */
  async syncProductGifts(productId, giftProductIds = []) {
    // Filter out null/undefined, self-referencing IDs, and ensure unique IDs
    const uniqueGiftIds = [...new Set(
      (Array.isArray(giftProductIds) ? giftProductIds : [])
        .map(id => String(id).trim())
        .filter(id => Boolean(id) && id !== productId)
    )];

    // Fetch existing gifts
    const existing = await prisma.productGift.findMany({
      where: { productId },
      select: { giftProductId: true }
    });
    const existingIds = new Set(existing.map(g => g.giftProductId));

    // Determine IDs to remove
    const idsToRemove = [...existingIds].filter(id => !uniqueGiftIds.includes(id));
    if (idsToRemove.length > 0) {
      await prisma.productGift.deleteMany({
        where: {
          productId,
          giftProductId: { in: idsToRemove }
        }
      });
    }

    // Determine IDs to add
    const idsToAdd = uniqueGiftIds.filter(id => !existingIds.has(id));
    if (idsToAdd.length > 0) {
      await prisma.productGift.createMany({
        data: idsToAdd.map(giftProductId => ({
          productId,
          giftProductId
        })),
        skipDuplicates: true
      });
    }

    // Return updated gifts
    return this.getProductGifts(productId);
  }

  /**
   * Get all gifts for a product
   */
  async getProductGifts(productId) {
    const gifts = await prisma.productGift.findMany({
      where: { productId },
      select: {
        id: true,
        giftProductId: true,
        giftProduct: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            slug: true,
            productImages: {
              select: { imageUrl: true, isPrimary: true },
              orderBy: { isPrimary: 'desc' }
            }
          }
        }
      }
    });

    return gifts.map(g => ({
      giftLinkId: g.id,
      id: g.giftProduct?.id,
      name: g.giftProduct?.name,
      brand: g.giftProduct?.brand,
      price: g.giftProduct?.price,
      slug: g.giftProduct?.slug,
      primaryImage: g.giftProduct?.productImages?.find(img => img.isPrimary)?.imageUrl || g.giftProduct?.productImages?.[0]?.imageUrl || ''
    }));
  }

  /**
   * Remove a single gift from a product
   */
  async removeGift(productId, giftProductId) {
    await prisma.productGift.deleteMany({
      where: {
        productId,
        giftProductId
      }
    });
  }

  /**
   * Remove all gifts from a product
   */
  async removeAllGifts(productId) {
    await prisma.productGift.deleteMany({
      where: { productId }
    });
  }

  /**
   * Get all products with active offers or free gifts
   */
  async getActiveOffersAndGifts() {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { offer: { gt: 0 } },
          { giftsGiven: { some: {} } }
        ]
      },
      select: {
        id: true,
        name: true,
        brand: true,
        price: true,
        offer: true,
        slug: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        productImages: {
          select: { imageUrl: true, isPrimary: true },
          orderBy: { isPrimary: 'desc' }
        },
        giftsGiven: {
          select: {
            id: true,
            giftProductId: true,
            giftProduct: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                slug: true,
                productImages: {
                  select: { imageUrl: true, isPrimary: true },
                  orderBy: { isPrimary: 'desc' }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return products.map(p => {
      const offerNum = p.offer ? parseFloat(p.offer) : 0;
      const priceNum = parseFloat(p.price) || 0;
      const discountedPrice = offerNum > 0 ? Math.round(priceNum * (1 - offerNum / 100)) : priceNum;

      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category?.name || 'General',
        price: priceNum,
        offer: offerNum,
        discountedPrice,
        primaryImage: p.productImages?.find(img => img.isPrimary)?.imageUrl || p.productImages?.[0]?.imageUrl || '',
        gifts: (p.giftsGiven || []).map(g => ({
          giftLinkId: g.id,
          id: g.giftProduct?.id,
          name: g.giftProduct?.name,
          brand: g.giftProduct?.brand,
          price: parseFloat(g.giftProduct?.price) || 0,
          slug: g.giftProduct?.slug,
          primaryImage: g.giftProduct?.productImages?.find(img => img.isPrimary)?.imageUrl || g.giftProduct?.productImages?.[0]?.imageUrl || ''
        }))
      };
    });
  }
}
