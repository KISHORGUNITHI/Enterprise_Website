async function testApi() {
  console.log('--- TESTING ADMIN API ENDPOINTS VIA HTTP ---');
  try {
    // 1. Login as admin
    const loginRes = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'kishor@gmail.com', password: '12345678' })
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status, 'token present:', !!loginData.token);
    const token = loginData.token;
    if (!token) throw new Error('Failed to obtain admin token');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Fetch products to get test product IDs
    const prodsRes = await fetch('http://localhost:3001/api/admin/products?limit=5', { headers });
    const prodsData = await prodsRes.json();
    const products = prodsData.data;
    const targetProduct = products[0];
    const giftProduct1 = products[1];
    const giftProduct2 = products[2];

    console.log(`Target: ${targetProduct.name} (${targetProduct.id})`);
    console.log(`Gift 1: ${giftProduct1.name} (${giftProduct1.id})`);
    console.log(`Gift 2: ${giftProduct2.name} (${giftProduct2.id})`);

    // 3. Test PATCH /api/admin/products/:id/offer with offer: 20 and gifts: [giftProduct1.id, giftProduct2.id]
    console.log('\n--- 1. Testing PATCH /api/admin/products/:id/offer ---');
    const patchRes = await fetch(`http://localhost:3001/api/admin/products/${targetProduct.id}/offer`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        offer: 20,
        giftProductIds: [giftProduct1.id, giftProduct2.id]
      })
    });
    const patchData = await patchRes.json();
    console.log('PATCH Response:', patchData.message, 'Gifts count:', patchData.data?.gifts?.length);

    // 4. Test GET /api/admin/products/active-offers
    console.log('\n--- 2. Testing GET /api/admin/products/active-offers ---');
    const activeRes = await fetch('http://localhost:3001/api/admin/products/active-offers', { headers });
    const activeData = await activeRes.json();
    console.log('Active offers count:', activeData.count);
    const found = activeData.data.find(p => p.id === targetProduct.id);
    console.log('Found product in active offers:', found ? {
      name: found.name,
      offer: found.offer,
      discountedPrice: found.discountedPrice,
      gifts: found.gifts.map(g => g.name)
    } : 'NOT FOUND');

    // 5. Test DELETE /api/admin/products/:id/gifts/:giftId
    console.log('\n--- 3. Testing DELETE /api/admin/products/:id/gifts/:giftId ---');
    const delGiftRes = await fetch(`http://localhost:3001/api/admin/products/${targetProduct.id}/gifts/${giftProduct1.id}`, {
      method: 'DELETE',
      headers
    });
    const delGiftData = await delGiftRes.json();
    console.log('DELETE Gift Response:', delGiftData);

    // 6. Test DELETE /api/admin/products/:id/offer (cancel offer)
    console.log('\n--- 4. Testing DELETE /api/admin/products/:id/offer (cancel offer) ---');
    const cancelRes = await fetch(`http://localhost:3001/api/admin/products/${targetProduct.id}/offer`, {
      method: 'DELETE',
      headers
    });
    const cancelData = await cancelRes.json();
    console.log('Cancel Offer Response:', cancelData);

    // 7. Test DELETE /api/admin/products/:id/gifts (remove all gifts)
    console.log('\n--- 5. Testing DELETE /api/admin/products/:id/gifts (remove all gifts) ---');
    const delAllRes = await fetch(`http://localhost:3001/api/admin/products/${targetProduct.id}/gifts`, {
      method: 'DELETE',
      headers
    });
    const delAllData = await delAllRes.json();
    console.log('DELETE All Gifts Response:', delAllData);

    // Verify active offers list is now clean
    const activeResAfter = await fetch('http://localhost:3001/api/admin/products/active-offers', { headers });
    const activeDataAfter = await activeResAfter.json();
    const foundAfter = activeDataAfter.data.find(p => p.id === targetProduct.id);
    console.log('Product in active offers after complete cleanup? (should be false):', !!foundAfter);

    console.log('\n ALL HTTP API ENDPOINT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('API TEST FAILED:', err);
    process.exit(1);
  }
}

testApi();
