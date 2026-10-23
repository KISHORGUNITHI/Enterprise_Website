import http from 'http';

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', reject);
  });
}

async function verify() {
  console.log('--- Starting SEO and Appearance Verification ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  // 1. Landing Page (/)
  const landing = await get('/');
  assert(landing.status === 200, 'Landing page returns HTTP 200');
  assert(landing.body.includes('<title>Kishor Mobiles | Official Electronics Store</title>'), 'Landing has SEO Title');
  assert(landing.body.includes('Shop mobiles, TVs, ACs, refrigerators and home appliances at Kishor Mobiles. Explore products, offers and store information.'), 'Landing has SEO Description');
  assert(landing.body.includes('<link rel="canonical" href="https://kishormobiles.in/" />'), 'Landing has Canonical URL');
  assert(landing.body.includes('href="/assets/images/favicon-48x48.png"'), 'Landing references Google-recommended 48x48 Favicon');
  assert(landing.body.includes('href="/favicon.ico"'), 'Landing references favicon.ico');
  assert(!landing.body.includes('noindex'), 'Landing does NOT have noindex');

  // Landing Schema validation
  const landingJsonLdMatch = landing.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(Boolean(landingJsonLdMatch), 'Landing has JSON-LD script block');
  if (landingJsonLdMatch) {
    try {
      const parsed = JSON.parse(landingJsonLdMatch[1]);
      assert(parsed['@context'] === 'https://schema.org', 'Schema @context is https://schema.org');
      const website = parsed['@graph']?.find(item => item['@type'] === 'WebSite');
      assert(website && website.name === 'Kishor Mobiles', 'Schema WebSite name is "Kishor Mobiles"');
      assert(website && website.alternateName === 'Kishor Enterprises', 'Schema WebSite alternateName is "Kishor Enterprises"');
      assert(website && website.url === 'https://kishormobiles.in/', 'Schema WebSite URL is "https://kishormobiles.in/"');

      const store = parsed['@graph']?.find(item => item['@type'] === 'ElectronicsStore');
      assert(store && store.name === 'Kishor Mobiles', 'Schema ElectronicsStore name is "Kishor Mobiles"');
      assert(store && store.telephone === '+91-9963657799', 'Schema ElectronicsStore phone is verified "+91-9963657799"');
      assert(store && store.address?.postalCode === '532213', 'Schema ElectronicsStore address postal code is "532213"');
      assert(store && store.address?.addressLocality === 'Pathapatnam', 'Schema ElectronicsStore locality is "Pathapatnam"');
    } catch (e) {
      assert(false, 'Landing JSON-LD parses correctly', e.message);
    }
  }

  // 2. Home Page (/home)
  const home = await get('/home');
  assert(home.status === 200, 'Home page (/home) returns HTTP 200');
  assert(home.body.includes('<title>Kishor Mobiles | Official Electronics Store</title>'), 'Home has SEO Title');
  assert(home.body.includes('Shop mobiles, TVs, ACs, refrigerators and home appliances at Kishor Mobiles.'), 'Home has SEO Description');
  assert(home.body.includes('<meta name="robots" content="index, follow"/>'), 'Home has "index, follow" robots tag');
  assert(!home.body.includes('content="noindex"'), 'Home does NOT have accidental noindex tag');
  assert(home.body.includes('<link rel="canonical" href="https://kishormobiles.in/home"/>'), 'Home has Canonical URL');

  // 3. Robots.txt
  const robots = await get('/robots.txt');
  assert(robots.status === 200, 'robots.txt returns HTTP 200');
  assert(robots.body.includes('User-agent: *'), 'robots.txt specifies User-agent: *');
  assert(robots.body.includes('Allow: /'), 'robots.txt allows root public crawl');
  assert(robots.body.includes('Sitemap: https://kishormobiles.in/sitemap.xml'), 'robots.txt points to sitemap.xml');

  // 4. Sitemap.xml
  const sitemap = await get('/sitemap.xml');
  assert(sitemap.status === 200, 'sitemap.xml returns HTTP 200');
  assert(sitemap.headers['content-type']?.includes('xml'), 'sitemap.xml Content-Type is XML');
  assert(sitemap.body.includes('<loc>https://kishormobiles.in/</loc>'), 'sitemap.xml contains root URL');
  assert(sitemap.body.includes('<loc>https://kishormobiles.in/home</loc>'), 'sitemap.xml contains /home');
  assert(sitemap.body.includes('<loc>https://kishormobiles.in/products/mobiles</loc>'), 'sitemap.xml contains /products/mobiles');

  // 5. Favicons & Brand Assets Accessibility
  const icoRes = await get('/favicon.ico');
  assert(icoRes.status === 200, '/favicon.ico is accessible with HTTP 200');

  const p48Res = await get('/assets/images/favicon-48x48.png');
  assert(p48Res.status === 200, '/assets/images/favicon-48x48.png is accessible with HTTP 200');

  const logoPngRes = await get('/assets/images/kishor-mobiles-logo.png');
  assert(logoPngRes.status === 200, '/assets/images/kishor-mobiles-logo.png is accessible with HTTP 200');

  // 6. Category Page (/products/mobiles)
  const category = await get('/products/mobiles');
  assert(category.status === 200, 'Category page /products/mobiles returns HTTP 200');
  assert(category.body.includes('<link rel="canonical" href="https://kishormobiles.in/products/mobiles"/>'), 'Category has Canonical URL');
  assert(category.body.includes('Kishor Mobiles'), 'Category includes brand in title/metadata');

  // 7. Product Detail Page (/product/:id)
  const pdp = await get('/product/cmvcc94120000xse2k6v6z16p');
  assert(pdp.status === 200, 'PDP returns HTTP 200');
  assert(pdp.body.includes('<link rel="canonical" href="https://kishormobiles.in/product/cmvcc94120000xse2k6v6z16p" />'), 'PDP has Canonical URL');
  assert(pdp.body.includes('favicon-48x48.png'), 'PDP references official 48x48 favicon');
  assert(pdp.body.includes('Kishor Mobiles'), 'PDP has brand in metadata');

  console.log(`\n--- Verification Summary: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) process.exit(1);
}

verify().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
