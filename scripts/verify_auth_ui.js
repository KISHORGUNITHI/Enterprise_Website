import jwt from 'jsonwebtoken';
import 'dotenv/config';

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('=== TEST 1: LOGGED-OUT STATE ===');
  const publicPages = [
    '/',
    '/home',
    '/products',
    '/products/mobiles',
    '/products/trending',
    '/product/1'
  ];

  for (const path of publicPages) {
    const res = await fetch(`${BASE_URL}${path}`);
    const html = await res.text();
    const hasLogout = /id=["'](hdrLogoutBtn|hdrMobileLogoutBtn|catHdrLogoutBtn|catMobileLogoutBtn|navLogoutBtn)["']/.test(html);
    const hasLogin = /id=["'](hdrLoginBtn|hdrMobileLoginBtn|catHdrLoginBtn|catMobileLoginBtn|navbarLoginBtn)["']/.test(html);
    const hasFooterLogout = /id=["']footerLogoutLi["']/.test(html);
    const hasFooterLogin = /id=["']footerLoginLi["']/.test(html);

    console.log(
      path.padEnd(20),
      `Status: ${res.status}`,
      `| Header Login: ${hasLogin}`,
      `| Header Logout: ${hasLogout}`,
      `| Footer Login: ${hasFooterLogin}`,
      `| Footer Logout: ${hasFooterLogout}`
    );
  }

  console.log('\n=== TEST 2: PROTECTED ROUTES WHEN LOGGED OUT ===');
  const protectedPages = ['/checkout', '/orders', '/profile', '/admin/dashboard'];
  for (const path of protectedPages) {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    console.log(
      path.padEnd(20),
      `Status: ${res.status}`,
      `Redirects to: ${location}`
    );
  }

  console.log('\n=== TEST 3: LOGGED-IN CUSTOMER STATE ===');
  const customerToken = jwt.sign(
    { userId: 'test-user-123', email: 'customer@test.com', role: 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const customerCookie = `authToken=${customerToken}`;

  for (const path of [...publicPages, '/checkout', '/orders', '/profile']) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Cookie: customerCookie }
    });
    const html = await res.text();
    const hasLogout = /id=["'](hdrLogoutBtn|hdrMobileLogoutBtn|catHdrLogoutBtn|catMobileLogoutBtn|navLogoutBtn)["']/.test(html);
    const hasLogin = /id=["'](hdrLoginBtn|hdrMobileLoginBtn|catHdrLoginBtn|catMobileLoginBtn|navbarLoginBtn)["']/.test(html);
    const hasAdmin = /id=["'](hdrAdminBtn|catHdrAdminBtn|navAdminBtn)["']/.test(html);
    const hasFooterLogout = /id=["']footerLogoutLi["']/.test(html);
    const hasFooterLogin = /id=["']footerLoginLi["']/.test(html);

    console.log(
      path.padEnd(20),
      `Status: ${res.status}`,
      `| Header Logout: ${hasLogout}`,
      `| Header Login: ${hasLogin}`,
      `| Admin Btn: ${hasAdmin}`,
      `| Footer Logout: ${hasFooterLogout}`
    );
  }

  console.log('\n=== TEST 4: LOGGED-IN ADMIN STATE ===');
  const adminToken = jwt.sign(
    { userId: 'admin-user-999', email: 'admin@test.com', role: 'ADMIN' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  const adminCookie = `authToken=${adminToken}`;

  for (const path of ['/home', '/products', '/admin/dashboard']) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Cookie: adminCookie }
    });
    const html = await res.text();
    const hasLogout = /id=["'](hdrLogoutBtn|hdrMobileLogoutBtn|catHdrLogoutBtn|catMobileLogoutBtn|navLogoutBtn)["']/.test(html);
    const hasAdmin = /id=["'](hdrAdminBtn|catHdrAdminBtn|navAdminBtn)["']/.test(html);

    console.log(
      path.padEnd(20),
      `Status: ${res.status}`,
      `| Header Logout: ${hasLogout}`,
      `| Admin Btn: ${hasAdmin}`
    );
  }

  console.log('\n=== TEST 5: INVALID / EXPIRED TOKEN ===');
  const expiredToken = jwt.sign(
    { userId: 'expired-user', email: 'expired@test.com', role: 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '0s' }
  );
  const expiredCookie = `authToken=${expiredToken}`;
  const expiredRes = await fetch(`${BASE_URL}/home`, {
    headers: { Cookie: expiredCookie }
  });
  const expiredHtml = await expiredRes.text();
  const expLogout = /id=["'](hdrLogoutBtn|hdrMobileLogoutBtn|catHdrLogoutBtn|catMobileLogoutBtn|navLogoutBtn)["']/.test(expiredHtml);
  const expLogin = /id=["'](hdrLoginBtn|hdrMobileLoginBtn|catHdrLoginBtn|catMobileLoginBtn|navbarLoginBtn)["']/.test(expiredHtml);
  console.log('/home with expired token:', `Header Login: ${expLogin}`, `Header Logout: ${expLogout}`);

  console.log('\n=== TEST 6: GET /logout ===');
  const logoutRes = await fetch(`${BASE_URL}/logout`, { redirect: 'manual' });
  console.log('GET /logout Status:', logoutRes.status, 'Location:', logoutRes.headers.get('location'), 'Set-Cookie:', logoutRes.headers.get('set-cookie'));
}

runTests();
