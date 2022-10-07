const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

// modules
const jwtToken = require('./units/jwtToken')
const db = require('./units/database')
const validations = require('./units/validations')

// routers
const authRouter = require('./units/routers/authRouter')
const connectionRouter = require('./units/routers/connectionRouter')
const chatsRouter = require('./units/routers/chatsRouter')
const groupsRouter = require('./units/routers/groupsRouter')
const joinRouter = require('./units/routers/joinRouter')

// middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/connection_requests', connectionRouter)
app.use('/api/v1/chats', chatsRouter)
app.use('/api/v1/groups', groupsRouter)
app.use('/api/v1/join_requests', joinRouter)

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})