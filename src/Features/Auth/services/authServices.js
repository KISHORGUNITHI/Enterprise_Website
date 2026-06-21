import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {UserRepository} from "../Repositories/userRepository.js"
import "dotenv/config"

export class RegisterService{
    constructor(){
        this.userRepository=new UserRepository();
    }
    async regitserUser(userData){
        console.log(userData)
        const {username,email,password}=userData;
        console.log(username);

        await this.emailExistenceCheck(email);

        this.validatePassword(password);

        const hashedPassword=await bcrypt.hash(password, 10);

        const user=await this.userRepository.createUser({
            username,
            email,
            password_hash:hashedPassword
        });

        const token = this.generateToken(user.id);
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
        if(password.length<8){
            throw new Error("Password must alteast 8 character long");
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

        const {password_hash,...safeuser}=user;
        return{
            safeuser,
            token
        }
    }
}
export class LogoutService{

}