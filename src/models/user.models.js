const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        contactNum: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["tenant", "landlord", "admin"],
            default: "tenant",
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        profession: {
            type: String,
            default: null
        },
        profileImage: {
            type: String,
            default: null
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
            default: null
        },
        tokenDate: {
            type: Date,
            default: null
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
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);
userSchema.index(
    { tokenDate: 1 },
    { expireAfterSeconds: 300, partialFilterExpression: { token: { $exists: true } } }
);
userSchema.pre('save', async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
