import jwt from "jsonwebtoken"
import "dotenv/config"

const token=jwt.sign({
    userId:"12345"
},process.env.JWT_SECRET,{expiresIn:'1d'})
console.log(token)