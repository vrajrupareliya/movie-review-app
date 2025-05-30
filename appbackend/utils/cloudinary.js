import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });


const uplodeoncloudinary = async(localfilepath) => {
    {
        try {
            if(!localfilepath) return null
            
            // uplode on cloudinary
            const response = await cloudinary.uploader.upload(
                localfilepath, {resource_type: "auto"}
            )
            //file has been successful on cloudinary
            fs.unlinkSync(localfilepath)
            return response;

        } catch (error) {
            fs.unlinkSync(localfilepath)// remove locally saved file as the uploder operation failed
            return null;
        }
    }
}

export {uplodeoncloudinary}