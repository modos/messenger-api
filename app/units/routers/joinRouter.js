const express = require('express')
const jwtToken = require('../jwtToken')
const db = require('../database')
const router = express.Router()

router.post('', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendJoinRequest(req.headers.authorization.split(" ")[1], req.body.groupId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).send()
    }
})

router.get('', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showUserRequests(req.headers.authorization.split(" ")[1])

    res.json({JoinRequests: requests})
})

router.get('/group', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showUserRequests(req.headers.authorization.split(" ")[1])

    if (requests) {
        res.json(requests)
    }else {
        res.status(400).send({error: {message: "Bad request!"}})
    }
})

router.post('/accept', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.acceptRequest(req.headers.authorization.split(" ")[1], req.body.joinRequestId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).send({error: {message: "Bad Request!"}})
    }
})

module.exports = router