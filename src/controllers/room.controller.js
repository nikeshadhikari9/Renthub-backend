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
        return res.status(201).json({ message: "Room added successfully" })

    } catch (error) {
        console.log("DEBUG: Error from addRoom: ", error)
        return res.status()
    }
}

const updateRoom = async (req, res) => {
    try {
        const { roomId, title, address, price, description, latitude, longitude } = req.body;
        
    } catch (error) {

    }
}
module.exports = { addRoom }