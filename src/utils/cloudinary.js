import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileUploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //file upload success
        console.log("🚀 ~ file: cloudinary.js:17 ~ fileUploadOnCloudinary ~ response:", response)
        return response

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove locally saved file after file upload failed
        return null
    }
}

export { fileUploadOnCloudinary }