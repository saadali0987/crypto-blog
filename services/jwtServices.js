const jwt = require("jsonwebtoken")
const {SECRET} = require("../config/index.js")
const RefreshToken = require("../modals/token.js")



class JWTService{
    //sign access token
    static signAccessToken(payload, expiry){
        return jwt.sign(payload, SECRET, {expiresIn:expiry})
    }

    //sign refresh token
    static signRefreshToken(payload, expiry){
        return jwt.sign(payload, SECRET, {expiresIn:expiry})
    }


    //verify access token
    static verifyAccessToken(token){
        return jwt.verify(token, SECRET)
    }

    //VERIFY REGRESH TOKEN
    static verifyRefreshToken(token){
        return jwt.verify(token, SECRET)
    }

    //store refresh token
    static async storeRefreshToken(token, userId){
        try{
            const newToken = new RefreshToken({
                token,
                userId

            })

            await newToken.save()
        }catch(err){
            console.log(err)
        }
    }
}


module.exports = JWTService