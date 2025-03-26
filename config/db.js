import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'taskmanager'
        });
        console.log('MongoDB connected successfully');
    }

    catch(error){
        console.log('Error connecting to mongoDB', error.message);
    }
}

export default connectDB;