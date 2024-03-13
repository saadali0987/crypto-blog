const dotenv = require("dotenv").config()


const PORT = process.env.PORT
const MONGO_URL = process.env.MONGO_URL
const SECRET = process.env.SECRET
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH


module.exports = {
    PORT,
    MONGO_URL,
    SECRET,
    BACKEND_SERVER_PATH
}