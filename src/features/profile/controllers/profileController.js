import { ProfileService } from "../services/profileServices.js";

export class ProfileController{
    constructor(){
        this.profileService=new ProfileService();
    }
    async getProfile(req,res){
        try {
            const userId = req.user.userId || req.user.id;
            const user=await this.profileService.getUser(userId);
            return res.status(200).json({
                success:true,
                data:user
            });
        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    async updateProfile(req,res){
        try {
            const userId = req.user.userId || req.user.id;
            const user=await this.profileService.editUser(
                userId,
                req.body.username
            );
            return res.status(200).json({
                success:true,
                data:user
            });
        } catch (error) {
            console.error("Update profile error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
    async address(req,res){
        try {
            const userId = req.user.userId || req.user.id;
            const addressData = req.body;
            const address = await this.profileService.createAddress(userId, addressData);
            return res.status(201).json({
                success: true,
                data: address
            });
        } catch (error) {
            console.error("Address creation error:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
   }
   async getAddresses(req, res){
       try {
           const userId = req.user.userId || req.user.id;
           const addresses = await this.profileService.getAddresses(userId);
           return res.status(200).json({
               success: true,
               data: addresses
           });
       } catch (error) {
           console.error("Fetch addresses error:", error);
           return res.status(500).json({ success: false, message: "Internal server error" });
       }
   }
}