import express from 'express'
import cors from 'cors'
import connectDB from './services/mongo.js'
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'
dotenv.config()
import lawyerRoutes from "./routes/lawyerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import policeRoutes from "./routes/policeRoutes.js";
import firRoutes from "./routes/firRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";



const app = express();
app.use(cors());

connectDB().catch(err => console.error('DB connection error:', err));

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.send('API is running....');
})

app.cors = {
    origin: 'http://localhost:5173/',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use("/api/auth", authRoutes);
app.use("/api/lawyer", lawyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/fir", firRoutes);
app.use("/api/citizen", citizenRoutes);


app.listen(PORT, () => console.log("Server Started on port", PORT));