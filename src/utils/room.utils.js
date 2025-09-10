const Room = require("../models/room.models");
const Review = require("../models/review.models");

//get 1km nearby rooms from users location
const getNearbyRooms = async (lat, lng) => {
    try {
        // Step 1: Find nearby rooms
        const nearbyRooms = await Room.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: 1000
                }
            },
            listed: true
        }).lean();

        // Step 2: For each room, fetch its reviews
        const rooms = await roomsWithReviews(nearbyRooms);

        return rooms;
    } catch (error) {
        console.error("DEBUG:Error in getNearbyRooms:", error);
        throw error;
    }
}

//rooms with reviews
const roomsWithReviews = async (rooms) => {
    try {
        const roomsWithReviews = await Promise.all(
            rooms.map(async (room) => {
                const reviews = await Review.find({ roomId: room._id }).populate("userId", "fullName profileImage"); // optional: include user name
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : null;

                return {
                    ...room.toObject(),
                    reviews,     // full review objects
                    avgRating
                };
            })
        );
        return roomsWithReviews;

    } catch (error) {
        console.log("DEBUG:Error in roomsWithReviews (room.utility.js): ", error)
        throw error;
    }
}


//how roomsWithRewies lokk like
// roomsWithReviews = 
// {
//     "_id": "64fabc1234567890abcdef12",
//         "title": "Cozy 1BHK Apartment",
//             "address": "Kathmandu, Nepal",
//                 "price": 12000,
//                     "description": "Near Thamel with balcony view",
//                         "landlordId": "64fabcd0987654321abcdef34",
//                             "location": {
//         "type": "Point",
//             "coordinates": [85.324, 27.717]
//     },
//     "roomImages": [
//         "https://res.cloudinary.com/.../image1.jpg",
//         "https://res.cloudinary.com/.../image2.jpg"
//     ],
//         "approved": true,
//             "isPremium": false,
//                 "isPromoted": true,
//                     "createdAt": "2025-08-26T12:34:56.789Z",
//                         "updatedAt": "2025-08-26T13:00:00.123Z",
//                             "reviews": [
//                                 {
//                                     "_id": "64facd5678901234abcdef56",
//                                     "userId": {
//                                         "_id": "64fabcd0987654321abcdef34",
//                                         "fullName": "Nikesh Adhikari"
//                                     },
//                                     "roomId": "64fabc1234567890abcdef12",
//                                     "rating": 5,
//                                     "comment": "Great place, very clean!",
//                                     "createdAt": "2025-08-26T13:10:00.456Z"
//                                 },
//                                 {
//                                     "_id": "64facd5678901234abcdef57",
//                                     "userId": {
//                                         "_id": "64fabcd0987654321abcdef35",
//                                         "fullName": "Rupen Sharma"
//                                     },
//                                     "roomId": "64fabc1234567890abcdef12",
//                                     "rating": 4,
//                                     "comment": "Nice location, but a bit noisy.",
//                                     "createdAt": "2025-08-26T13:15:00.789Z"
//                                 }
//                             ],
//                                 "avgRating": 4.5
// }

module.exports = { getNearbyRooms, roomsWithReviews }