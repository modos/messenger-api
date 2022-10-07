const express = require('express')
const jwtToken = require('../jwtToken')
const db = require('../database')
const router = express.Router()

router.get('/:user_id', jwtToken.authenticateToken, async (req, res) => {
    const chats = await db.getUserChatsById(req.headers.authorization.split(" ")[1], req.params.user_id)

    if (chats) {
        res.json({messages: chats})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

router.post('/:user_id', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendChat(req.headers.authorization.split(" ")[1], req.params.user_id, req.body.message)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

router.get('', jwtToken.authenticateToken, async (req, res) => {
    const chats = await db.getUserChats(req.headers.authorization.split(" ")[1])

    res.json({chats: chats})
})

module.exports = router 