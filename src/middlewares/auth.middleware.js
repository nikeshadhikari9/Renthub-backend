const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");

const { tokenPayloadSchema } = require('../utils/password.utils');

const verifyAdmin = async (req, res, next) => {
    try {
        //extract jw token from header of request
        const token = req.header("Authorization")?.split(" ")[1];
        // check availability of token
        if (!token)
            return res.status(401)
                .json({ error: "NO_OKEN_PROVIDED", message: "No token provided" });
        //decode the jw token
        const decoded = jwt.verify(token, JWT_SECRET);
        const { error: validationError } = tokenPayloadSchema.validate(decoded);
        if (validationError) {
            return res.status(401).json({
                error: "INVALID_TOKEN_PAYLOAD",
                message: "Token payload is invalid"
            });
        }
        if (decoded.role !== "admin") {
            return res.status(401).json({
                error: "UNAUTHORIZED USER ROLE",
                message: "Unauthorized: Only Admins Allowed"
            });
        }
        req.user = decoded; // Store user details in request object
        next();
    } catch (error) {
        return res.status(500)
            .json({ error: "ADMIN_VERIFICATION_ERROR", message: "Admin verification error" });
    }
}

const verifyLandlord = async (req, res, next) => {
    try {
        //extract jw token from header of request
        const token = req.header("Authorization")?.split(" ")[1];
        // check availability of token
        if (!token)
            return res.status(401)
                .json({ error: "NO_TOKEN_PROVIDED", message: "No token provided" });
        //decode the jw token
        const decoded = jwt.verify(token, JWT_SECRET);
        const { error: validationError } = tokenPayloadSchema.validate(decoded);
        if (validationError) {
            return res.status(401).json({
                error: "INVALID_TOKEN_PAYLOAD",
                message: "Token payload is invalid"
            });
        }
        if (decoded.role !== "landlord") {
            return res.status(403)
                .json({ error: "UNAUTHORIZED USER ROLE", message: "Unauthorized: Only Landlords Allowed" });
        }
        req.user = decoded; // Store user details in request object
        next();
    } catch (error) {
        return res.status(500)
            .json({ error: "LANDLORD_VERIFICATION_ERROR", message: "Landlord verification error" });
    }
}

const verifyLoggedInUser = async (req, res, next) => {
    try {
        //extract jw token from header of request
        const token = req.header("Authorization")?.split(" ")[1];
        // check availability of token
        if (!token)
            return res.status(401)
                .json({ error: "NO_TOKEN_PROVIDED", message: "No token provided" });
        //decode the jw token
        const decoded = jwt.verify(token, JWT_SECRET);
        const { error: validationError } = tokenPayloadSchema.validate(decoded);
        if (validationError) {
            return res.status(401).json({
                error: "INVALID_TOKEN_PAYLOAD",
                message: "Token payload is invalid"
            });
        }
        req.user = decoded; // Store user details in request object
        next();
    } catch (error) {
        return res.status(500)
            .json({ error: "USER_VERIFICATION_ERROR", message: "User verification error" });
    }
}

//middleware that redirects login user from access login, register pages
const redirectLoggedInUser = async (req, res, next) => {
    try {
        // extract token from Authorization header
        const token = req.header("Authorization")?.split(" ")[1];

        // if token exists, decode it to check validity
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);

            // validate token payload
            const { error: validationError } = tokenPayloadSchema.validate(decoded);
            if (validationError) {
                return res.status(401).json({
                    error: "INVALID_TOKEN_PAYLOAD",
                    message: "Token payload is invalid"
                });
            }

            // user is logged in → redirect
            return res.status(401).json({
                error: "TOKEN_PROVIDED",
                message: "User already logged in"
            });
        }

        // no token → proceed to login/register page
        next();
    } catch (error) {
        return res.status(500).json({
            error: "USER_VERIFICATION_ERROR",
            message: "User verification error"
        });
    }
}


module.exports = { verifyAdmin, verifyLandlord, verifyLoggedInUser, redirectLoggedInUser };