//Database collection model 
const User = require("../models/user.models");
const Room = require("../models/room.models");
const Advertisement = require("../models/advertisement.models");
const { uploadInCloudinary } = require("../services/cloudinary.services")
const { esewaInitiatePayment } = require("../controllers/transaction.controller")

const { sendEmail } = require("../services/email.services")
const { paymentEmail } = require("../services/email.bodies.service")
//
const getAllTenants = async (req, res) => {
    try {
        const allTenants = await User.find({ role: "tenant" });
        const { password, ...allTenantsWithoutCredentials } = allTenants;
        return res.status(200).json({
            tenants: allTenantsWithoutCredentials,
            message: "All tenants received"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "GET_ALL_TENANTS_ERROR", message: "Tenants fetch error"
        })
    }
}

const getAllLandlords = async (req, res) => {
    try {
        const allLandlords = await User.find({ role: "landlord" });
        const { password, ...allLandlorsWithoutCredentials } = allLandlords;
        return res.status(200).json({
            landlords: allLandlorsWithoutCredentials,
            message: "All landlords received"
        })
    } catch (error) {
        return res.ststus(500).json({
            error: "GET_ALL_LANDLORDS_ERROR", message: "Landlords fetch error"
        })
    }
}

const getALLAdmins = async (req, res) => {
    try {
        const allAdmins = await User.find({ role: "admin" });
        const { password, ...allAdminsWithCredentials } = allAdmins;
        return res.ststus(200).json({
            admins: allAdminsWithCredentials,
            messages: "All admins received"
        })
    } catch (error) {
        return res.status(500).json({
            error: "GET_ALL_ADMINS_ERROR", message: "Admins fetch error"
        })
    }
}

const getAllRooms = async (req, res) => {
    try {
        const allRooms = await Room.find();
        return res.json({
            message: "All rooms received",
            rooms: allRooms
        })
    } catch (error) {
        return res.status().json({
            error: "GET_ALL_ROOMS", message: "Rooms fetch error"
        })
    }
}

const getAllAdvertisements = async (req, res) => {
    try {

    } catch (error) {

    }
}

const addAdvertisement = async (req, res) => {
    try {
        //email not compulsory
        const { businessName, contact, email, description, address, startDate, endDate, createdBy, type } = req.body
        if (!businessName || !contact || !description || !address || !createdBy) {
            return res.status(400)
                .json({ error: "FIELD_MISSING", message: "All fields are required" });
        }
        //convert string to date
        const startTime = new Date(startDate);
        const endTime = new Date(endDate);

        if (!req.file) {
            return res.status(400).json({ error: "FIELD_MISSING", message: "Adverisement Image is required" })
        }
        let adImage;
        try {
            const result = await uploadInCloudinary(file.path);
            adImage = result.url
        } catch (err) {
            console.error(`Failed to upload ${file.originalname}:`, err);
            return res.status(500).json({ error: "IMAGE_UPLOAD_ERROR", message: "Image upload failed" })
        }

        const advertisement = await Advertisement.create({
            businessName,
            contact,
            email,
            description,
            address,
            adImage,
            createdBy,
            type,
            startTime,
            endTime
        })
        const adId = advertisement._id;

        //ad types amount 
        let amt = 250;
        if (type == "basic") {
            amt = 250
        } else if (type = "featured") {
            amt = 500
        } else if (type == "premium") {
            amt = 1000;
        }
        let paymentUrl = null;
        if (true) {
            try {
                const { url } = await esewaInitiatePayment(amt, "promoted-room", "esewa", adId);
                paymentUrl = url;
                if (!paymentUrl) {
                    return res.status(400).json({ error: "PAYMENT_ERROR", message: "PaymentUrl is missing" });
                }
                if (email) {
                    const transactionDetails = {
                        name: businessName,
                        type: type
                    }
                    const subject = "Advertisement payment required"
                    await sendEmail(email, paymentEmail(transactionDetails, paymentUrl), subject)
                }
                return res.status(201).json({
                    message: "Advertisement created successfully",
                    advertisement: {
                        businessName,
                        description
                    }
                })
            } catch (err) {
                return res.status(400).json({ error: "PAYMENT_ERROR", message: err.message });
            }
        }

    } catch (error) {
        console.log("DEBUG: Error from addRoom: ", error)
        return res.status(500).json({ error: "UPDATE_ROOM_ERROR", message: "Something went wrong while adding room" });
    }
}



