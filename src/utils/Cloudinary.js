import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    // Ensure dotenv variables are loaded
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    await fs.unlink(filePath); // delete local file
    return { url: uploadResult.secure_url };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    console.error("Full Error:", error);
    return null;
  }
};
