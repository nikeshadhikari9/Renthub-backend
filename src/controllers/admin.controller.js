//Database collection model 
const User = require("../models/user.models");
const Room = require("../models/room.models");
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