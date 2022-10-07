const express = require('express')
const jwtToken = require('../jwtToken')
const db = require('../database')
const router = express.Router()

router.get('', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showGroupRequests(req.headers.authorization.split(" ")[1])

    if (requests) {
        res.json({requests: requests})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

router.post('', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendConnectionRequest(req.headers.authorization.split(" ")[1], req.body.groupId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

router.post('/accept', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.acceptConnectionRequest(req.headers.authorization.split(" ")[1], req.body.connectionRequestId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

module.exports = router