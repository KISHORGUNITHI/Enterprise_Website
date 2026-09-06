import prisma from "../src/config/prisma.js"

const categories = [
    {
        name: "Mobile",
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
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
                ]
            }
        ]
    },
    // {
    //   name: "TV",
    //   products: [
    //     {
    //         name: "Cellecor 24 Inch HD LED TV",
    //         slug: "cellecor-24-inch-hd-led-tv",
    //         description:
    //             "Cellecor 24-inch HD LED TV designed for compact spaces, featuring an HD display, built-in speakers and multiple connectivity options.",
    //         brand: "Cellecor",
    //         price: "8999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_24_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_24_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_24_3"
    //         ]
    //     },

    //     {
    //         name: "Cellecor 55 Inch 4K Smart LED TV",
    //         slug: "cellecor-55-inch-4k-smart-led-tv",
    //         description:
    //             "Cellecor 55-inch 4K Smart LED TV with a large ultra-high-definition display, smart entertainment features and immersive audio.",
    //         brand: "Cellecor",
    //         price: "29999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_55_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_55_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_55_3"
    //         ]
    //     },

    //     {
    //         name: "Mi 32 Inch HD Ready Smart TV",
    //         slug: "mi-32-inch-hd-ready-smart-tv",
    //         description:
    //             "Mi 32-inch HD Ready Smart TV designed for everyday entertainment with smart streaming capabilities, vivid picture quality and built-in speakers.",
    //         brand: "Mi",
    //         price: "12999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_MI_32_1",
    //             "YOUR_CLOUDINARY_URL_MI_32_2",
    //             "YOUR_CLOUDINARY_URL_MI_32_3"
    //         ]
    //     },

    //     {
    //         name: "Mi 43 Inch 4K Ultra HD Smart TV",
    //         slug: "mi-43-inch-4k-ultra-hd-smart-tv",
    //         description:
    //             "Mi 43-inch 4K Ultra HD Smart TV offering sharp 4K visuals, smart streaming features, immersive audio and multiple connectivity options.",
    //         brand: "Mi",
    //         price: "24999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_MI_43_1",
    //             "YOUR_CLOUDINARY_URL_MI_43_2",
    //             "YOUR_CLOUDINARY_URL_MI_43_3"
    //         ]
    //     },

    //     {
    //         name: "Samsung 43 Inch Crystal 4K Smart TV",
    //         slug: "samsung-43-inch-crystal-4k-smart-tv",
    //         description:
    //             "Samsung 43-inch Crystal 4K Smart TV featuring a 4K UHD display, Crystal Processor, smart TV platform and modern slim design.",
    //         brand: "Samsung",
    //         price: "35999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_43_1",
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_43_2",
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_43_3"
    //         ]
    //     },

    //     {
    //         name: "Samsung 65 Inch Neo QLED 4K Smart TV",
    //         slug: "samsung-65-inch-neo-qled-4k-smart-tv",
    //         description:
    //             "Samsung 65-inch Neo QLED 4K Smart TV offering a premium large-screen viewing experience with Quantum Matrix technology, 4K resolution and advanced smart features.",
    //         brand: "Samsung",
    //         price: "109999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_65_1",
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_65_2",
    //             "YOUR_CLOUDINARY_URL_SAMSUNG_65_3"
    //         ]
    //     },

    //     {
    //         name: "BPL 24 Inch HD Ready LED TV",
    //         slug: "bpl-24-inch-hd-ready-led-tv",
    //         description:
    //             "BPL 24-inch HD Ready LED TV suitable for compact rooms, bedrooms and smaller entertainment spaces with essential connectivity features.",
    //         brand: "BPL",
    //         price: "7999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BPL_24_1",
    //             "YOUR_CLOUDINARY_URL_BPL_24_2",
    //             "YOUR_CLOUDINARY_URL_BPL_24_3"
    //         ]
    //     },

    //     {
    //         name: "BPL 55 Inch 4K Smart TV",
    //         slug: "bpl-55-inch-4k-smart-tv",
    //         description:
    //             "BPL 55-inch 4K Smart TV featuring a large ultra-high-definition display, smart entertainment functionality and immersive audio for home viewing.",
    //         brand: "BPL",
    //         price: "27999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BPL_55_1",
    //             "YOUR_CLOUDINARY_URL_BPL_55_2",
    //             "YOUR_CLOUDINARY_URL_BPL_55_3"
    //         ]
    //     }
    //   ]
    // },

    // {
    //   name: "AC",
    //   products: [
    //     {
    //         name: "BPL 1.5 Ton 3 Star Inverter Split AC",
    //         slug: "bpl-1-5-ton-3-star-inverter-split-ac",
    //         description:
    //             "BPL 1.5 Ton inverter split air conditioner designed for efficient cooling and comfortable everyday home use.",
    //         brand: "BPL",
    //         price: "32999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BPL_AC_1_1",
    //             "YOUR_CLOUDINARY_URL_BPL_AC_1_2",
    //             "YOUR_CLOUDINARY_URL_BPL_AC_1_3"
    //         ]
    //     },

    //     {
    //         name: "BPL 1 Ton 3 Star Inverter Split AC",
    //         slug: "bpl-1-ton-3-star-inverter-split-ac",
    //         description:
    //             "BPL 1 Ton inverter split air conditioner suitable for bedrooms and smaller rooms, offering efficient cooling and convenient operation.",
    //         brand: "BPL",
    //         price: "28999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BPL_AC_2_1",
    //             "YOUR_CLOUDINARY_URL_BPL_AC_2_2",
    //             "YOUR_CLOUDINARY_URL_BPL_AC_2_3"
    //         ]
    //     },

    //     {
    //         name: "Cellecor 1.5 Ton 5 Star Inverter Split AC",
    //         slug: "cellecor-1-5-ton-5-star-inverter-split-ac",
    //         description:
    //             "Cellecor 1.5 Ton inverter split air conditioner designed for powerful cooling with energy-efficient operation.",
    //         brand: "Cellecor",
    //         price: "35999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_1_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_1_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_1_3"
    //         ]
    //     },

    //     {
    //         name: "Cellecor 2 Ton 3 Star Inverter Split AC",
    //         slug: "cellecor-2-ton-3-star-inverter-split-ac",
    //         description:
    //             "Cellecor 2 Ton inverter split air conditioner designed for larger rooms, providing powerful cooling and efficient temperature control.",
    //         brand: "Cellecor",
    //         price: "42999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_2_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_2_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_AC_2_3"
    //         ]
    //     }
    //   ]
    // },

    // {
    //   name: "Home Theatre",
    //   products: [
    //     {
    //         name: "boAt Aavante Bar 3200D Soundbar",
    //         slug: "boat-aavante-bar-3200d-soundbar",
    //         description:
    //             "boAt Aavante soundbar designed for immersive home entertainment with powerful audio, wireless connectivity and a dedicated subwoofer.",
    //         brand: "boAt",
    //         price: "9999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_1_1",
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_1_2",
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_1_3"
    //         ]
    //     },

    //     {
    //         name: "boAt Aavante Bar 2500 Soundbar",
    //         slug: "boat-aavante-bar-2500-soundbar",
    //         description:
    //             "boAt Aavante Bar soundbar offering powerful audio for movies, music and gaming with Bluetooth connectivity and a compact home entertainment design.",
    //         brand: "boAt",
    //         price: "6999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_2_1",
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_2_2",
    //             "YOUR_CLOUDINARY_URL_BOAT_BAR_2_3"
    //         ]
    //     },

    //     {
    //         name: "Mivi Fort S660 Soundbar",
    //         slug: "mivi-fort-s660-soundbar",
    //         description:
    //             "Mivi Fort S660 soundbar designed for home entertainment with powerful sound output, wireless connectivity and a dedicated subwoofer.",
    //         brand: "Mivi",
    //         price: "8999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_1_1",
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_1_2",
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_1_3"
    //         ]
    //     },

    //     {
    //         name: "Mivi Fort H500 Soundbar",
    //         slug: "mivi-fort-h500-soundbar",
    //         description:
    //             "Mivi Fort H500 is a compact home audio soundbar designed to enhance TV audio with Bluetooth connectivity and immersive sound.",
    //         brand: "Mivi",
    //         price: "5999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_2_1",
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_2_2",
    //             "YOUR_CLOUDINARY_URL_MIVI_BAR_2_3"
    //         ]
    //     }
    //   ]
    // },
    // {
    //   name: "Kitchen Ware",
    //   products: [
    //     {
    //         name: "Cellecor 750W Mixer Grinder",
    //         slug: "cellecor-750w-mixer-grinder",
    //         description:
    //             "Cellecor 750W mixer grinder designed for everyday kitchen use, suitable for grinding spices, making chutneys and preparing smoothies.",
    //         brand: "Cellecor",
    //         price: "2499.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_1_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_1_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_1_3"
    //         ]
    //     },

    //     {
    //         name: "Cellecor 1000W Mixer Grinder",
    //         slug: "cellecor-1000w-mixer-grinder",
    //         description:
    //             "Cellecor 1000W mixer grinder built for powerful everyday food preparation, including grinding, blending and chutney making.",
    //         brand: "Cellecor",
    //         price: "3299.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_2_1",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_2_2",
    //             "YOUR_CLOUDINARY_URL_CELLECOR_MIXER_2_3"
    //         ]
    //     },

    //     {
    //         name: "Preethi Zodiac 750W Mixer Grinder",
    //         slug: "preethi-zodiac-750w-mixer-grinder",
    //         description:
    //             "Preethi Zodiac 750W mixer grinder designed for versatile kitchen preparation with multiple functions for grinding, blending and everyday cooking.",
    //         brand: "Preethi",
    //         price: "7999.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_1_1",
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_1_2",
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_1_3"
    //         ]
    //     },

    //     {
    //         name: "Preethi Blue Leaf Platinum 750W Mixer Grinder",
    //         slug: "preethi-blue-leaf-platinum-750w-mixer-grinder",
    //         description:
    //             "Preethi Blue Leaf Platinum 750W mixer grinder designed for reliable everyday kitchen use with efficient grinding and blending performance.",
    //         brand: "Preethi",
    //         price: "5499.00",
    //         availability: "AVAILABLE",

    //         images: [
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_2_1",
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_2_2",
    //             "YOUR_CLOUDINARY_URL_PREETHI_MIXER_2_3"
    //         ]
    //     }
    //   ]
    // },

    // {
    //     name: "Refrigerator",
    //     products: []
    // }
];

