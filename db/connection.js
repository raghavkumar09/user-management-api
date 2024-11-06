import 'dotenv/config'
import mongoose from 'mongoose';

export default function dbConnection() {
    try {
        const conn = mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        if (conn) {
            console.log("Database connected successfully");
        }
    } catch (error) {
        throw new Error(`Database connection error: ${error.message}`);
    }
}