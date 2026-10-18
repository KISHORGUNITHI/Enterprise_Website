import { AdminProductService } from '../src/features/admin/services/AdminProductService.js';
import { AdminProductRepository } from '../src/features/admin/repositories/AdminProductRepository.js';
import { ProductRepository } from '../src/features/products/repositories/productRepository.js';
import prisma from '../src/config/prisma.js';

async function runTests() {
  console.log('--- STARTING OFFERS & GIFTS FEATURE TEST ---');
  const adminService = new AdminProductService();
  try {
    // 1. Fetch available store products
    const products = await prisma.product.findMany({ take: 5 });
    if (products.length < 3) {
      throw new Error('Need at least 3 products in DB to test gifts bundling.');
    }

    const mainProduct = products[0];
    const gift1 = products[1];
    const gift2 = products[2];

    console.log(`Main Product: "${mainProduct.name}" (${mainProduct.id})`);
    console.log(`Gift 1: "${gift1.name}" (${gift1.id})`);
    console.log(`Gift 2: "${gift2.name}" (${gift2.id})`);

    // Clean up any existing gifts for this product first
    await adminService.removeAllGifts(mainProduct.id);
    await adminService.cancelOffer(mainProduct.id);

    // 2. Test updating offer with discount AND 2 gifts
    console.log('\n--- Test 2: Add 15% discount and 2 free gifts (with duplicate prevention test) ---');
    // Deliberately pass duplicate IDs in array to test de-duplication: [gift1.id, gift2.id, gift1.id, mainProduct.id]
    const updateRes = await adminService.updateOffer(mainProduct.id, 15, [gift1.id, gift2.id, gift1.id, mainProduct.id]);
    console.log('Update result message:', updateRes.message);
    console.log('Saved offer:', updateRes.data.offer);
    console.log('Attached gifts count (should be 2, duplicate filtered, self-gift filtered):', updateRes.data.gifts.length);
    if (updateRes.data.gifts.length !== 2) {
      throw new Error(`Expected exactly 2 gifts, but got ${updateRes.data.gifts.length}`);
    }

    // 3. Test active offers and gifts list query
    console.log('\n--- Test 3: Get Active Offers & Gifts list ---');
    const activeRes = await adminService.getActiveOffersAndGifts();
    console.log(`Total active offers/gifts items found: ${activeRes.count}`);
    const foundMain = activeRes.data.find(item => item.id === mainProduct.id);
    if (!foundMain) {
      throw new Error('Main product not found in active offers list!');
    }
    console.log('Found in active list:', {
      name: foundMain.name,
      price: foundMain.price,
      offer: foundMain.offer,
      discountedPrice: foundMain.discountedPrice,
      giftsCount: foundMain.gifts.length,
      giftNames: foundMain.gifts.map(g => g.name)
    });

    // 4. Test Customer Product Detail Query (giftsGiven relation)
    console.log('\n--- Test 4: Customer product query includes gifts ---');
    const custRepo = new ProductRepository();
    const custProd = await custRepo.findByIdOrSlug(mainProduct.slug || mainProduct.id);
    console.log(`Customer view gifts count: ${custProd.giftsGiven ? custProd.giftsGiven.length : 0}`);
    if (!custProd.giftsGiven || custProd.giftsGiven.length !== 2) {
      throw new Error('Customer product query did not return the 2 attached gifts!');
    }

    // 5. Test removing single gift
    console.log('\n--- Test 5: Remove single gift ---');
    const removeRes = await adminService.removeGift(mainProduct.id, gift1.id);
    console.log('Remove gift result:', removeRes.message);
    const activeAfterRemoveOne = await adminService.getActiveOffersAndGifts();
    const mainAfterRemoveOne = activeAfterRemoveOne.data.find(item => item.id === mainProduct.id);
    console.log('Gifts count after removing 1 gift:', mainAfterRemoveOne.gifts.length);
    if (mainAfterRemoveOne.gifts.length !== 1) {
      throw new Error(`Expected 1 gift remaining, got ${mainAfterRemoveOne.gifts.length}`);
    }

    // 6. Test cancelling discount offer (leaving gift intact)
    console.log('\n--- Test 6: Cancel discount offer ---');
    const cancelRes = await adminService.cancelOffer(mainProduct.id);
    console.log('Cancel offer result:', cancelRes.message);
    const activeAfterCancel = await adminService.getActiveOffersAndGifts();
    const mainAfterCancel = activeAfterCancel.data.find(item => item.id === mainProduct.id);
    console.log('Main product after cancelling offer - offer:', mainAfterCancel.offer, 'gifts count:', mainAfterCancel.gifts.length);
    if (mainAfterCancel.offer !== 0 && mainAfterCancel.offer !== null) {
      throw new Error(`Expected offer to be 0 or null, got ${mainAfterCancel.offer}`);
    }

    // 7. Test removing all remaining gifts
    console.log('\n--- Test 7: Remove all gifts ---');
    const removeAllRes = await adminService.removeAllGifts(mainProduct.id);
    console.log('Remove all gifts result:', removeAllRes.message);
    const activeAfterRemoveAll = await adminService.getActiveOffersAndGifts();
    const mainAfterRemoveAll = activeAfterRemoveAll.data.find(item => item.id === mainProduct.id);
    console.log('Main product present in active offers list? (should be undefined):', mainAfterRemoveAll);
    if (mainAfterRemoveAll !== undefined) {
      throw new Error('Product with no offer and no gifts should NOT be in active list!');
    }

    console.log('\n ALL TESTS PASSED SUCCESSFULLY! Everything works flawlessly.');
  } catch (err) {
    console.error(' TEST FAILED:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
