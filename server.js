const express = require("express")
const connectToMongo = require("./database/index.js")
const {PORT} = require("./config/index.js")
const router = require("./routes/index.js")
const errorHandler = require("./middlewares/errorHandler.js")
const cookieParser = require("cookie-parser")

const app = express()

app.use(cookieParser())
app.use(express.json())

app.use(router)


connectToMongo()

app.use("/storage", express.static('storage'))


app.use(errorHandler)


app.listen(PORT, ()=>console.log("Backend running on port " + PORT))
