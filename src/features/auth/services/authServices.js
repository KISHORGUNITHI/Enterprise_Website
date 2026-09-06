import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {UserRepository} from "../repositories/userRepository.js"
import "dotenv/config"

export class RegisterService{
    constructor(){
        this.userRepository=new UserRepository();
    }
    async registerUser(userData){
        const {username,email,phone_number,password,confirmPassword}=userData;
        console.log(username);
        //password and confirm password check
        if(password!=confirmPassword){
            throw new Error("Password mismatch")
        }
        //check length of username
        if(username.length<3){
            throw new Error("Username must be 3 characters long")
        }
        //check for email existence
        await this.emailExistenceCheck(email);
        //validate password(business logic- should be 8 character long)
        this.validatePassword(password);
        //hashing password
        const hashedPassword=await bcrypt.hash(password, 10);
        //creating user
        const user=await this.userRepository.createUser({
            username,
            email,
            phone_number,
            password_hash:hashedPassword
        });
        //generating token
        const token=this.generateToken(user.id);
        const {password_hash,...safeuser}=user
        return {
            safeuser,
            token
        };
    }
    async emailExistenceCheck(email){
        const user=await this.userRepository.findByEmail(email);
        if(user){
            throw new Error("Email already exists");
        }
    }
    validatePassword(password){
        if(!password || password.length < 8){
            throw new Error("Password must contain at least 8 characters");
        }
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if(!hasUpper || !hasLower || !hasNumber){
            throw new Error("Password must contain uppercase, lowercase letters, and numbers");
        }
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        if(password.length < 12 && !hasSpecial){
            throw new Error("If less than 12 characters, password must contain a special character");
        }
    }
    generateToken(userId){
        return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'7d'});
    }
};

export class LoginService{
    constructor(){
        this.userRepository=new UserRepository();
    }
    async loginUser(userData){
        //Find Email
        const {email,password}=userData;
        const user=await this.userRepository.findByEmail(email)

        if(!user){
            throw new Error("Invalid Credentials!");
        }
        //match Password
        const isMatch=await bcrypt.compare(password,user.password_hash)
        if(!isMatch){
            throw new Error("Invalid Password!")
        }        
        const token=jwt.sign(
            {
                userId:user.id,
                email:user.email,
                role:user.role
            },
            process.env.JWT_SECRET,{
            expiresIn:'1h'
        });
        //hiding password_hash using object destructuring
        const {password_hash,...safeuser}=user;
        return{
            safeuser,
            token
        }
    }
}
export class LogoutService{
    logoutUser(){
        res.clearCookie(COOKIE_NAME, { path: '/' });
        return res.json({ success: true });
    }
}