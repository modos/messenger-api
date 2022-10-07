const express = require('express')
const jwtToken = require('../jwtToken')
const db = require('../database')
const validations = require('../validations')
const router = express.Router()

router.post('/signup', validations.validateSignUpBody, async (req, res) => {

    const isUserAlreadyExist = await db.isUserAlreadyExist(req.body.email)

    if (isUserAlreadyExist) {
        res.status(400).json({error: {message: "Bad request!"}})
    }else {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }
    const token = await db.insertUser(user)
    res.json({token: token, success: true})
}

})

router.post('/login', validations.validateLoginBody, async (req, res) => {
    let freshToken = await db.findUserByLogin(req.body.email, req.body.password)
    
    if (freshToken) {
        res.json({token: freshToken, message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

module.exports = router