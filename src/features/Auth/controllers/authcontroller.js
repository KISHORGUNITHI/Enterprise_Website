import { RegisterService,LoginService } from "../services/authServices.js"

const registerService=new RegisterService();
const loginService=new LoginService();

export class AuthController{
    async register(req,res){
        try{
            console.log(req.body);
            const result=await registerService.registerUser(req.body);
            res.render("products/products.ejs",{success:true,message:"Registered Successfully",data:result});
        }
        catch(error){
            return res.render("auth/auth",{success:false,error:error.message});
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
            return res.render("auth/auth",{
                success:false,
                error:error.message
            });
        }
    }
}