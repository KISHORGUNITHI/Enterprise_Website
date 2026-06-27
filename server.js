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
app.use("/",authRoutes);
app.use("/api/auth",authRoutes);

app.get("/test-jwt",jwtAuthenticate,(req,res)=>{
    res.json({
        success:true,
        user:req.user
    });
})

//Testing the frontend(auth)
app.get("/test-frontend",(req,res)=>{
    res.render("auth/auth");
})

// Dummy data for products and reviews
const products = [
  {
    name: 'iPhone 15 Pro Max',
    price: '₹1,44,900',
    description: 'A titanium masterpiece with a 5x Telephoto camera, action button, and A17 Pro chip.',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    price: '₹1,29,999',
    description: 'Galaxy AI is here. Epic zoom capabilities, titanium frame, and built-in S Pen.',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'MacBook Pro 14" M3',
    price: '₹1,69,900',
    description: 'The most advanced laptop chip for demanding workflows. Over 22 hours of battery life.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Sony WH-1000XM5',
    price: '₹29,990',
    description: 'Industry-leading noise canceling headphones with exceptional sound and call quality.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

const testimonials = [
  {
    name: 'Rohan Sharma',
    role: 'Local Business Owner',
    text: 'Highly recommend buying from Enterprise Store! Got my S24 Ultra here. They matched online prices, gave me zero-interest EMI on the spot, and transferred my data in 10 minutes. Super friendly service!'
  },
  {
    name: 'Priya Patel',
    role: 'Software Engineer',
    text: 'The best local store in town. Delivery was done within 2 hours of ordering online. Plus, knowing I can walk into the store if anything goes wrong gives me huge peace of mind compared to big e-commerce sites.'
  },
  {
    name: 'Vikram Singh',
    role: 'Professional Photographer',
    text: 'Excellent customer support. They helped me compare different models, offered the best deals, and gave a free premium screen guard and case. Truly our own local store.'
  }
];

// Main landing page route
app.get('/', (req, res) => {
  res.render('landing/landing', { products, testimonials });
});

//Server Listening
const port=3000;
const host='localhost';
app.listen(port,host,()=>{
    console.log(`Server Listening at http://${host}:${port}`);
})