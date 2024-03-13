const express = require("express")
const authController = require("../controller/authController.js")
const auth = require("../middlewares/auth.js")
const blogController = require("../controller/blogController.js")
const commentController = require("../controller/commentController.js")

const router = express.Router()







//auth routes
router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/logout",auth, authController.logout)
router.get("/refresh", authController.refresh)


//blog routes
router.post("/blog", auth, blogController.create)
router.get("/blog/all", auth, blogController.getAll)
router.get("/blog/:id", auth, blogController.getById)
router.put("/blog", auth, blogController.update)
router.delete("/blog/:id", auth, blogController.delete)


//comment routes
router.post("/comment", auth, commentController.create)
router.get("/comment/:id", auth, commentController.getById)



module.exports = router