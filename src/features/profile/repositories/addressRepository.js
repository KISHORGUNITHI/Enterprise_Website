import prisma from "../../../config/prisma.js"

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
            country,
            is_default
        } = addressData;

        return await prisma.address.create({
            data: {
                user_id: userId,
                full_name,
                phone_number,
                postal_code,
                landmark,
                address_line_1,
                address_line_2,
                city,
                state,
                country,
                is_default
            }
        });
    }

    async getAddresses(userId) {
        return await prisma.address.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    async deleteAddress(userId, addressId) {
        return await prisma.address.deleteMany({
            where: {
                id: addressId,
                user_id: userId
            }
        });
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

        const {
            full_name,
            phone_number,
            postal_code,
            landmark,
            address_line_1,
            address_line_2,
            city,
            state,
            country,
            is_default
        } = addressData;

        return await prisma.address.update({
            where: {
                id: addressId
            },
            data: {
                full_name,
                phone_number,
                postal_code,
                landmark,
                address_line_1,
                address_line_2,
                city,
                state,
                country,
                is_default
            }
        });
    }
}