//filter based rooms returned
const getFilteredRooms = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            isPremium,
            isPromoted,
            approved,
            paid,
            address,
            lat,
            lng,
            maxDistance, // optional radius for location search (in meters)
        } = req.query;

        // Build dynamic query
        const query = {};

        // Price range
        if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };

        // Boolean flags
        if (isPremium !== undefined) query.isPremium = isPremium === "true";
        if (isPromoted !== undefined) query.isPromoted = isPromoted === "true";
        if (approved !== undefined) query.approved = approved === "true";
        if (paid !== undefined) query.paid = paid === "true";

        // Address search (case-insensitive)
        if (address) query.address = { $regex: address, $options: "i" };

        // Location search (within radius if lat/lng provided)
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
                    $maxDistance: maxDistance ? Number(maxDistance) : 1000, // default 1km
                },
            };
        }

        // Fetch rooms
        const rooms = await Room.find(query).lean();

        // Attach reviews + avgRating
        const roomsWithRating = await roomsWithReviews(rooms);

        return res.status(200).json({
            message: "Filtered rooms fetched successfully",
            rooms: roomsWithRating,
        });
    } catch (error) {
        console.error("DEBUG: Error in getFilteredRooms:", error);
        return res.status(500).json({
            error: "FETCH_ROOMS_ERROR",
            message: "Something went wrong while fetching rooms",
        });
    }
};

const getFilteredUsers = async (req, res) => {
    try {
        const filters = req.query
        const users = await filterUsers(filters)
        return res.status(200).json({
            users: users,
            message: "Users based on filtered parameters"
        })
    } catch (error) {
        console.error("Error in filteredUsers:", error);
        return res.status(500).json({
            error: "FETCH_USERS_ERROR",
            message: "Something went wrong while fetching users",
        });
    }
};

const filterUsers = async (filters) => {
    try {
        const query = {};

        // Text-based filters (search in multiple fields)
        if (filters.search) {
            query.$or = [
                { fullName: { $regex: filters.search, $options: "i" } },
                { profession: { $regex: filters.search, $options: "i" } },
                { email: { $regex: filters.search, $options: "i" } },
                { contact: { $regex: filters.search, $options: "i" } },
                { address: { $regex: filters.search, $options: "i" } },
            ];
        }

        // Role filter
        if (filters.role) query.role = filters.role;

        // Gender filter
        if (filters.gender) query.gender = filters.gender;

        // Address filter
        if (filters.address) query.address = { $regex: filters.address, $options: "i" };

        // Verified filter
        if (filters.isVerified !== undefined) query.isVerified = filters.isVerified === "true";

        // You can add more filters as needed

        const users = await User.find(query)
            .select("-password -token -tokenDate") // exclude password
            .lean();

        return users;
    } catch (error) {
        console.error("Error in filterUsers:", error);
        throw error;
    }
};

//update Advertisements
const updateAdvertisement = async (req, res) => {
    try {
        const { id, businessName, contact, email, description, address, startDate, endDate, type } = req.body;

        // Check if advertisement exists
        const advertisement = await Advertisement.findById(id);
        if (!advertisement) {
            return res.status(404).json({
                error: "NOT_FOUND",
                message: "Advertisement not found",
            });
        }

        // Handle new image upload if provided
        let adImage = advertisement.adImage; // keep old one by default
        if (req.file) {
            try {
                const result = await uploadInCloudinary(req.file.path);
                adImage = result.url;
            } catch (err) {
                console.error(`Failed to upload new image:`, err);
                return res.status(500).json({ error: "IMAGE_UPLOAD_ERROR", message: "Image upload failed" });
            }
        }

        // Update fields only if they are provided
        if (businessName) advertisement.businessName = businessName;
        if (contact) advertisement.contact = contact;
        if (email) advertisement.email = email;
        if (description) advertisement.description = description;
        if (address) advertisement.address = address;
        if (type) advertisement.type = type;
        if (startDate) advertisement.startTime = new Date(startDate);
        if (endDate) advertisement.endTime = new Date(endDate);
        advertisement.adImage = adImage;

        // Save updated advertisement
        await advertisement.save();

        return res.status(200).json({
            message: "Advertisement updated successfully",
            advertisement,
        });
    } catch (error) {
        console.error("DEBUG: Error in updateAdvertisement:", error);
        return res.status(500).json({
            error: "UPDATE_ADVERTISEMENT_ERROR",
            message: "Something went wrong while updating advertisement",
        });
    }
};


//delete Advertisements
const deleteAdvertisement = async (req, res) => {
    try {
        const { advertisementId } = req.params;


        const advertisement = await Advertisement.findOne({ _id: advertisementId });
        if (!advertisement) {
            return res.status(404).json({
                error: "ADVERTISEMENT_NOT_FOUND",
                message: "Advertisement not found or you are not authorized"
            });
        }

        // Delete the room
        await Advertisement.deleteOne({ _id: advertisementId });

        return res.status(200).json({
            message: "Advertisement deleted successfully"
        });
    } catch (error) {
        console.log("DEBUG: Error from deleteAdvertisement: ", error);
        return res.status(500).json({
            error: "DELETE_ADVERTISEMENT_ERROR",
            message: "Something went wrong while deleting advertisement"
        });
    }
};



module.exports = { addAdvertisement, getALLAdmins, getAllLandlords, getAllRooms, getAllAdvertisements, getAllTenants, getFilteredUsers, filterUsers, getFilteredRooms, deleteAdvertisement, updateAdvertisement }