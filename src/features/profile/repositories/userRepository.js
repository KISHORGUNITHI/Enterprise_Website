import prisma from "../../../config/prisma.js"

export class UserRepository {
    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    async updateUser(id, data) {
        return prisma.user.update({
            where: {
                id
            },
            data
        });
    }
}