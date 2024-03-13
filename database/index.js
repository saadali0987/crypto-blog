const mongoose = require("mongoose")
const {MONGO_URL} = require("../config/index.js")



const connectToMongo = async()=>{
    try{
        const conn = await mongoose.connect(MONGO_URL)
        console.log("Database succesfuly connected")
    }catch(err){
        console.log("error: " + err)
    }
}

module.exports = connectToMongo