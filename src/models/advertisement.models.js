const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    businessName: {
        type: String
    },
    contact: {
        type: String
    },
    email: {
        type: String,
        default: null
    },
    description: {
        type: String
    },
    address: {
        type: String
    },
    adImage: {
        type: String
    },
    createdBy: {
        type: String
    },
    type: {
        type: String,
        enum: ["basic", "featured", "premium"],
        default: "basic"
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    paymentStatus: {
        type: ["pending", "completed", "refunded", "rejected"],
        default: "pending"
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    }
}, { timestamps: true }
);

const Advertisement = mongoose.model("Advertisement", AdSchema);
module.exports = Advertisement;
