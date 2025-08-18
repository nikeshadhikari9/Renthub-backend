const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    title: { 
        type: String, 
        required: true
    },
    message: {
        type: String,
        required:true
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});
const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification
