require('dotenv').config(); // Load variables from .env into process.env

module.exports = {
  PORT: process.env.PORT,
  MONGODBURI: process.env.MONGODB_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  APP_EMAIL: process.env.APP_EMAIL,
  APP_PASSWORD: process.env.APP_PASSWORD,
  APP_PORT: process.env.APP_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || 'development',
  // cloudinary env variables
  CLOUDNAME: process.env.CLOUDNAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET,
  SIGHT_API_SECRET: process.env.SIGHT_API_SECRET,
  SIGHT_API_USER: process.env.SIGHT_API_USER,
}