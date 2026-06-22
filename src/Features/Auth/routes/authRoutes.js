import express from "express"
import {AuthController} from "../controllers/authcontroller.js";
const router=express.Router()

const authController=new AuthController();

router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/',(req,res)=>{
    res.render("auth/auth");
})
export default router;