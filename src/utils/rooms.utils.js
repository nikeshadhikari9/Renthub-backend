const Room = require("../models/room.models");

//get 1km nearby rooms from users location
const getNearbyRooms = async (lat, lng) => {
    try {
        const rooms = await Room.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 1000 // meters (1 km)
                }
            }
        });
        return rooms;
    } catch (error) {
        console.error("DEBUG:Error in getNearbyRooms:", error);
        throw error;
    }
}

module.exports = { getNearbyRooms }