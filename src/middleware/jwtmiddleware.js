import jwt from "jsonwebtoken"
import "dotenv/config"
const jwtAuthenticate=(req,res,next)=>{
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message:"Access Denied!"
            });
        }
        //As the stored token is in this format Bearer actual_token 
        const token=authHeader.split(" ")[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        //assigning to actual data
        req.user=decoded;
        console.log(decoded);
        
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Invalid or Token Expired",
        });
    }
};

export default jwtAuthenticate;