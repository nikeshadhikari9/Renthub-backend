const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId, ref: "User"
        },
        location: {
            type: {
                latitude: {
                    type: Number,

                },
                longitude: {
                    type: Number,
                },
            },
        },
        roomImages: {
            type: [String],
            default: []
        },
        approved: {
            type: Boolean,
            default: false
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        isPromoted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
