const User = require('../models/user.models');

const updateUserLocation = async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const userId = req.user._id;
        const user = await User.findById(userId);
        user.location = {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng)
        };
        await user.save();
        return res.status(200).json({ message: "user location updated." })
    } catch (error) {
        console.error("DEBUG: Error in updateUserLocation:", error);
        return res.status(500).json({
            error: "LOCATION_UPDATE_ERROR",
            message: "Something went wrong while updating user location"
        });
    }
}


module.exports = { updateUserLocation }