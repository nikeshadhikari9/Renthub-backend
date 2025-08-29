//Database collection model
const User = require("../models/user.models");
const BlacklistedToken = require("../models/blacklistedToken.models");

//import functions from password.utils.js
const { isPasswordValid, generateToken } = require('../utils/password.utils');

//import semail sending service
const { sendEmail } = require("../services/email.services");

//import reset email body 
const { resetEmailBody } = require("../services/email.bodies.service")

//function for registerUser
const registerUser = async (req, res) => {
    try {
        //extract data from body from frontend
        const { fullName, email, contactNum, address, gender, password, role, profession } = req.body;
        //check existedUser with email and contact Number
        const checkExistedUserWithEmail = await User.findOne({ email });
        const checkExistedUserWithNumber = await User.findOne({ contactNum });

        if (checkExistedUserWithEmail) {
            return res.status(409)
                .json({ error: "EMAIL_ALREADY_REGISTERED", message: "Email already registered." });
        }
        if (checkExistedUserWithNumber) {
            return res.status(409)
                .json({ error: "NUMBER_ALREADY_REGISTERED", message: "Number already registered." });
        }
        if (role == "admin") {
            return res.status(403)
                .json({ error: "UNAUTHORIZED_ACCESS", message: "User can't register as admin" });
        }

        const newUser = await User.create({
            fullName,
            email,
            contactNum,
            address,
            gender,
            role,
            profession,
            password
        });
        return res.status(201)
            .json({
                message: "User registered successfully.",
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name
                }
            });

    }
    catch (error) {
        console.log("error" + error);
        return res
            .status(500)
            .json({ error: "Registration Failed" })
    }
}

//controller to login Users 
const loginUser = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { contactNum: emailOrPhone }]
        })

        if (!user) {
            return res.status(404)
                .json({ error: "USER_NOT_FOUND", message: "User not found." })
        }

        const passwordMatching = await isPasswordValid(password, user.password);
        if (!passwordMatching) {
            return res.status(400)
                .json({ error: "INVALID_CREDENTIALS", message: "Invalid credentials." });
        }

        const token = await generateToken(user);
        return res.status(201)
            .json({
                message: "Logged in successfully.",
                token: token,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    contactNum: user.contactNum,
                    address: user.address,
                    role: user.role,
                    gender: user.gender,
                    profession: user.profession,
                    location: user.location,
                    profession: user.profession,
                    profileImage: user.profileImage,
                    isVerified: user.isVerified
                }
            });

    } catch (error) {
        return res.status(401)
            .json({ error: "LOGIN_ERROR", message: "Login error" })
    }
}

//controller for admin login
const loginAdmin = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        const admin = await User.findOne({ email: emailOrPhone });

        if (!admin) {
            return res.status(404)
                .json({ error: "ADMIN_NOT_FOUND", message: "Admin not found." })
        }

        if (admin.role != "admin") {
            return res.status(403)
                .json({ error: "UNAUTHORIZED_ACCESS", message: "Unauthorized access." });
        }

        const passwordMatching = await isPasswordValid(password, admin.password);
        if (!passwordMatching) {
            return res.status(400)
                .json({ error: "INVALID_CREDENTIALS", message: "Invalid credentials." });
        }

        const token = await generateToken(admin);
        return res.status(201)
            .json({
                message: "Logged in successfully.",
                token: token,
                admin: {
                    _id: admin._id,
                    fullName: admin.fullName,
                    email: admin.email,
                    contactNum: admin.contactNum,
                    address: admin.address,
                    role: admin.role,
                }
            });
    }
    catch (error) {
        return res
            .status(401)
            .json({ error: "ADMIN_LOGIN_ERROR", message: "Admin login error" });
    }
}

const logout = async (req, res) => {
    try {
        // Extract token from Authorization header
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token)
            return res.status(401)
                .json({ error: "NO_tOKEN_PROVIDED", message: "No token provided" });

        //store Blacklisted Token in blaclistedToken collection
        await BlacklistedToken.create({ token });

        return res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        return res.status(500)
            .json({ error: "LOGOUT_ERROR", message: "Logout error" });
    }
};

//controller to resetLoggedInUser Password
const resetPassword = async (req, res) => {
    try {
        const { oldPassword, password } = req.body;
        //extracting user info from request object
        const userId = req.user._id;
        const user = User.findById(userId);

        if (!user) {
            return res.status(404)
                .json({ error: "USER_NOT_FOUND", message: "User not found." })
        }
        if (oldPassword == password) {
            return res.status(400).json({
                error: "PASSWORD_MATCHES", message: "New password must be different that old one."
            })
        }
        user.password = password;
        user.save();
        return res.status(201), json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ error: "RESET_PASSWORD_ERROR", message: "Reset password unsuccessfull" })
    }
}

//forgetPassword email sending logic
const forgetPasswordEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne(email);

        if (!user) {
            return res.status(404)
                .json({ error: "USER_NOT_FOUND", message: "User not found." })
        }
        const mailSendDate = new Date();
        const token = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        user.token = token;
        user.tokenDate = mailSendDate;
        user.save();
        const subject = "Reset Password Email"
        await sendEmail(user, resetEmailBody(user), subject);
        return res.status(200).json({ message: "Reset password email sent" });
    } catch (error) {
        return res.status(500).json({ error: "FORGET_PASSWORD_ERROR", message: "Reset email sent error" })
    }
}

//forget password, to reset password logic
const forgetPassword = async (req, res) => {
    try {
        const { password, email } = req.body;
        const user = await User.findOne(email);
        if (!user) {
            return res.status(404)
                .json({ error: "USER_NOT_FOUND", message: "User not found." })
        }
        user.password = password;
        user.save();
        return res.status(201).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ error: "FORGET_PASSWORD_ERROR", message: "Forget Pssword Error" });
    }
}



module.exports = { registerUser, loginUser, loginAdmin, logout, resetPassword, forgetPasswordEmail, forgetPassword }