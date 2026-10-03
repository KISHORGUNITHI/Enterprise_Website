import prisma from "../src/config/prisma.js";

// ─── Attribute Definitions ──────────────────────────────────────────────────
const attributeDefinitions = [
  {
    name: "RAM",
    displayName: "RAM",
    values: [
      { value: "8gb", displayValue: "8GB" },
      { value: "12gb", displayValue: "12GB" },
      { value: "16gb", displayValue: "16GB" },
    ],
  },
  {
    name: "Storage",
    displayName: "Storage",
    values: [
      { value: "128gb", displayValue: "128GB" },
      { value: "256gb", displayValue: "256GB" },
      { value: "512gb", displayValue: "512GB" },
      { value: "1tb", displayValue: "1TB" },
    ],
  },
  {
    name: "Color",
    displayName: "Color",
    values: [
      { value: "black", displayValue: "Phantom Black" },
      { value: "silver", displayValue: "Titanium Silver" },
      { value: "blue", displayValue: "Deep Ocean Blue" },
      { value: "gold", displayValue: "Desert Gold" },
      { value: "green", displayValue: "Emerald Green" },
    ],
  },
  {
    name: "Screen Size",
    displayName: "Screen Size",
    values: [
      { value: "24-inch", displayValue: "24 Inch" },
      { value: "32-inch", displayValue: "32 Inch" },
      { value: "40-inch", displayValue: "40 Inch" },
      { value: "43-inch", displayValue: "43 Inch" },
      { value: "50-inch", displayValue: "50 Inch" },
      { value: "55-inch", displayValue: "55 Inch" },
      { value: "65-inch", displayValue: "65 Inch" },
      { value: "75-inch", displayValue: "75 Inch" },
    ],
  },
  {
    name: "Capacity",
    displayName: "Capacity",
    values: [
      { value: "1-ton", displayValue: "1.0 Ton" },
      { value: "1.5-ton", displayValue: "1.5 Ton" },
      { value: "2-ton", displayValue: "2.0 Ton" },
    ],
  },
  {
    name: "Star Rating",
    displayName: "Energy Rating",
    values: [
      { value: "3-star", displayValue: "3 Star" },
      { value: "5-star", displayValue: "5 Star" },
    ],
  },
];

