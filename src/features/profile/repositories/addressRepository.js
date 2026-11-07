import prisma from "../../../config/prisma.js";

export class AddressRepository {
    async createAddress(userId, addressData) {
        const {
            full_name,
            phone_number,
            postal_code,
            landmark,
            address_line_1,
            address_line_2,
            city,
            state,
            country = 'India',
            is_default = false
        } = addressData;

        // Check if user has any existing addresses
        const existingCount = await prisma.address.count({
            where: { user_id: userId }
        });

        // If this is the user's first address, or if is_default is true, make it default
        const makeDefault = Boolean(is_default) || existingCount === 0;

        if (makeDefault) {
            await prisma.address.updateMany({
                where: { user_id: userId },
                data: { is_default: false }
            });
        }

        return await prisma.address.create({
            data: {
                user_id: userId,
                full_name,
                phone_number,
                postal_code,
                landmark: landmark || null,
                address_line_1,
                address_line_2: address_line_2 || null,
                city,
                state,
                country: country || 'India',
                is_default: makeDefault
            }
        });
    }

    async getAddresses(userId) {
        return await prisma.address.findMany({
            where: {
                user_id: userId
            },
            orderBy: [
                { is_default: 'desc' },
                { created_at: 'desc' }
            ]
        });
    }

    async setDefaultAddress(userId, addressId) {
        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!address) {
            throw new Error("Address not found or not authorized");
        }

        // Reset all addresses for this user to is_default = false
        await prisma.address.updateMany({
            where: { user_id: userId },
            data: { is_default: false }
        });

        // Set the selected address to is_default = true
        return await prisma.address.update({
            where: {
                id: addressId
            },
            data: {
                is_default: true
            }
        });
    }

    async deleteAddress(userId, addressId) {
        const target = await prisma.address.findFirst({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        if (!target) {
            return { count: 0 };
        }

        const result = await prisma.address.deleteMany({
            where: {
                id: addressId,
                user_id: userId
            }
        });

        // If the deleted address was default, promote the newest remaining address to default
        if (target.is_default) {
            const remaining = await prisma.address.findFirst({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });

            if (remaining) {
                await prisma.address.update({
                    where: { id: remaining.id },
                    data: { is_default: true }
                });
            }
        }

        return result;
    }

    async updateAddress(userId, addressId, addressData) {
        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                user_id: userId
            }
        });
        
        if (!address) {
            throw new Error("Address not found or not authorized");
        }

        const updateData = {};
        if (addressData.full_name !== undefined) updateData.full_name = addressData.full_name;
        if (addressData.phone_number !== undefined) updateData.phone_number = addressData.phone_number;
        if (addressData.postal_code !== undefined) updateData.postal_code = addressData.postal_code;
        if (addressData.landmark !== undefined) updateData.landmark = addressData.landmark;
        if (addressData.address_line_1 !== undefined) updateData.address_line_1 = addressData.address_line_1;
        if (addressData.address_line_2 !== undefined) updateData.address_line_2 = addressData.address_line_2;
        if (addressData.city !== undefined) updateData.city = addressData.city;
        if (addressData.state !== undefined) updateData.state = addressData.state;
        if (addressData.country !== undefined) updateData.country = addressData.country;

        if (addressData.is_default !== undefined) {
            const isDefault = Boolean(addressData.is_default);
            updateData.is_default = isDefault;
            if (isDefault) {
                await prisma.address.updateMany({
                    where: { user_id: userId },
                    data: { is_default: false }
                });
            }
        }

        return await prisma.address.update({
            where: {
                id: addressId
            },
            data: updateData
        });
    }
}
