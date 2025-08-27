const User = require('../models/user.models');
const { uploadInCloudinary } = require("../services/cloudinary.services");
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch user by ID and exclude sensitive fields
        const user = await User.findById(id).select("-password -__v -token -tokenDate"); // exclude password and __v
        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND",
                message: "User not found"
            });
        }
        // Return user details
        return res.status(200).json({
            message: "User found successfully",
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "SERVER_ERROR",
            message: "Something went wrong while fetching user details"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { fullName, address, profession } = req.body;
        const user = User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                error: "USER_NOT_FOUND",
                message: "User not found"
            });
        }
        if (req.file) {
            try {
                const result = await uploadInCloudinary(file.path);
                if (result) {
                    const profileImage = result.url;
                    user.profileImage = profileImage;
                }
            }
            catch (error) {
                console.error(`Failed to upload ${file.originalname}:`, err);
            }
        }
        if (fullName) user.fullName = fullName;
        if (profession) user.profession = profession;
        if (address) user.address = address;
        await user.save();

        //updated user to be returned
        const userTobesent = user.select("-password -__v -token -tokenDate"); // exclude password and __v
        return res.status(200)
            .json({
                message: "Profile updated successfully",
                user: userTobesent
            })

    } catch (error) {
        console.log("DEBUG: Error from updateUser: ", error);
        return res.status(500)
            .json({
                error: "UPDATE_USER_ERROR",
                message: "Something went wrong while updating user"
            });
    }
}

module.exports = { getUserDetails, updateUser }