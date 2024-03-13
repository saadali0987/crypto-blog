const Joi = require("joi")
const User = require("../modals/user.js")
const bcrypt = require("bcryptjs")
const UserDTO = require("../dto/user.js")
const RefreshToken = require("../modals/token.js")
const JWTService = require("../services/jwtServices.js")

const authController = {
    async login(req, res, next) {
        //validation
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().min(5).max(15).required(),
        })

        const { error } = userLoginSchema.validate(req.body)


        if (error) {
            return next(error)
        }

        const { username, password } = req.body

        let user
        try {
            //match username
            user = await User.findOne({ username })
            if (!user) {
                const error = {
                    status: 401,
                    message: "Invalid username"
                }
                return next(error)
            }

            //match password
            const match = await bcrypt.compare(password, user.password)
            if (!match) {
                const error = {
                    status: 401,
                    message: "Invalid password"
                }
                return next(error)
            }


        } catch (err) {
            return next(err)
        }

        const userDto = new UserDTO(user)

        //token generation
        let accessToken = JWTService.signAccessToken({ _id: user._id }, '30m')

        let refreshToken = JWTService.signAccessToken({ _id: user._id }, '60m')



        try {
            //update refresh token
            await RefreshToken.updateOne({
                _id: user._id
            },
                { token: refreshToken },
                { upsert: true }
            )
        } catch (err) {
            return next(err)
        }



        //send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        return res.status(200).json({ user: userDto, auth:true })
    },


    async register(req, res, next) {
        //validation
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(5).max(15).required(),
            confirmPassword: Joi.ref("password")
        })

        const { error } = userRegisterSchema.validate(req.body)


        if (error) {
            return next(error)
        }



        const { username, name, email, password } = req.body

        try {
            //email, username already exists??
            const emailInUse = await User.exists({ email })
            if (emailInUse) {
                const error = {
                    status: 409,
                    message: "Email already registered, Please login or provide another email address"
                }
                return next(error)
            }

            const usernameInUse = await User.exists({ username })
            if (usernameInUse) {
                const error = {
                    status: 409,
                    message: "Username already registered, Please login or provide another Username"
                }
                return next(error)
            }
        } catch (err) {
            return next(error)
        }


        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10)


        //jwt token
        let accessToken;
        let refreshToken;
        let user;

        try {
            //register the user in the database
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashedPassword
            })
            user = await userToRegister.save()

            //token generation
            accessToken = JWTService.signAccessToken({ _id: user._id }, '30m')

            refreshToken = JWTService.signAccessToken({ _id: user._id }, '60m')


        } catch (err) {
            return next(err)
        }


        //store refrsh token in database
        await JWTService.storeRefreshToken(refreshToken, user._id)


        //send token in cookies
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        })




        const userDto = new UserDTO(user)
        return res.status(201).json({ user: userDto, auth:true })
    },


    async logout(req,res,next){
        //delete refresh token from database
        const {refreshToken} = req.cookies

        try{
            await RefreshToken.deleteOne({token: refreshToken})
        }catch(err){
            return next(err)
        }

        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.status(200).json({user: null, auth:false})
    },

    async refresh(req,res,next){
        const originalRefreshToken = req.cookies.refreshToken

        let id;
        try {
            id = JWTService.verifyRefreshToken(originalRefreshToken)._id


        } catch (error) {
            const err = {
                status: 401,
                message: "Unauthorized"
            }
            return next(err)
        }


        try{
            const match = await RefreshToken.findOne({_id: id, token: originalRefreshToken})

            if(!match){
                const error = {
                    status : 401,
                    message : "Unauthorized"
                }
                return next(error)
            }
        }catch(err){
            return next(err)
        }


        try{
            const accessToken = JWTService.signAccessToken({_id: id}, '30m')
            const refreshToken = JWTService.signRefreshToken({_id: id}, '60m')


            await RefreshToken.updateOne({_id:id}, {token:refreshToken})

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })

            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true
            })
        }catch(err){
            return next(err)
        }


        const user = await User.findOne({_id:id})
        const userDto = new UserDTO(user)
        return res.status(200).json({user: userDto, auth:true})
    }
}


module.exports = authController