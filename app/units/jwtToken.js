const jwt = require('jsonwebtoken')
const configs = require('../configs.json')

function generateToken(id) {
    return jwt.sign(
        {userId: id},
        configs.secret,
        {expiresIn: '1h'}
    )
}

function authenticateToken(req, res, next) {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.status(401).send()
    
        jwt.verify(token, configs.secret, (err) => {
            if (err) return res.status(401).json({
                error: {
                    message: "Bad request!"
                }
            })
            next()
        })
    }

function getUserIdByToken(token) {
    return jwt.verify(token, configs.secret).userId
}    

module.exports = {generateToken, authenticateToken, getUserIdByToken}