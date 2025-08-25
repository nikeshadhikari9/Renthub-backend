//importing room schema
const Room = require("../models/room.models");

//importing cloudinary services
const { uploadInCloudinary } = require("../services/cloudinary.services")

const addRoom = async (req, res) => {
    try {
        const { title, address, price, description, latitude, longitude, isPromoted } = req.body;
        const landlordId = req.user._id;
        if (latitude == null || longitude == null) {
            return res.status(400).json({ error: "FIELDS_MISSING", message: "Location is required" });
        }
        if (!req.files) {
            return res.status(400).json({ error: "FIELDS_MISSING", message: "Room Images are required" })
        }
        const roomImages = [];
        for (const file of req.files) {
            try {
                const result = await uploadInCloudinary(file.path);
                roomImages.push(result.url);
            } catch (err) {
                console.error(`Failed to upload ${file.originalname}:`, err);
            }
        }
        const roomCreated = await Room.create({
            title,
            address,
            price,
            description,
            landlordId,
            location: {
                latitude,
                longitude
            },
            roomImages,
            isPromoted
        })
        return res.status(201).json({
            message: "Room added successfully",
            room: {
                title: title
            }
        })

    } catch (error) {
        console.log("DEBUG: Error from addRoom: ", error)
        return res.status(500).json({ error: "UPDATE_ROOM_ERROR", message: "Something went wrong while adding room" });
    }
}

// Update Room
const updateRoom = async (req, res) => {
    try {
        const { roomId, title, address, price, description, latitude, longitude, isPromoted } = req.body;
        const landlordId = req.user._id;

        // Find the room and make sure it belongs to the logged-in landlord
        const room = await Room.findOne({ _id: roomId, landlordId });
        if (!room) {
            return res.status(404).json({ error: "ROOM_NOT_FOUND", message: "Room not found or you are not authorized" });
        }

        // Update fields if provided
        if (title) room.title = title;
        if (address) room.address = address;
        if (price) room.price = price;
        if (description) room.description = description;
        if (latitude && longitude) room.location = { latitude, longitude };
        if (typeof isPromoted === "boolean") room.isPromoted = isPromoted;

        // If new images are uploaded
        if (req.files && req.files.length > 0) {
            const roomImages = [];
            for (const file of req.files) {
                try {
                    const result = await uploadInCloudinary(file.path);
                    roomImages.push(result.url);
                } catch (err) {
                    console.error(`Failed to upload ${file.originalname}:`, err);
                }
            }
            room.roomImages = roomImages;
        }

        await room.save();

        return res.status(200).json({
            message: "Room updated successfully",
            room
        });
    } catch (error) {
        console.log("DEBUG: Error from updateRoom: ", error);
        return res.status(500).json({ error: "UPDATE_ROOM_ERROR", message: "Something went wrong while updating room" });
    }
};

// Delete Room
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const landlordId = req.user._id;

        // Find the room and make sure it belongs to the logged-in landlord
        const room = await Room.findOne({ _id: roomId, landlordId });
        if (!room) {
            return res.status(404).json({
                error: "ROOM_NOT_FOUND",
                message: "Room not found or you are not authorized"
            });
        }

        // Delete the room
        await Room.deleteOne({ _id: roomId });

        return res.status(200).json({
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.log("DEBUG: Error from deleteRoom: ", error);
        return res.status(500).json({
            error: "DELETE_ROOM_ERROR",
            message: "Something went wrong while deleting room"
        });
    }
};

//get all rooms create by a landloard
const roomsByLandlord = async (req, res) => {
    try {
        const landlordId = req.user._id;
        const rooms = Room.find({ landlordId });
        if (!rooms) {
            return res.status(200).json({
                error: "NO_ROOMS_CREATED",
                message: "You don't have any room listed."
            });
        }
        return res.status(200).json({
            message: "Rooms found created by you",
            rooms: rooms
        })
    } catch (error) {
        console.log("DEBUG: Error from roomsByLandlord: ", error);
        return res.status(500).json({
            error: "LANDLORD'S_ROOM_ERROR",
            message: "Something went wrong while fetching rooms"
        });
    }
}

module.exports = { addRoom, updateRoom, deleteRoom }