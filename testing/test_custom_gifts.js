import { AdminProductService } from '../src/features/admin/services/AdminProductService.js';
import { ProductRepository } from '../src/features/products/repositories/productRepository.js';
import prisma from '../src/config/prisma.js';

async function runCustomGiftTests() {
  console.log('--- STARTING CUSTOM NON-STORE GIFTS TESTS ---');
  const adminService = new AdminProductService();
  const productRepo = new ProductRepository();

  try {
    const products = await prisma.product.findMany({ take: 3 });
    if (products.length < 2) {
      throw new Error('Need at least 2 products in DB.');
    }

    const mainProduct = products[0];
    const storeGift = products[1];

    console.log(`Main Product: "${mainProduct.name}" (${mainProduct.id})`);
    console.log(`Store Gift: "${storeGift.name}" (${storeGift.id})`);

    // Clean up existing gifts
    await adminService.removeAllGifts(mainProduct.id);

    // 1. Test adding:
    //    - 1 store product
    //    - 1 custom gift WITH image
    //    - 1 custom gift WITHOUT image (text only)
    console.log('\n--- Test 1: Add mixed store gift + custom gift with image + custom gift text-only ---');
    const customWithImage = {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      customGiftName: 'Sony WH-1000XM5 Wireless Headphones',
      customGiftImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      isCustom: true
    };
    const customTextOnly = {
      name: 'Special Leather Laptop Backpack (Text Only)',
      customGiftName: 'Special Leather Laptop Backpack (Text Only)',
      customGiftImage: null,
      isCustom: true
    };

    const updateRes = await adminService.updateOffer(mainProduct.id, 10, [
      storeGift.id,
      customWithImage,
      customTextOnly
    ]);

    console.log('Update message:', updateRes.message);
    console.log('Gifts count returned:', updateRes.data.gifts.length);
    if (updateRes.data.gifts.length !== 3) {
      throw new Error(`Expected 3 gifts, got ${updateRes.data.gifts.length}`);
    }

    // Check each gift properties
    const resStore = updateRes.data.gifts.find(g => !g.isCustom);
    const resCustomImg = updateRes.data.gifts.find(g => g.isCustom && g.primaryImage);
    const resCustomText = updateRes.data.gifts.find(g => g.isCustom && !g.primaryImage);

    console.log('Store gift verified:', Boolean(resStore && resStore.name === storeGift.name));
    console.log('Custom gift with image verified:', Boolean(resCustomImg && resCustomImg.primaryImage.includes('unsplash')));
    console.log('Custom text-only gift verified:', Boolean(resCustomText && !resCustomText.primaryImage));

    if (!resStore || !resCustomImg || !resCustomText) {
      throw new Error('Gift types mismatch in returned data!');
    }

    // 2. Test Customer Product Query (findbyIdOrSlug)
    console.log('\n--- Test 2: Customer product query includes custom gifts ---');
    const custProd = await productRepo.findByIdOrSlug(mainProduct.id);
    console.log('Customer view giftsGiven count:', custProd.giftsGiven.length);
    if (custProd.giftsGiven.length !== 3) {
      throw new Error(`Expected customer query to return 3 gifts, got ${custProd.giftsGiven.length}`);
    }

    const customGiftFound = custProd.giftsGiven.find(g => g.customGiftName === customWithImage.name);
    console.log('Custom gift in customer query has image:', customGiftFound?.customGiftImage);
    if (!customGiftFound || !customGiftFound.customGiftImage) {
      throw new Error('Customer query missing custom gift fields!');
    }

    // 3. Test Active Offers List query
    console.log('\n--- Test 3: Active offers list query includes custom gifts ---');
    const activeRes = await adminService.getActiveOffersAndGifts();
    const activeMain = activeRes.data.find(i => i.id === mainProduct.id);
    console.log('Active main product gifts count:', activeMain?.gifts?.length);
    if (!activeMain || activeMain.gifts.length !== 3) {
      throw new Error('Active offers list did not return all 3 gifts!');
    }

    // 4. Test removing single custom gift by its link ID
    console.log('\n--- Test 4: Remove single custom gift by ID ---');
    const customLinkId = resCustomImg.giftLinkId;
    await adminService.removeGift(mainProduct.id, customLinkId);
    const giftsAfterRemoveOne = await adminService.repository.getProductGifts(mainProduct.id);
    console.log('Gifts count after removing custom gift:', giftsAfterRemoveOne.length);
    if (giftsAfterRemoveOne.length !== 2) {
      throw new Error(`Expected 2 gifts after removal, got ${giftsAfterRemoveOne.length}`);
    }

    // 5. Cleanup
    await adminService.removeAllGifts(mainProduct.id);
    await adminService.cancelOffer(mainProduct.id);
    console.log('\n✅ ALL CUSTOM GIFT TESTS PASSED FLAWLESSLY!');
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCustomGiftTests();
