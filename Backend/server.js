import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';


//app config
const app = express();
const port = 4000 || process.env.PORT;
connectDB();
connectCloudinary();


//middlewares
app.use(express.json());
app.use(cors());


// end Points
app.use('/api/admin' , adminRouter)


app.get('/' , (req , res)=>{
    res.send("API is Working.")  
})


app.listen(port , ()=> console.log("server started at PORT:" , port))