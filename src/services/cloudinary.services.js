const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { CLOUDNAME, API_KEY, API_SECRET } = require("../config/env")

cloudinary.config({
    cloud_name: CLOUDNAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});
const uploadInCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath)
            return null;

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            folder: 'Room-Images',
            use_filename: true
        });
        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Local file deleted due to error.");
        }
        return null;
    }
}
module.exports = { uploadInCloudinary };
