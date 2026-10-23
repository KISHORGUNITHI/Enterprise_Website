import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../src/config/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  const baseUrl = 'https://kishormobiles.in';
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/home`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/products`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/products/trending`, priority: '0.8', changefreq: 'daily' },
    { loc: `${baseUrl}/products/mobiles`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/products/tvs`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/products/acs`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/products/home-theatres`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/products/kitchen`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/products/refrigerators`, priority: '0.8', changefreq: 'weekly' }
  ];

  let productPages = [];
  try {
    const products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    });
    productPages = products.map(p => ({
      loc: `${baseUrl}/product/${p.id}`,
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : now,
      priority: '0.7',
      changefreq: 'weekly'
    }));
  } catch (err) {
    console.warn('Warning: Could not fetch products for sitemap:', err.message);
  }

  const allUrls = [...staticPages, ...productPages];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const item of allUrls) {
    xml += '  <url>\n';
    xml += `    <loc>${item.loc}</loc>\n`;
    if (item.lastmod) xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    if (item.changefreq) xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    if (item.priority) xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';

  const outPath = path.join(__dirname, '../frontend/sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Generated sitemap with ${allUrls.length} URLs at ${outPath}`);
  process.exit(0);
}

generateSitemap().catch(err => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
