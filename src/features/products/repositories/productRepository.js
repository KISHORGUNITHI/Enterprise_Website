import prisma from "../../../config/prisma.js";

const VARIANT_INCLUDE = {
  include: {
    attributeValues: {
      include: {
        attribute: true,
      },
    },
    images: true,
  },
  orderBy: {
    createdAt: "asc",
  },
};

export class ProductRepository {
  async findAll(searchQuery) {
    const q = searchQuery ? String(searchQuery).trim() : '';
    const where = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } }
      ]
    } : {};

    return await prisma.product.findMany({
      where,
      include: {
        productImages: true,
        category: true,
        variants: VARIANT_INCLUDE,
        giftsGiven: {
          include: {
            giftProduct: {
              include: {
                productImages: true
              }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByCategory(categoryIdentifier, searchQuery) {
    if (!categoryIdentifier) return [];

    const norm = String(categoryIdentifier).trim().toLowerCase();

    // Map common aliases/slugs/IDs to all possible names and IDs
    const ALIAS_MAP = {
      mobiles: {
        names: ['Mobile', 'Mobiles', 'Smartphone', 'Smartphones'],
        ids: ['cat-mobiles', 'cmue51oyl0000wce21x70win2']
      },
      mobile: {
        names: ['Mobile', 'Mobiles', 'Smartphone', 'Smartphones'],
        ids: ['cat-mobiles', 'cmue51oyl0000wce21x70win2']
      },
      tvs: {
        names: ['TV', 'TVs', 'Television', 'Televisions'],
        ids: ['cat-tvs', 'cmue52t24000jwce2vk59txc5']
      },
      tv: {
        names: ['TV', 'TVs', 'Television', 'Televisions'],
        ids: ['cat-tvs', 'cmue52t24000jwce2vk59txc5']
      },
      acs: {
        names: ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
        ids: ['cat-acs', 'cmue58f0m000mwoe2yrknn0ed']
      },
      ac: {
        names: ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
        ids: ['cat-acs', 'cmue58f0m000mwoe2yrknn0ed']
      },
      'air-conditioners': {
        names: ['AC', 'ACs', 'Air Conditioner', 'Air Conditioners'],
        ids: ['cat-acs', 'cmue58f0m000mwoe2yrknn0ed']
      },
      'home-theatres': {
        names: ['Home Theatre', 'Home Theatres', 'Home Theater', 'Home Theaters', 'Audio', 'Soundbars'],
        ids: ['cat-home-theatres']
      },
      'home-theatre': {
        names: ['Home Theatre', 'Home Theatres', 'Home Theater', 'Home Theaters', 'Audio', 'Soundbars'],
        ids: ['cat-home-theatres']
      },
      kitchen: {
        names: ['Kitchen Ware', 'Kitchen Appliances', 'Kitchen', 'Appliances'],
        ids: ['cat-kitchen']
      },
      refrigerators: {
        names: ['Refrigerator', 'Refrigerators', 'Fridge', 'Fridges'],
        ids: ['cat-refrigerators']
      },
      refrigerator: {
        names: ['Refrigerator', 'Refrigerators', 'Fridge', 'Fridges'],
        ids: ['cat-refrigerators']
      }
    };

    const target = ALIAS_MAP[norm];
    const targetNames = target ? target.names : [categoryIdentifier];
    const targetIds = target ? target.ids : [categoryIdentifier];

    const categoryCondition = {
      OR: [
        { categoryId: { in: targetIds } },
        { categoryId: { equals: categoryIdentifier } },
        {
          category: {
            name: { in: targetNames, mode: 'insensitive' }
          }
        },
        {
          category: {
            name: { contains: norm, mode: 'insensitive' }
          }
        }
      ]
    };

    const q = searchQuery ? String(searchQuery).trim() : '';
    const searchFilter = q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } }
      ]
    } : null;

    const where = searchFilter
      ? { AND: [categoryCondition, searchFilter] }
      : categoryCondition;

    return await prisma.product.findMany({
      where,
      include: {
        productImages: true,
        category: true,
        variants: VARIANT_INCLUDE,
        giftsGiven: {
          include: {
            giftProduct: {
              include: {
                productImages: true
              }
            }
          }
        },
      },
      orderBy: { createdAt: "desc" },
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
        variants: VARIANT_INCLUDE,
        giftsGiven: {
          include: {
            giftProduct: {
              include: {
                productImages: true
              }
            }
          }
        },
        productReviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async rateProduct(productId, userId, ratingValue, comment) {
    console.log(ratingValue)
    // 1. Upsert the review
    await prisma.review.upsert({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
      update: {
        rating: ratingValue,
        comment: comment,
      },
      create: {
        productId,
        userId,
        rating: ratingValue,
        comment: comment,
      },
    });

    // 2. Fetch all reviews for this product to calculate new average
    const aggregations = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const exactAverage = aggregations._avg.rating || 0;
    const reviewCount = aggregations._count.rating || 0;
    console.log(exactAverage)

    // 3. Custom .25 margin rounding logic
    const roundedRating = Math.round(Number(exactAverage) * 2) / 2;
    console.log(roundedRating)

    // 4. Update the Product model
    return await prisma.product.update({
      where: { id: productId },
      data: {
        rating: roundedRating,
        reviews: reviewCount,
      },
      include: {
        productImages: true,
        category: true,
        productReviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      }
    });
  }
}
