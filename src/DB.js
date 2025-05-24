import mongoose from "mongoose";
import { DB_NAME } from "./constans.js";

const connectdb = async() => {
        try {
             const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) 
              console.log(`database connected!! DB HOST:${ConnectionInstance.connection.host}`);
        } catch (error) {
            console.log("\n mongodb connection error", error);
            process.exit(1)
        }
}
export default connectdb