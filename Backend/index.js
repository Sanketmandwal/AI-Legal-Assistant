import express from 'express'
import cors from 'cors'
import connectDB from './services/mongo.js'
import dotenv from 'dotenv';
dotenv.config()
import userrouter from './routes/authRoutes.js';

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

app.use('/api/auth', userrouter);

// REMOVE THIS - Don't start app.listen() again
app.listen(PORT, () => console.log("Server Started on port", PORT));