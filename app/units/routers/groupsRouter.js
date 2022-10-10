const express = require('express')
const jwtToken = require('../jwtToken')
const db = require('../database')
const { validateCreateGroupBody } = require('../validations')
const router = express.Router()

router.post('', [jwtToken.authenticateToken, validateCreateGroupBody], async (req, res) => {
    let groupId = await db.createGroup(req.body.name, req.body.description, req.headers.authorization.split(" ")[1])

    if (groupId) {
        return res.json({
            group: {
                id: groupId
            },
            message: "successful"
        })
    }else {
        return res.status(400).json({message: "Bad request!"})
    }
})

router.get('', jwtToken.authenticateToken, async (req, res) => {
    const groups = await db.getAllGroups()

    res.json({groups: groups})
    
})

router.get('/my', jwtToken.authenticateToken, async (req, res) => {
    const group = await db.getUserGroup(req.headers.authorization.split(" ")[1])

    if (group) {
        res.json({group: group})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

module.exports = router