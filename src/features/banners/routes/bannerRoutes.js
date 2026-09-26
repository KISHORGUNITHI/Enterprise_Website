import express from 'express';
import prisma from '../../../config/prisma.js';

const router = express.Router();

/**
 * GET /api/banners
 * Public endpoint to fetch active banners for storefront.
 * Optional query parameter: category (e.g. 'all', 'mobiles', 'tvs', 'acs', 'home-theatres')
 */
router.get('/banners', async (req, res) => {
  try {
    const rawCategory = (req.query.category || req.query.slug || 'all').trim().toLowerCase();
    
    // Normalize category slug
    let category = rawCategory;
    if (category === 'home' || category === 'all') {
      category = 'all';
    } else if (category === 'mobile') {
      category = 'mobiles';
    } else if (category === 'tv') {
      category = 'tvs';
    } else if (category === 'ac' || category === 'air-conditioners') {
      category = 'acs';
    } else if (category === 'home-theatre' || category === 'home-theater' || category === 'home-theaters') {
      category = 'home-theatres';
    }

    const where = {
      status: 'ACTIVE'
    };

    // If category is not 'all', filter by target category/slug
    if (category !== 'all') {
      where.OR = [
        { slug: { equals: category, mode: 'insensitive' } },
        { slug: { startsWith: `${category}-`, mode: 'insensitive' } },
        { slug: { contains: category, mode: 'insensitive' } },
        // Also allow storewide banners marked with 'all' if category-specific fallback needed
      ];
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // If a category was requested but has no specific banners, return active storewide 'all' banners as fallback
    let resultBanners = banners;
    if (category !== 'all' && banners.length === 0) {
      const fallbackBanners = await prisma.banner.findMany({
        where: {
          status: 'ACTIVE',
          slug: { in: ['all', 'home'] }
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ]
      });
      resultBanners = fallbackBanners;
    }

    return res.json({
      success: true,
      category,
      count: resultBanners.length,
      data: resultBanners
    });
  } catch (err) {
    console.error('Error fetching public banners:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: err.message
    });
  }
});

/**
 * POST /api/banners/:id/click
 * Increment click count for analytics
 */
router.post('/banners/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.update({
      where: { id },
      data: { clicks: { increment: 1 } },
      select: { id: true, clicks: true }
    });
    return res.json({ success: true, banner });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
