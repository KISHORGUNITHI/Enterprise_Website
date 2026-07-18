/**
 * product-data.js — Dummy product catalogue for the PDP.
 * window.productCatalogue[id] returns the full product object.
 * Future: replace with API call GET /api/products/:id
 */

const productCatalogue = {

  /* ── Mobiles ── */
  201: {
    id: 201, category: 'mobiles', brand: 'Samsung', name: 'Galaxy S24 Ultra 5G',
    tagline: '200MP Camera · Titanium Frame · S Pen Included',
    originalPrice: 134999, salePrice: 119999, discount: 11,
    rating: 4.8, reviews: 3240,
    colors: [
      { label: 'Titanium Black',  hex: '#1c1c1e', images: [] },
      { label: 'Titanium Gray',   hex: '#8e8e93', images: [] },
      { label: 'Titanium Violet', hex: '#6e6278', images: [] },
      { label: 'Titanium Yellow', hex: '#f4d03f', images: [] },
    ],
    variants: [
      { group: 'Storage', options: ['256GB', '512GB', '1TB'] },
      { group: 'RAM',     options: ['12GB'] },
    ],
    highlights: [
      '200MP Adaptive Pixel Camera with AI zoom',
      '6.8-inch Dynamic AMOLED 2X, 120Hz display',
      'Snapdragon 8 Gen 3 — fastest mobile processor',
      'Built-in S Pen with 2.8ms latency',
      '5000mAh battery with 45W fast charging',
      'Official Samsung warranty — 1 Year',
    ],
    description: 'The Samsung Galaxy S24 Ultra is the pinnacle of Android smartphone engineering. Built with a premium Titanium frame and featuring the most advanced camera system Samsung has ever created, it delivers photography, productivity, and performance that sets a new standard. The integrated S Pen transforms the device into a powerful creative and productivity tool, while the latest Snapdragon 8 Gen 3 chip ensures blazing-fast performance across every task.',
    specs: [
      { group: 'General',      rows: [['Brand', 'Samsung'], ['Model', 'Galaxy S24 Ultra'], ['Color', 'Titanium Black'], ['OS', 'Android 14']] },
      { group: 'Display',      rows: [['Size', '6.8 inches'], ['Type', 'Dynamic AMOLED 2X'], ['Resolution', '3088 × 1440 QHD+'], ['Refresh Rate', '1–120Hz Adaptive']] },
      { group: 'Performance',  rows: [['Processor', 'Snapdragon 8 Gen 3'], ['RAM', '12GB'], ['Storage', '256GB / 512GB / 1TB'], ['GPU', 'Adreno 750']] },
      { group: 'Camera',       rows: [['Rear', '200MP + 50MP + 12MP + 10MP'], ['Front', '12MP'], ['Video', '8K@30fps, 4K@120fps']] },
      { group: 'Battery',      rows: [['Capacity', '5000mAh'], ['Charging', '45W Wired, 15W Wireless'], ['Battery Life', 'Up to 27 hours']] },
      { group: 'Dimensions',   rows: [['Height', '162.3 mm'], ['Width', '79.0 mm'], ['Depth', '8.6 mm'], ['Weight', '232 g']] },
      { group: 'Warranty',     rows: [['Brand Warranty', '1 Year'], ['Service', 'Authorised Samsung Service']] },
    ],
    delivery: { date: 'Tomorrow', note: 'Order before 8 PM', pickup: true, installation: false, free: true },
    emi: { from: 9999, months: 12 },
    relatedCategory: 'mobiles',
  },

  202: {
    id: 202, category: 'mobiles', brand: 'Apple', name: 'iPhone 15 Pro Max',
    tagline: '48MP Camera System · Titanium Design · Action Button',
    originalPrice: 159900, salePrice: 149900, discount: 6,
    rating: 4.9, reviews: 4820,
    colors: [
      { label: 'Natural Titanium', hex: '#8e8e8e', images: [] },
      { label: 'Blue Titanium',    hex: '#4a5e7a', images: [] },
      { label: 'White Titanium',   hex: '#e5e5e5', images: [] },
      { label: 'Black Titanium',   hex: '#1a1a1a', images: [] },
    ],
    variants: [
      { group: 'Storage', options: ['256GB', '512GB', '1TB'] },
    ],
    highlights: [
      'A17 Pro chip — first 3-nanometre chip in a smartphone',
      '48MP Main camera with new 5x Tetraprism zoom',
      '6.7-inch Super Retina XDR ProMotion display',
      'Titanium design — stronger and lighter',
      'USB 3 — up to 20x faster transfer speeds',
      '1 Year Official Apple Warranty',
    ],
    description: 'iPhone 15 Pro Max. The most powerful iPhone ever. Crafted from aerospace-grade titanium, it\'s the lightest Pro Max ever. The A17 Pro chip unleashes incredible performance and makes console-quality gaming a reality. With the 48MP Main camera, a new 5x Tetraprism telephoto, and computational photography backed by Apple Intelligence, it captures moments with extraordinary detail.',
    specs: [
      { group: 'General',      rows: [['Brand', 'Apple'], ['Model', 'iPhone 15 Pro Max'], ['OS', 'iOS 17']] },
      { group: 'Display',      rows: [['Size', '6.7 inches'], ['Type', 'Super Retina XDR OLED'], ['Resolution', '2796 × 1290'], ['Refresh Rate', '1–120Hz ProMotion']] },
      { group: 'Performance',  rows: [['Chip', 'Apple A17 Pro'], ['RAM', '8GB'], ['Storage', '256GB / 512GB / 1TB']] },
      { group: 'Camera',       rows: [['Main', '48MP f/1.78'], ['Ultrawide', '12MP f/2.2'], ['Telephoto', '12MP 5x Zoom'], ['Front', '12MP TrueDepth']] },
      { group: 'Battery',      rows: [['Capacity', '4422mAh'], ['Charging', '27W Wired, 15W MagSafe']] },
      { group: 'Dimensions',   rows: [['Height', '159.9 mm'], ['Width', '76.7 mm'], ['Depth', '8.25 mm'], ['Weight', '221 g']] },
      { group: 'Warranty',     rows: [['Brand Warranty', '1 Year'], ['Service', 'Authorised Apple Reseller']] },
    ],
    delivery: { date: 'Tomorrow', note: 'Order before 8 PM', pickup: true, installation: false, free: true },
    emi: { from: 12492, months: 12 },
    relatedCategory: 'mobiles',
  },

  /* ── TVs ── */
  301: {
    id: 301, category: 'tvs', brand: 'Samsung', name: 'Neo QLED 8K 75"',
    tagline: '8K AI Upscaling · Neo Quantum Processor · Dolby Atmos',
    originalPrice: 349999, salePrice: 299999, discount: 14,
    rating: 4.8, reviews: 320,
    colors: [{ label: 'Carbon Black', hex: '#1a1a1a', images: [] }],
    variants: [
      { group: 'Screen Size', options: ['65"', '75"', '85"'] },
      { group: 'Resolution',  options: ['8K'] },
    ],
    highlights: [
      'Neo Quantum Processor 8K with AI upscaling',
      'Neo Quantum Mini LED backlight technology',
      'Dolby Atmos & Object Tracking Sound+',
      'Samsung Gaming Hub with cloud gaming',
      'Multiple HDMI 2.1 ports for 4K@144Hz gaming',
      '1 Year Samsung Official Warranty',
    ],
    description: 'The Samsung Neo QLED 8K television represents the absolute pinnacle of display technology. Powered by the Neo Quantum Processor 8K, it upscales every piece of content to near 8K quality using AI. Thousands of individually controlled Mini LED cells deliver stunning contrast and brightness that makes every scene look cinematic.',
    specs: [
      { group: 'Display',      rows: [['Size', '75 inches'], ['Type', 'Neo QLED'], ['Resolution', '7680 × 4320 (8K)'], ['HDR', 'HDR10+, HLG']] },
      { group: 'Sound',        rows: [['Output', '70W'], ['System', 'Dolby Atmos, Object Tracking Sound+']] },
      { group: 'Smart',        rows: [['OS', 'Tizen OS'], ['Voice', 'Bixby, Alexa, Google Assistant'], ['Connectivity', 'Wi-Fi 6, Bluetooth 5.2']] },
      { group: 'Connections',  rows: [['HDMI', '4 × HDMI 2.1'], ['USB', '3 × USB 3.0'], ['Other', 'LAN, Optical']] },
      { group: 'Dimensions',   rows: [['With Stand', '1663 × 1035 × 432 mm'], ['Without Stand', '1663 × 963 × 26 mm'], ['Weight', '47.5 kg']] },
      { group: 'Warranty',     rows: [['Brand Warranty', '1 Year'], ['Panel', '1 Year Panel Warranty']] },
    ],
    delivery: { date: 'In 2–3 days', note: 'Free home delivery', pickup: true, installation: true, free: true },
    emi: { from: 24999, months: 12 },
    relatedCategory: 'tvs',
  },

  /* ── ACs ── */
  401: {
    id: 401, category: 'acs', brand: 'Daikin', name: '1.5T 5★ Inverter Split AC',
    tagline: 'Streamer Technology · PM 2.5 Filter · Auto Restart',
    originalPrice: 52990, salePrice: 44990, discount: 15,
    rating: 4.7, reviews: 1450,
    colors: [{ label: 'White', hex: '#f5f5f5', images: [] }],
    variants: [
      { group: 'Capacity', options: ['1 Ton', '1.5 Ton', '2 Ton'] },
      { group: 'Star Rating', options: ['3 Star', '5 Star'] },
      { group: 'Inverter', options: ['Yes'] },
    ],
    highlights: [
      '5-Star BEE rating for maximum energy savings',
      'Daikin Streamer technology for air purification',
      'PM 2.5 filter removes fine particulates',
      'Auto Restart after power cut',
      'Self-cleaning function for coil hygiene',
      'Free installation by certified Daikin technician',
    ],
    description: 'The Daikin 1.5 Ton 5-Star Inverter Split AC delivers whisper-quiet, energy-efficient cooling for medium-sized rooms. Its advanced Streamer discharge technology continuously produces radicals that deactivate allergens, bacteria, and viruses in the air, making it perfect for families with health concerns.',
    specs: [
      { group: 'General',      rows: [['Brand', 'Daikin'], ['Capacity', '1.5 Ton'], ['Type', 'Split AC'], ['Star Rating', '5 Star BEE']] },
      { group: 'Cooling',      rows: [['Cooling Capacity', '5100W'], ['Compressor', 'Rotary Inverter'], ['Refrigerant', 'R-32 Eco-Friendly'], ['ISEER', '5.10']] },
      { group: 'Features',     rows: [['Filter', 'PM 2.5 + Streamer'], ['Self Clean', 'Yes'], ['Auto Restart', 'Yes'], ['Sleep Mode', 'Yes']] },
      { group: 'Noise',        rows: [['Indoor', '32 dB'], ['Outdoor', '48 dB']] },
      { group: 'Dimensions',   rows: [['Indoor Unit', '845 × 300 × 230 mm'], ['Outdoor Unit', '770 × 540 × 288 mm']] },
      { group: 'Warranty',     rows: [['Compressor', '10 Years'], ['PCB', '5 Years'], ['Product', '1 Year']] },
    ],
    delivery: { date: 'In 2–3 days', note: 'Free home delivery + installation', pickup: false, installation: true, free: true },
    emi: { from: 3749, months: 12 },
    relatedCategory: 'acs',
  },

  /* ── Home Theatres ── */
  501: {
    id: 501, category: 'home-theatres', brand: 'Sony', name: 'HT-A9 4.0ch Dolby Atmos',
    tagline: '4 Speaker Wireless · 360 Spatial Sound · HDMI eARC',
    originalPrice: 99990, salePrice: 84990, discount: 15,
    rating: 4.8, reviews: 240,
    colors: [{ label: 'Black', hex: '#1a1a1a', images: [] }],
    variants: [
      { group: 'Channels',      options: ['4.0ch', '5.1ch'] },
      { group: 'Connectivity',  options: ['Wi-Fi', 'Bluetooth', 'HDMI eARC'] },
    ],
    highlights: [
      '360 Spatial Sound Mapping for immersive audio',
      '4 wireless speakers — no cables needed',
      'Dolby Atmos and DTS:X support',
      'Compatible with Sony Bravia TVs for one-cable setup',
      'Voice assistant built-in (Alexa)',
      '1 Year Sony Official Warranty',
    ],
    description: 'The Sony HT-A9 redefines home cinema audio. Four wireless high-performance speakers work together with 360 Spatial Sound Mapping technology to analyse your room acoustics and optimise the audio field precisely. The result is cinema-quality surround sound that fills every corner of your room without a single visible cable.',
    specs: [
      { group: 'Audio',        rows: [['Configuration', '4.0ch'], ['Total Power', '504W'], ['Surround', 'Dolby Atmos, DTS:X, 360 Reality Audio']] },
      { group: 'Connectivity', rows: [['HDMI', '1 × HDMI eARC'], ['Optical', 'Yes'], ['Wi-Fi', '2.4GHz / 5GHz'], ['Bluetooth', '5.0']] },
      { group: 'Smart',        rows: [['Voice', 'Amazon Alexa Built-in'], ['App', 'Sony Music Centre App']] },
      { group: 'Warranty',     rows: [['Brand Warranty', '1 Year']] },
    ],
    delivery: { date: 'In 2–3 days', note: 'Free home delivery', pickup: true, installation: false, free: true },
    emi: { from: 7083, months: 12 },
    relatedCategory: 'home-theatres',
  },

  /* ── Kitchen ── */
  601: {
    id: 601, category: 'kitchen', brand: 'IFB', name: '25L Convection Microwave',
    tagline: '25L Capacity · 900W · 101 Auto-Cook Menus',
    originalPrice: 14990, salePrice: 12490, discount: 17,
    rating: 4.5, reviews: 820,
    colors: [{ label: 'White', hex: '#f5f5f5', images: [] }, { label: 'Black', hex: '#1a1a1a', images: [] }],
    variants: [
      { group: 'Capacity', options: ['20L', '25L', '30L'] },
      { group: 'Power',    options: ['800W', '900W'] },
    ],
    highlights: [
      '101 Auto-Cook menus for Indian dishes',
      'Convection + Microwave + Grill — 3-in-1',
      'Steam Clean function for easy maintenance',
      'Child safety lock',
      '360° motorised turntable for even cooking',
      '1 Year IFB Comprehensive Warranty',
    ],
    description: 'The IFB 25L Convection Microwave is your complete kitchen solution. With 101 pre-programmed auto-cook menus tailored for Indian cuisine, it makes everyday cooking effortless. The combination of convection, microwave, and grill functions means you can bake, roast, grill, and reheat with a single appliance.',
    specs: [
      { group: 'General',    rows: [['Brand', 'IFB'], ['Capacity', '25 Litres'], ['Type', 'Convection Microwave']] },
      { group: 'Performance',rows: [['Power', '900W'], ['Grill Power', '1200W'], ['Convection', '250°C max']] },
      { group: 'Features',   rows: [['Auto Cook', '101 menus'], ['Steam Clean', 'Yes'], ['Child Lock', 'Yes'], ['Turntable', 'Yes — 270mm']] },
      { group: 'Dimensions', rows: [['W × H × D', '510 × 310 × 415 mm'], ['Weight', '14 kg']] },
      { group: 'Warranty',   rows: [['Product', '1 Year'], ['Magnetron', '4 Years']] },
    ],
    delivery: { date: 'Tomorrow', note: 'Order before 6 PM', pickup: true, installation: false, free: true },
    emi: { from: 1041, months: 12 },
    relatedCategory: 'kitchen',
  },

  /* ── Refrigerators ── */
  701: {
    id: 701, category: 'refrigerators', brand: 'Samsung', name: '524L French Door Fridge',
    tagline: 'Twin Cooling Plus · Food Showcase · All Around Cooling',
    originalPrice: 84999, salePrice: 69999, discount: 18,
    rating: 4.7, reviews: 420,
    colors: [
      { label: 'Refined Inox',  hex: '#b0b0b0', images: [] },
      { label: 'Glam Black',    hex: '#1a1a1a', images: [] },
    ],
    variants: [
      { group: 'Capacity', options: ['408L', '524L', '599L'] },
      { group: 'Doors',    options: ['French Door', 'Side-by-Side'] },
      { group: 'Star Rating', options: ['3 Star', '5 Star'] },
    ],
    highlights: [
      'Twin Cooling Plus — separate cooling for fridge & freezer',
      'Food Showcase door-in-door for quick access',
      'All Around Cooling keeps every corner fresh',
      'Digital Inverter Compressor — 10 Year Warranty',
      'Deodoriser eliminates odour-causing bacteria',
      '1 Year Samsung Comprehensive Warranty',
    ],
    description: 'The Samsung 524L French Door Refrigerator combines advanced cooling technology with sophisticated design. Twin Cooling Plus uses two evaporators to maintain optimal temperature and humidity separately in the fridge and freezer compartments, keeping your food fresher for longer without odour transfer.',
    specs: [
      { group: 'General',    rows: [['Brand', 'Samsung'], ['Capacity', '524 Litres'], ['Type', 'French Door']] },
      { group: 'Cooling',    rows: [['Technology', 'Twin Cooling Plus'], ['Compressor', 'Digital Inverter'], ['Refrigerant', 'R-600a']] },
      { group: 'Features',   rows: [['Door-in-Door', 'Yes'], ['Ice Maker', 'Auto'], ['Water Dispenser', 'No'], ['Deodoriser', 'Yes']] },
      { group: 'Dimensions', rows: [['H × W × D', '1780 × 912 × 717 mm'], ['Weight', '117 kg']] },
      { group: 'Warranty',   rows: [['Product', '1 Year'], ['Compressor', '10 Years'], ['PCB', '5 Years']] },
    ],
    delivery: { date: 'In 3–5 days', note: 'Free home delivery + installation', pickup: false, installation: true, free: true },
    emi: { from: 5833, months: 12 },
    relatedCategory: 'refrigerators',
  },
};

// Expose globally
window.productCatalogue = productCatalogue;