// ─── Categories & Products Seed Data ────────────────────────────────────────
const categories = [
  {
    id: "cat-mobiles",
    name: "Mobiles",
    aliases: ["Mobiles", "Mobile"],
    products: [
      {
        name: "OnePlus 15R",
        slug: "oneplus-15r",
        description:
          "OnePlus 15R is a performance-focused flagship smartphone featuring a 6.83-inch high-refresh-rate display, Snapdragon 8 Gen 5 processor, 7400mAh battery and fast SUPERVOOC charging.",
        brand: "OnePlus",
        price: "49999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004113/61h53LtSVVL._AC_UF1000_1000_QL80__l1k6lm.jpg",
        ],
        variants: [
          {
            priceOverride: "49999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "128gb" },
              { name: "Color", value: "black" },
            ],
          },
          {
            priceOverride: "54999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "black" },
            ],
          },
          {
            priceOverride: "59999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "silver" },
            ],
          },
        ],
      },
      {
        name: "OnePlus 13s",
        slug: "oneplus-13s",
        description:
          "OnePlus 13s is a compact flagship smartphone with a 6.32-inch LTPO display, Snapdragon 8 Elite processor, 5850mAh battery, 80W SUPERVOOC charging and a dual 50MP rear camera system.",
        brand: "OnePlus",
        price: "54999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004457/13s-5g-cph2723-oneplus-original-imahdcx8qeywg3qg_ycpu3d.webp",
        ],
        variants: [
          {
            priceOverride: "54999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "blue" },
            ],
          },
          {
            priceOverride: "61999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "black" },
            ],
          },
        ],
      },
      {
        name: "Samsung Galaxy Z Fold8",
        slug: "samsung-galaxy-z-fold8",
        description:
          "Samsung Galaxy Z Fold8 is a foldable flagship featuring a large Dynamic AMOLED 2X main display, Snapdragon 8 Elite Gen 5 for Galaxy processor, 4800mAh battery and up to 1TB storage.",
        brand: "Samsung",
        price: "174999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004576/shopping_tmzgeh.webp",
        ],
        variants: [
          {
            priceOverride: "174999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "black" },
            ],
          },
          {
            priceOverride: "189999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "silver" },
            ],
          },
          {
            priceOverride: "209999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "1tb" },
              { name: "Color", value: "gold" },
            ],
          },
        ],
      },
      {
        name: "Samsung Galaxy Z Fold8 Ultra",
        slug: "samsung-galaxy-z-fold8-ultra",
        description:
          "Samsung Galaxy Z Fold8 Ultra is a premium foldable smartphone with a large Dynamic AMOLED 2X main display, Snapdragon-class flagship processing, 200MP wide camera, 50MP ultra-wide camera and 10MP telephoto camera.",
        brand: "Samsung",
        price: "219999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004675/download_mmpt0w.avif",
        ],
        variants: [
          {
            priceOverride: "219999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "silver" },
            ],
          },
          {
            priceOverride: "239999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "1tb" },
              { name: "Color", value: "black" },
            ],
          },
        ],
      },
      {
        name: "iPhone 17 Pro Max",
        slug: "iphone-17-pro-max",
        description:
          "iPhone 17 Pro Max is Apple's premium flagship smartphone with a 6.9-inch Super Retina XDR OLED display, A19 Pro chip, ProMotion up to 120Hz and a professional 48MP camera system.",
        brand: "Apple",
        price: "149900.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004770/images_gyizlj.jpg",
        ],
        variants: [
          {
            priceOverride: "149900.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "silver" },
            ],
          },
          {
            priceOverride: "169900.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "gold" },
            ],
          },
          {
            priceOverride: "189900.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "1tb" },
              { name: "Color", value: "black" },
            ],
          },
        ],
      },
      {
        name: "OPPO Reno15 Pro Mini",
        slug: "oppo-reno15-pro-mini",
        description:
          "OPPO Reno15 Pro Mini is a compact premium smartphone featuring a 6.3-inch AMOLED display, MediaTek Dimensity 8450 processor, 6200mAh battery and a versatile 200MP main, 50MP telephoto and 50MP ultra-wide camera system.",
        brand: "OPPO",
        price: "59999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004874/images_p0dpys.jpg",
        ],
        variants: [
          {
            priceOverride: "59999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "green" },
            ],
          },
          {
            priceOverride: "65999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "black" },
            ],
          },
        ],
      },
      {
        name: "vivo X300",
        slug: "vivo-x300",
        description:
          "vivo X300 is a compact flagship smartphone with a 6.31-inch AMOLED display, MediaTek Dimensity 9500 processor, 6040mAh battery, 90W FlashCharge and a 200MP ZEISS main camera.",
        brand: "vivo",
        price: "83999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788004954/images_pt6raf.jpg",
        ],
        variants: [
          {
            priceOverride: "83999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "blue" },
            ],
          },
          {
            priceOverride: "91999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "silver" },
            ],
          },
        ],
      },
      {
        name: "vivo S2",
        slug: "vivo-s2",
        description:
          "vivo S2 is a premium mid-range smartphone featuring a 6.83-inch 1.5K AMOLED display with 120Hz refresh rate, Dimensity 7360-Turbo processor, 7050mAh battery and a 50MP main camera.",
        brand: "vivo",
        price: "39999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788005020/images_mca7di.jpg",
        ],
        variants: [
          {
            priceOverride: "39999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "128gb" },
              { name: "Color", value: "gold" },
            ],
          },
          {
            priceOverride: "43999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "black" },
            ],
          },
        ],
      },
      {
        name: "realme 16 Pro+ 5G",
        slug: "realme-16-pro-plus-5g",
        description:
          "realme 16 Pro+ 5G is a high-performance smartphone featuring a 6.8-inch AMOLED display with up to 144Hz refresh rate, Snapdragon 7 Gen 4 processor, 7000mAh battery and a 200MP main camera.",
        brand: "realme",
        price: "44999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1788005093/images_cucrjv.jpg",
        ],
        variants: [
          {
            priceOverride: "44999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "8gb" },
              { name: "Storage", value: "128gb" },
              { name: "Color", value: "green" },
            ],
          },
          {
            priceOverride: "48999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "12gb" },
              { name: "Storage", value: "256gb" },
              { name: "Color", value: "black" },
            ],
          },
          {
            priceOverride: "53999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "RAM", value: "16gb" },
              { name: "Storage", value: "512gb" },
              { name: "Color", value: "blue" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cat-tvs",
    name: "TVs",
    aliases: ["TVs", "TV"],
    products: [
      {
        name: "Cellecor 24 Inch HD LED TV",
        slug: "cellecor-24-inch-hd-led-tv",
        description:
          "Cellecor 24-inch HD LED TV designed for compact spaces, featuring an HD display, built-in speakers and multiple connectivity options.",
        brand: "Cellecor",
        price: "8999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789358783/cellecor-24-inch-hd-led-tv_jyqemk.jpg",
        ],
        variants: [
          {
            priceOverride: "8999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "24-inch" }],
          },
          {
            priceOverride: "11999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "32-inch" }],
          },
        ],
      },
      {
        name: "Cellecor 55 Inch 4K Smart LED TV",
        slug: "cellecor-55-inch-4k-smart-led-tv",
        description:
          "Cellecor 55-inch 4K Smart LED TV with a large ultra-high-definition display, smart entertainment features and immersive audio.",
        brand: "Cellecor",
        price: "29999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789358910/cellecor-55-inch-4k-smart-led-tv_nyhjtv.jpg",
        ],
        variants: [
          {
            priceOverride: "26999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "50-inch" }],
          },
          {
            priceOverride: "29999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "55-inch" }],
          },
          {
            priceOverride: "39999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "65-inch" }],
          },
        ],
      },
      {
        name: "Mi 32 Inch HD Ready Smart TV",
        slug: "mi-32-inch-hd-ready-smart-tv",
        description:
          "Mi 32-inch HD Ready Smart TV designed for everyday entertainment with smart streaming capabilities, vivid picture quality and built-in speakers.",
        brand: "Mi",
        price: "12999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359018/mi-32-inch-hd-ready-smart-tv_e1an5w.jpg",
        ],
        variants: [
          {
            priceOverride: "12999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "32-inch" }],
          },
          {
            priceOverride: "18999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "40-inch" }],
          },
        ],
      },
      {
        name: "Mi 43 Inch 4K Ultra HD Smart TV",
        slug: "mi-43-inch-4k-ultra-hd-smart-tv",
        description:
          "Mi 43-inch 4K Ultra HD Smart TV offering sharp 4K visuals, smart streaming features, immersive audio and multiple connectivity options.",
        brand: "Mi",
        price: "24999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359081/mi-43-inch-4k-ultra-hd-smart-tv_xju7av.jpg",
        ],
        variants: [
          {
            priceOverride: "24999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "43-inch" }],
          },
          {
            priceOverride: "29999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "50-inch" }],
          },
          {
            priceOverride: "34999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "55-inch" }],
          },
        ],
      },
      {
        name: "Samsung 43 Inch Crystal 4K Smart TV",
        slug: "samsung-43-inch-crystal-4k-smart-tv",
        description:
          "Samsung 43-inch Crystal 4K Smart TV featuring a 4K UHD display, Crystal Processor, smart TV platform and modern slim design.",
        brand: "Samsung",
        price: "35999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359212/samsung-43-inch-crystal-4k-smart-tv_btzvus.jpg",
        ],
        variants: [
          {
            priceOverride: "35999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "43-inch" }],
          },
          {
            priceOverride: "43999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "50-inch" }],
          },
          {
            priceOverride: "51999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "55-inch" }],
          },
        ],
      },
      {
        name: "Samsung 65 Inch Neo QLED 4K Smart TV",
        slug: "samsung-65-inch-neo-qled-4k-smart-tv",
        description:
          "Samsung 65-inch Neo QLED 4K Smart TV offering a premium large-screen viewing experience with Quantum Matrix technology, 4K resolution and advanced smart features.",
        brand: "Samsung",
        price: "109999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359309/samsung-65-inch-neo-qled-4k-smart-tv_jgc0ux.jpg",
        ],
        variants: [
          {
            priceOverride: "89999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "55-inch" }],
          },
          {
            priceOverride: "109999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "65-inch" }],
          },
          {
            priceOverride: "149999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "75-inch" }],
          },
        ],
      },
      {
        name: "BPL 24 Inch HD Ready LED TV",
        slug: "bpl-24-inch-hd-ready-led-tv",
        description:
          "BPL 24-inch HD Ready LED TV suitable for compact rooms, bedrooms and smaller entertainment spaces with essential connectivity features.",
        brand: "BPL",
        price: "7999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359373/bpl-24-inch-hd-ready-led-tv_o3ijct.jpg",
        ],
        variants: [
          {
            priceOverride: "7999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "24-inch" }],
          },
          {
            priceOverride: "10999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "32-inch" }],
          },
        ],
      },
      {
        name: "BPL 55 Inch 4K Smart TV",
        slug: "bpl-55-inch-4k-smart-tv",
        description:
          "BPL 55-inch 4K Smart TV featuring a large ultra-high-definition display, smart entertainment functionality and immersive audio for home viewing.",
        brand: "BPL",
        price: "27999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789359432/BPL_55_Inch_4K_Smart_TV_n4hutq.jpg",
        ],
        variants: [
          {
            priceOverride: "21999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "43-inch" }],
          },
          {
            priceOverride: "27999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "55-inch" }],
          },
          {
            priceOverride: "37999.00",
            availability: "AVAILABLE",
            attributes: [{ name: "Screen Size", value: "65-inch" }],
          },
        ],
      },
    ],
  },
  {
    id: "cat-acs",
    name: "Air Conditioners",
    aliases: ["Air Conditioners", "AC"],
    products: [
      {
        name: "BPL 1.5 Ton 3 Star Inverter Split AC",
        slug: "bpl-1-5-ton-3-star-inverter-split-ac",
        description:
          "BPL 1.5 Ton inverter split air conditioner designed for efficient cooling and comfortable everyday home use.",
        brand: "BPL",
        price: "32999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789388360/bpl-1-5-ton-3-star-inverter-split-ac_qc9i2p.jpg",
        ],
        variants: [
          {
            priceOverride: "32999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1.5-ton" },
              { name: "Star Rating", value: "3-star" },
            ],
          },
          {
            priceOverride: "36999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1.5-ton" },
              { name: "Star Rating", value: "5-star" },
            ],
          },
        ],
      },
      {
        name: "BPL 1 Ton 3 Star Inverter Split AC",
        slug: "bpl-1-ton-3-star-inverter-split-ac",
        description:
          "BPL 1 Ton inverter split air conditioner suitable for bedrooms and smaller rooms, offering efficient cooling and convenient operation.",
        brand: "BPL",
        price: "28999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789388434/bpl-1-ton-3-star-inverter-split-ac_wdk0as.jpg",
        ],
        variants: [
          {
            priceOverride: "28999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1-ton" },
              { name: "Star Rating", value: "3-star" },
            ],
          },
          {
            priceOverride: "31999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1-ton" },
              { name: "Star Rating", value: "5-star" },
            ],
          },
        ],
      },
      {
        name: "Cellecor 1.5 Ton 5 Star Inverter Split AC",
        slug: "cellecor-1-5-ton-5-star-inverter-split-ac",
        description:
          "Cellecor 1.5 Ton inverter split air conditioner designed for powerful cooling with energy-efficient operation.",
        brand: "Cellecor",
        price: "35999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789388512/cellecor-1-5-ton-5-star-inverter-split-ac_k32ubc.jpg",
        ],
        variants: [
          {
            priceOverride: "31999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1.5-ton" },
              { name: "Star Rating", value: "3-star" },
            ],
          },
          {
            priceOverride: "35999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "1.5-ton" },
              { name: "Star Rating", value: "5-star" },
            ],
          },
        ],
      },
      {
        name: "Cellecor 2 Ton 3 Star Inverter Split AC",
        slug: "cellecor-2-ton-3-star-inverter-split-ac",
        description:
          "Cellecor 2 Ton inverter split air conditioner designed for larger rooms, providing powerful cooling and efficient temperature control.",
        brand: "Cellecor",
        price: "42999.00",
        availability: "AVAILABLE",
        images: [
          "https://res.cloudinary.com/hqlyxojm/image/upload/v1789388578/cellecor-2-ton-3-star-inverter-split-ac_jbgaky.jpg",
        ],
        variants: [
          {
            priceOverride: "42999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "2-ton" },
              { name: "Star Rating", value: "3-star" },
            ],
          },
          {
            priceOverride: "47999.00",
            availability: "AVAILABLE",
            attributes: [
              { name: "Capacity", value: "2-ton" },
              { name: "Star Rating", value: "5-star" },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Seed Attributes & Values ───────────────────────────────────────────────
async function seedAttributes() {
  console.log("Seeding variant attributes and attribute values...");
  const valMap = {};

  for (const attrDef of attributeDefinitions) {
    const attr = await prisma.variantAttribute.upsert({
      where: { name: attrDef.name },
      update: { displayName: attrDef.displayName },
      create: {
        name: attrDef.name,
        displayName: attrDef.displayName,
      },
    });

    for (const valDef of attrDef.values) {
      const valRecord = await prisma.variantAttributeValue.upsert({
        where: {
          attributeId_value: {
            attributeId: attr.id,
            value: valDef.value,
          },
        },
        update: { displayValue: valDef.displayValue },
        create: {
          attributeId: attr.id,
          value: valDef.value,
          displayValue: valDef.displayValue,
        },
      });

      valMap[`${attrDef.name}:${valDef.value}`] = valRecord.id;
    }
  }

  console.log("✓ Attributes and values seeded successfully");
  return valMap;
}

// ─── Seed Categories, Products & ProductVariants ────────────────────────────
async function seedCategory(categoryConfig, attributeValueMap) {
  // Find or create category
  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryConfig.id },
        { name: { in: categoryConfig.aliases, mode: "insensitive" } },
      ],
    },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        id: categoryConfig.id,
        name: categoryConfig.name,
      },
    });
  }

  console.log(`\nSeeding category "${category.name}" (id: ${category.id})...`);

  for (const productData of categoryConfig.products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        name: productData.name,
        description: productData.description,
        brand: productData.brand,
        price: productData.price,
        availability: productData.availability,
        categoryId: category.id,
      },
      create: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        brand: productData.brand,
        price: productData.price,
        availability: productData.availability,
        categoryId: category.id,
      },
    });

    // Create/update the primary product image
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });

    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: {
          imageUrl: productData.images[0],
          isPrimary: true,
        },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: productData.images[0],
          isPrimary: true,
        },
      });
    }

    // Seed variants for this product
    if (productData.variants && productData.variants.length > 0) {
      // Clear existing variants to ensure idempotent re-seed
      await prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });

      for (const variantData of productData.variants) {
        const connectIds = variantData.attributes.map((attr) => {
          const valId = attributeValueMap[`${attr.name}:${attr.value}`];
          if (!valId) {
            throw new Error(`Attribute value not found for: ${attr.name}:${attr.value}`);
          }
          return { id: valId };
        });

        await prisma.productVariant.create({
          data: {
            productId: product.id,
            availability: variantData.availability || "AVAILABLE",
            priceOverride: variantData.priceOverride || null,
            attributeValues: {
              connect: connectIds,
            },
          },
        });
      }
    }

    console.log(`  ✓ ${productData.name} (${productData.variants?.length || 0} variants)`);
  }
}

async function main() {
  console.log("🚀 Starting database seeding with product variances...");
  const attributeValueMap = await seedAttributes();

  for (const categoryData of categories) {
    await seedCategory(categoryData, attributeValueMap);
  }

  console.log("\n✅ All categories, products, and variances successfully seeded!");
}

main()
  .catch((error) => {
    console.error("❌ Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });