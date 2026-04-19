import mongoose from "mongoose";

export const DBConfig = async () => {
    
    try {
        const DB_url = process.env.mongoDB_URL as string 
        await mongoose.connect(DB_url)
        .then(() => console.log('DB Connected Successfully'))
        .catch(() => console.log('DB Connection failed try again'))
    } catch (error) {
        console.error(error);
    }

}