async function main() {
    const mobileCategory = categories.find(
        (category) => category.name === "Mobile"
    );

    if (!mobileCategory) {
        throw new Error("Mobile category not found");
    }

    // Create Mobile category if it doesn't exist
    const category = await prisma.category.upsert({
        where: {
            name: mobileCategory.name
        },
        update: {},
        create: {
            name: mobileCategory.name
        }
    });

    // Create/update Mobile products
    for (const productData of mobileCategory.products) {
        const product = await prisma.product.upsert({
            where: {
                slug: productData.slug
            },
            update: {
                name: productData.name,
                description: productData.description,
                brand: productData.brand,
                price: productData.price,
                availability: productData.availability,
                categoryId: category.id
            },
            create: {
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                brand: productData.brand,
                price: productData.price,
                availability: productData.availability,
                categoryId: category.id
            }
        });

        // Create/update product image
        const existingImage = await prisma.productImage.findFirst({
            where: {
                productId: product.id
            }
        });

        if (existingImage) {
            await prisma.productImage.update({
                where: {
                    id: existingImage.id
                },
                data: {
                    imageUrl: productData.images[0],
                    isPrimary: true
                }
            });
        } else {
            await prisma.productImage.create({
                data: {
                    productId: product.id,
                    imageUrl: productData.images[0],
                    isPrimary: true
                }
            });
        }
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });