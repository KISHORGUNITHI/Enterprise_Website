import { ProfileService } from "../services/profileServices";

export class ProfileController{
    constructor(){
        this.profileService=new ProfileService();
    }
    async getProflile(req,res){
        const user=await this.profileService.getUser(req.user.id);
        return res.status(200).json({
            success:true,
            data:user
        });
    }
    async updateProfile(req,res){
        const user=await this.profileService.editUser(
            req.user.id,
            req.body.username
        );
        return res.status(200).json({
            success:true,
            data:user
        });
    }
}