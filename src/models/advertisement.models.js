const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    businessName: {
        type: String
    },
    contact: {
        type: String
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    adImage: {
        type: String
    },
    createdBy: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Advertisement = mongoose.model("Advertisement", AdSchema);
module.exports = Advertisement;
