import prisma from '../../../config/prisma.js';

export class AdminBannerRepository {
  /**
   * Find all banners with filters and ordering
   */
  async findAll(where = {}, orderBy = { createdAt: 'desc' }) {
    return prisma.banner.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaText: true,
        slug: true,
        badge: true,
        imageUrl: true,
        status: true,
        bgGradient: true,
        accentColor: true,
        displayOrder: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Find banner by ID
   */
  async findById(id) {
    return prisma.banner.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaText: true,
        slug: true,
        badge: true,
        imageUrl: true,
        status: true,
        bgGradient: true,
        accentColor: true,
        displayOrder: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Find banner by slug
   */
  async findBySlug(slug) {
    return prisma.banner.findFirst({
      where: { slug }
    });
  }

  /**
   * Create a new banner
   */
  async create(data) {
    return prisma.banner.create({
      data,
      select: {
        id: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaText: true,
        slug: true,
        badge: true,
        imageUrl: true,
        status: true,
        bgGradient: true,
        accentColor: true,
        displayOrder: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Update banner by ID
   */
  async update(id, data) {
    return prisma.banner.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaText: true,
        slug: true,
        badge: true,
        imageUrl: true,
        status: true,
        bgGradient: true,
        accentColor: true,
        displayOrder: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Toggle banner status
   */
  async toggleStatus(id) {
    const banner = await prisma.banner.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!banner) return null;

    const newStatus = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return prisma.banner.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaText: true,
        slug: true,
        badge: true,
        imageUrl: true,
        status: true,
        bgGradient: true,
        accentColor: true,
        displayOrder: true,
        clicks: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Delete banner by ID
   */
  async remove(id) {
    return prisma.banner.delete({
      where: { id }
    });
  }
}
