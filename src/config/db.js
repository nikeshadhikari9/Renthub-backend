const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const {PORT,MONGODBURI}=require("./env");
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODBURI);
        console.log("Database connected\nhttp://localhost:"+PORT+"/");
    } catch (error) {
        console.error("Connection Error:", error);
    }
};

module.exports = connectDB;
