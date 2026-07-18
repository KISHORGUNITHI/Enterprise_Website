/**
 * orders-data.js — Mock orders for the Orders page.
 * Future: replace with GET /api/orders
 */

const ordersData = [
  {
    id: 'ES-2025-001847',
    date: '12 Jul 2025',
    product: {
      name: 'Samsung Galaxy S25 Ultra 5G',
      brand: 'Samsung',
      category: 'Mobiles',
      variant: '256GB · Titanium Black',
      color: '#1e3d8f',
    },
    price: 134999,
    status: 'delivered',
    deliveryDate: '15 Jul 2025',
    address: '42, MG Road, Banjara Hills, Hyderabad, Telangana — 500034',
    timeline: [
      { label: 'Order Placed',     date: '12 Jul 2025, 3:42 PM',  done: true  },
      { label: 'Confirmed',        date: '12 Jul 2025, 4:10 PM',  done: true  },
      { label: 'Packed',           date: '13 Jul 2025, 10:00 AM', done: true  },
      { label: 'Out for Delivery', date: '15 Jul 2025, 9:30 AM',  done: true  },
      { label: 'Delivered',        date: '15 Jul 2025, 2:15 PM',  done: true  },
    ],
  },
  {
    id: 'ES-2025-001821',
    date: '8 Jul 2025',
    product: {
      name: 'Apple iPhone 16 Pro Max',
      brand: 'Apple',
      category: 'Mobiles',
      variant: '512GB · Natural Titanium',
      color: '#374151',
    },
    price: 159900,
    status: 'out_for_delivery',
    deliveryDate: '16 Jul 2025',
    address: '42, MG Road, Banjara Hills, Hyderabad, Telangana — 500034',
    timeline: [
      { label: 'Order Placed',     date: '8 Jul 2025, 11:20 AM',  done: true  },
      { label: 'Confirmed',        date: '8 Jul 2025, 11:45 AM',  done: true  },
      { label: 'Packed',           date: '9 Jul 2025, 2:00 PM',   done: true  },
      { label: 'Out for Delivery', date: '16 Jul 2025, 8:00 AM',  done: true  },
      { label: 'Delivered',        date: 'Expected by 7 PM',      done: false },
    ],
  },
  {
    id: 'ES-2025-001794',
    date: '5 Jul 2025',
    product: {
      name: 'LG OLED C3 65" Smart TV',
      brand: 'LG',
      category: 'TVs',
      variant: '65 inch · 4K · OLED',
      color: '#b85e00',
    },
    price: 159990,
    status: 'confirmed',
    deliveryDate: '18 Jul 2025',
    address: '42, MG Road, Banjara Hills, Hyderabad, Telangana — 500034',
    timeline: [
      { label: 'Order Placed',     date: '5 Jul 2025, 6:00 PM',   done: true  },
      { label: 'Confirmed',        date: '5 Jul 2025, 6:30 PM',   done: true  },
      { label: 'Packed',           date: 'In progress',           done: false },
      { label: 'Out for Delivery', date: '—',                     done: false },
      { label: 'Delivered',        date: 'Expected 18 Jul 2025',  done: false },
    ],
  },
  {
    id: 'ES-2025-001762',
    date: '1 Jul 2025',
    product: {
      name: 'Daikin 1.5 Ton 5★ Inverter Split AC',
      brand: 'Daikin',
      category: 'Air Conditioners',
      variant: '1.5 Ton · 5 Star · Inverter',
      color: '#0369a1',
    },
    price: 44990,
    status: 'processing',
    deliveryDate: '20 Jul 2025',
    address: '42, MG Road, Banjara Hills, Hyderabad, Telangana — 500034',
    timeline: [
      { label: 'Order Placed',     date: '1 Jul 2025, 2:15 PM',   done: true  },
      { label: 'Confirmed',        date: 'Processing',            done: false },
      { label: 'Packed',           date: '—',                     done: false },
      { label: 'Out for Delivery', date: '—',                     done: false },
      { label: 'Delivered',        date: 'Expected 20 Jul 2025',  done: false },
    ],
  },
  {
    id: 'ES-2025-001703',
    date: '20 Jun 2025',
    product: {
      name: 'Bosch 559L Multi Door Refrigerator',
      brand: 'Bosch',
      category: 'Refrigerators',
      variant: '559L · Silver · 5 Star',
      color: '#374151',
    },
    price: 79990,
    status: 'cancelled',
    deliveryDate: '—',
    address: '42, MG Road, Banjara Hills, Hyderabad, Telangana — 500034',
    timeline: [
      { label: 'Order Placed',     date: '20 Jun 2025, 10:00 AM', done: true  },
      { label: 'Confirmed',        date: '20 Jun 2025, 10:30 AM', done: true  },
      { label: 'Cancelled',        date: '21 Jun 2025, 9:00 AM',  done: true  },
      { label: 'Packed',           date: '—',                     done: false },
      { label: 'Delivered',        date: '—',                     done: false },
    ],
  },
];

window.ordersData = ordersData;
