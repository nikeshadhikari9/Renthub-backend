const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId, ref: "Room"
    },
    rating: {
        type: Number, min: 1, max: 5
    },
    comment: {
        type: String
    },
    likes: {
        type: Number
    },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
