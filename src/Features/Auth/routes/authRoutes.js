import express from "express"
import {AuthController} from "../controllers/authcontroller.js";
const router=express.Router()

const authController=new AuthController();

router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/login',(req,res)=>{
    res.render("auth/auth",{isAuthPage:true});
})
export default router;