import { RegisterService,LoginService } from "../services/authServices.js"

const registerService=new RegisterService();
const loginService=new LoginService();

export class AuthController{
    async register(req,res){
        try{
            const result=await registerService.regitserUser(req.body);
            return res.status(201).json({
                success:true,
                data:result
            })
        }
        catch(error){
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }
    }
    async login(req,res){
        try{
            const result=await loginService.loginUser(req.body);
            return res.json({
                success:true,
                data:result
            })
        }
        catch(error){
            return res.json({
                success:false,
                message:error.message
            })
        }
    }
}