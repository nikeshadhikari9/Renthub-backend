//importing room schema
const Room = require("../models/room.models");
const User = require('../models/user.models');
const Review = require('../models/review.models');
//importing cloudinary services
const { uploadInCloudinary } = require("../services/cloudinary.services");

const { esewaInitiatePayment } = require("./transaction.controller")

//importing utility functions
const { getNearbyRooms, roomsWithReviews } = require("../utils/room.utils");


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
                type: "Point",
                coordinates: [longitude, latitude]
            },
            roomImages,
            isPromoted
        })

        let paymentUrl = null;
        if (isPromoted) {
            try {
                const { url } = await esewaInitiatePayment(300, "promoted-room", "esewa", landlordId);
                paymentUrl = url;
                if (!paymentUrl) {
                    return res.status(400).json({ error: "PAYMENT_ERROR", message: "PaymentUrl is missing" });
                }
                return res.status(200).json({
                    url: paymentUrl
                })

            } catch (err) {
                return res.status(400).json({ error: "PAYMENT_ERROR", message: err.message });
            }
        }

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

//filter based rooms returned
const getFilteredRooms = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            isPremium,
            address
        } = req.query;

        // Build dynamic query
        const query = {};

        if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
        if (isPremium) query.isPremium = isPremium === "true";
        if (address) query.address = { $regex: address, $options: "i" }; // case-insensitive partial match

        // Fetch rooms
        const rooms = await Room.find(query).lean(); // lean() for plain JS objects

        // Calculate average rating for each room
        const roomsWithRating = roomsWithReviews(rooms);

        return res.status(200).json({
            message: "Filtered rooms fetched successfully",
            rooms: roomsWithRating
        });
    } catch (error) {
        console.error("DEBUG: Error in getFilteredRooms:", error);
        return res.status(500).json({
            error: "FETCH_ROOMS_ERROR",
            message: "Something went wrong while fetching rooms"
        });
    }
};

//rooms based on location
const locationBasedRooms = async (req, res) => {
    try {

        const userId = req.user._id;
        const user = User.findById(userId);
        const userLocationLat = user.location.latitude;
        const userLocationLng = user.location.longitude;
        if (!userLocationLat || !userLocationLng) {
            return res.status(404).json({
                error: "LOCATION_NOT_FOUND",
                message: "User location not available"
            })
        }
        const rooms = await getNearbyRooms(userLocationLat, userLocationLng);
        if (rooms.length === 0) {
            return res.status(404).json({
                error: "NO_ROOMS_FOUND",
                message: "No rooms available nearby"
            })
        }
        //add reviews to room data
        return res.status(200).json({
            rooms: rooms,
            message: "Rooms available nearby"
        })
    } catch (error) {
        console.error("DEBUG: Error in locationBasedRooms:", error);
        return res.status(500).json({
            error: "FETCH_ROOMS_ERROR",
            message: "Something went wrong while fetching rooms"
        });
    }
}

//get featured rooms
const getFeaturedRooms = async (rea, res) => {
    try {
        const rooms = await Room.find({ isPromoted: true, paid: true });
        if (rooms.length === 0) {
            return res.status(404).json({
                error: "NO_FEATURED_ROOMS",
                message: "No featured Rooms"
            })
        }

        const featuredRooms = roomsWithReviews(rooms);

        return res.status(200).json({
            message: "Featurd rooms found",
            rooms: featuredRooms
        })
    } catch (error) {
        console.error("DEBUG: Error in featuredRooms:", error);
        return res.status(500).json({
            error: "FETCH_ROOMS_ERROR",
            message: "Something went wrong while fetching rooms"
        });
    }
}



module.exports = { addRoom, updateRoom, deleteRoom, getFilteredRooms, locationBasedRooms, getFeaturedRooms }