const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../config/env");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const isPasswordValid = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

const generateToken = async (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}

const tokenPayloadSchema = Joi.object({
    id: Joi.string().required(),
    role: Joi.string().required()
})

module.exports = { isPasswordValid, generateToken, tokenPayloadSchema };