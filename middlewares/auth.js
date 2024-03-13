
const JWTService = require("../services/jwtServices.js")
const User = require("../modals/user.js")
const UserDTO = require("../dto/user.js")

const auth = async (req, res, next) => {
    try {
        const { refreshToken, accessToken } = req.cookies

        if (!refreshToken || !accessToken) {
            const error = {
                status: 401,
                message: "Unauthorized"
            }
            return next(error)
        } 

        let _id

        try {
            _id = JWTService.verifyAccessToken(accessToken)._id
        } catch (err) {
            return next(err)
        }


        let user;
        try {
            user = await User.findOne({ _id })
        } catch (err) {
            return next(err)
        }

        const userDto = new UserDTO(user)

        req.user = userDto

        next()
    } catch (err) {
        return next(err)
    }


}


module.exports = auth