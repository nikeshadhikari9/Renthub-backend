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

const getAllAdvertisementers = async (req, res) => {
    try {
        // const allAdertisements;
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