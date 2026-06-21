import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import "dotenv/config"
import authRoutes from './src/Features/Auth/routes/authRoutes.js'
import jwtAuthenticate from './src/middleware/jwtmiddleware.js'

const app=express();

// Fix for __dirname when using ES modules
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

// Req Folder Paths generation
const viewsPath=path.join(__dirname,'views');
const publicPath=path.join(__dirname,'public');

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(express.json());
app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));



// Authentication Routes
app.use("/api/auth",authRoutes);

app.get("/test",jwtAuthenticate,(req,res)=>{
    res.json({
        success:true,
        user:req.user
    });
})

//Server Listening
const port=3000;
const host='localhost';
app.listen(port,host,()=>{
    console.log(`Server Listening at http://${host}:${port}`);
})