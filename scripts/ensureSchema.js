import prisma from '../src/config/prisma.js';

async function main() {
  try {
    console.log('Checking database tables...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;`);
    console.log('Successfully added or verified "imageUrl" column on "Banner" table.');
    
    // Check banners
    const banners = await prisma.banner.findMany({ take: 3 });
    console.log('Sample banners from DB:', banners);
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
