const Room = require("../models/room.models")

//get all rooms created by a landloard
const roomsByLandlord = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const rooms = await Room.find({ landlordId });
        if (rooms.length === 0) {
            return res.status(200).json({
                error: "NO_ROOMS_CREATED",
                message: "You don't have any room listed."
            });
        }
        return res.status(200).json({
            message: "Rooms created by you",
            rooms
        });
    } catch (error) {
        console.log("DEBUG: Error from roomsByLandlord: ", error);
        return res.status(500).json({
            error: "LANDLORDS_ROOM_ERROR",
            message: "Something went wrong while fetching rooms"
        });
    }
}

module.exports = { roomsByLandlord }
