const express = require('express')
const bodyParser = require('body-parser')
const jwtToken = require('./units/jwtToken')
const db = require('./units/database')
const validations = require('./units/validations')
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post('/api/v1/auth/signup', validations.validateSignUpBody, async (req, res) => {

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

app.post('/api/v1/auth/login', async (req, res) => {
    let freshToken = await db.findUserByLogin(req.body.email, req.body.password)
    
    if (freshToken) {
        res.json({token: freshToken, message: "seccessful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.get('/api/v1/connection_requests', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showGroupRequests(req.headers.authorization.split(" ")[1])

    if (requests) {
        res.json({requests: requests})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.post('/api/v1/connection_requests', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendConnectionRequest(req.headers.authorization.split(" ")[1], req.body.groupId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.post('/api/v1/connection_requests/accept', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.acceptConnectionRequest(req.headers.authorization.split(" ")[1], req.body.connectionRequestId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.get('/api/v1/chats/:user_id', jwtToken.authenticateToken, async (req, res) => {
    const chats = await db.getUserChatsById(req.headers.authorization.split(" ")[1], req.params.user_id)

    if (chats) {
        res.json({messages: chats})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.post('/api/v1/chats/:user_id', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendChat(req.headers.authorization.split(" ")[1], req.params.user_id, req.body.message)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.post('/api/v1/groups', jwtToken.authenticateToken, async (req, res) => {
    let groupId = await db.createGroup(req.body.name, req.body.description, req.headers.authorization.split(" ")[1])

    if (groupId) {
        res.json({
            group: {
                id: groupId
            },
            message: "successful"
        })
    }else {
        res.status(400).json({message: "Bad request!"})
    }
})

app.get('/api/v1/groups', jwtToken.authenticateToken, async (req, res) => {
    const groups = await db.getAllGroups()

    res.json({groups: groups})
    
})

app.get('/api/v1/groups/my', jwtToken.authenticateToken, async (req, res) => {
    const group = await db.getUserGroup(req.headers.authorization.split(" ")[1])

    if (group) {
        res.json({group: group})
    }else {
        res.status(400).json({error: {message: "Bad request!"}})
    }
})

app.get('/api/v1/chats', jwtToken.authenticateToken, async (req, res) => {
    const chats = await db.getUserChats(req.headers.authorization.split(" ")[1])

    res.json({chats: chats})
})

app.post('/api/v1/join_requests', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.sendJoinRequest(req.headers.authorization.split(" ")[1], req.body.groupId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).send()
    }
})

app.get('/api/v1/join_requests', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showUserRequests(req.headers.authorization.split(" ")[1])

    res.json({JoinRequests: requests})
})

app.get('/api/v1/join_requests/group', jwtToken.authenticateToken, async (req, res) => {
    const requests = await db.showUserRequests(req.headers.authorization.split(" ")[1])

    if (requests) {
        res.json(requests)
    }else {
        res.status(400).send({error: {message: "Bad request!"}})
    }
})

app.post('/api/v1/join_requests/accept', jwtToken.authenticateToken, async (req, res) => {
    const flag = await db.acceptRequest(req.headers.authorization.split(" ")[1], req.body.joinRequestId)

    if (flag) {
        res.json({message: "successful"})
    }else {
        res.status(400).send({error: {message: "Bad Request!"}})
    }
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})