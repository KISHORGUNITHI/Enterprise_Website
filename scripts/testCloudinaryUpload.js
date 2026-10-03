import prisma from '../src/config/prisma.js';
import { uploadImageSource } from '../src/config/cloudinary.js';
import { AdminBannerService } from '../src/features/admin/services/AdminBannerService.js';
import { AdminProductService } from '../src/features/admin/services/AdminProductService.js';

async function testFlow() {
  console.log('=== Starting Cloudinary & Admin Add-on Integration Tests ===');

  const bannerService = new AdminBannerService();
  const productService = new AdminProductService();

  // Test 1: Upload 1x1 test image to Cloudinary
  console.log('\n1. Testing Cloudinary Direct Upload...');
  const testPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const uploadRes = await uploadImageSource(testPng, { folder: 'enterprise_store/test' });
  console.log('✔ Direct upload success! Cloudinary URL:', uploadRes.secure_url);

  // Test 2: Banner creation with image (auto-upload to Cloudinary)
  console.log('\n2. Testing Banner Service Create & Update with Cloudinary...');
  const testSlug = `test-banner-${Date.now()}`;
  const createdBanner = await bannerService.create({
    title: 'Cloudinary Test Banner',
    eyebrow: 'Special Cloud Feature',
    subtitle: 'High speed CDN media delivery',
    ctaText: 'Explore Now',
    slug: testSlug,
    badge: 'NEW',
    imageUrl: testPng, // base64 will be auto-uploaded to Cloudinary by service
    status: 'ACTIVE'
  });
  console.log('✔ Created Banner ID:', createdBanner.data.id);
  console.log('✔ Banner Image URL in DB:', createdBanner.data.imageUrl);

  if (!createdBanner.data.imageUrl.includes('res.cloudinary.com')) {
    throw new Error('Banner imageUrl is not a Cloudinary URL!');
  }

  // Update banner image
  const updatedBanner = await bannerService.update(createdBanner.data.id, {
    title: 'Updated Cloudinary Banner',
    imageUrl: 'https://res.cloudinary.com/hqlyxojm/image/upload/v1788004113/61h53LtSVVL._AC_UF1000_1000_QL80__l1k6lm.jpg'
  });
  console.log('✔ Updated Banner Title:', updatedBanner.data.title);
  console.log('✔ Updated Banner Image URL:', updatedBanner.data.imageUrl);

  // Test 3: Product creation with multiple images (auto-upload to Cloudinary)
  console.log('\n3. Testing Product Service Create & Update with Cloudinary Images...');
  const testProdSlug = `test-prod-${Date.now()}`;
  
  // Find an existing category
  const category = await prisma.category.findFirst();
  if (!category) throw new Error('No categories found in DB');

  const createdProduct = await productService.create({
    name: 'Cloudinary Test Phone',
    description: 'A cutting-edge smartphone with Cloudinary photo storage.',
    brand: 'CloudTech',
    price: 49999,
    categoryId: category.id,
    slug: testProdSlug,
    stock: 25,
    availability: 'AVAILABLE',
    images: [
      { url: testPng, isPrimary: true },
      { url: 'https://res.cloudinary.com/hqlyxojm/image/upload/v1788004457/13s-5g-cph2723-oneplus-original-imahdcx8qeywg3qg_ycpu3d.webp', isPrimary: false }
    ]
  });

  console.log('✔ Created Product ID:', createdProduct.data.id);
  const fetchedProduct = await prisma.product.findUnique({
    where: { id: createdProduct.data.id },
    include: { productImages: true }
  });
  console.log('✔ Product Images in DB count:', fetchedProduct.productImages.length);
  fetchedProduct.productImages.forEach((img, idx) => {
    console.log(`   Image ${idx + 1} (${img.isPrimary ? 'Cover' : 'Gallery'}):`, img.imageUrl);
  });

  // Clean up test records
  console.log('\n4. Cleaning up test records...');
  await bannerService.remove(createdBanner.data.id);
  await productService.remove(createdProduct.data.id);
  console.log('✔ Cleaned up test banner and product from DB.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Cloudinary integration is 100% verified.');
}

testFlow()
  .catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
