import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const DbConnect = async () => {
    try {
       const connectionIntance =   await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`Database Connected !! DB HOST !! ${connectionIntance.connection.host}`);
        
    } catch (error) {
        console.error("DB not connected",error);
        process.exit(1);
    }
} 

export default DbConnect