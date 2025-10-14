import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});



const uploadOnCloudinary = async (filelocalpath) => {

    try {

        if(!filelocalpath) return null
        //file upload on cloudinary
       const response = await cloudinary.uploader.upload(filelocalpath,{
            resource_type: "auto"
        })
        console.log("file upload successfully!!", response.url);
        return response
        
        
    } catch (error) {
         if (fs.existsSync(filelocalpath)) {
      fs.unlinkSync(filelocalpath); // Clean up local file safely
    }
        return null
    }

}
