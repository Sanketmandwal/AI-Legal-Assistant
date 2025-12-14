import mongoose from 'mongoose';

mongoose.connection.on("connected", () => console.log('MongoDB Connected'));


const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/FinalYearProject`);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
};

export default connectDB;