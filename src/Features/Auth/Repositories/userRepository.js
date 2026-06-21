import prisma from "../../../config/prisma.js"

export class UserRepository{
    async findByEmail(email){
        return prisma.user.findUnique({
            where:{
                email
            }
        });
    }

    async createUser(userData){
        return prisma.user.create({
            data:userData
        })
    }
}