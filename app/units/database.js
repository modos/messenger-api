const crypto = require('crypto')
const jwtToken = require('./jwtToken')
const configs = require('../configs.json')

let MongoClient = require('mongodb').MongoClient

async function connect() {
    const client = new MongoClient(configs.db.url)

    try {
        await client.connect()
    } catch (error) {
        console.log(error)
    }

    return client

}

async function isUserAlreadyExist(email) {
    const client = await connect()
    let isExisted = false
    try {
        isExisted = await client.db(configs.db.name).collection(configs.db.users).findOne({ email: email })
    } catch (error) {
        console.log(error)
    }

    if (isExisted) {
        return true
    }

    return false
}

async function insertUser(user) {
    const client = await connect()
    const id = crypto.randomUUID()
    const token = jwtToken.generateToken(id)
    try {
        await client.db(configs.db.name).collection(configs.db.users).insertOne({ ...user, uuid: id, token: token })
        return token
    } catch (error) {
        console.log(error)
    }
}

async function createGroup(name, description, token) {
    const admin_id = jwtToken.getUserIdByToken(token)
    const uuid = crypto.randomUUID()
    const group = {
        uuid: uuid,
        name: name,
        description: description,
        admin_id: admin_id
    }

    const client = await connect()

    try {
        const admin = await findUserById(admin_id)
        client.db(configs.db.name).collection(configs.db.groups).insertOne({ ...group, members: [admin] })
        updateUserGroup(admin_id, uuid)

        return uuid
    } catch (error) {
        console.log(error)
    }

    return null
}

async function getUserGroup(token) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    let group = null
    try {
        let gid = await client.db(configs.db.name).collection(configs.db.usergroups).findOne({ userId: userId })
        group = await client.db(configs.db.name).collection(configs.db.groups).findOne({ uuid: gid.groupId }, { projection: { _id: 0, uuid: 0, admin_id: 0 } })
        console.log(group);

    } catch (error) {
        console.log(error)
        group = null
    }

    return group
}

async function updateUserGroup(userId, groupId) {
    const client = await connect()
    client.db(configs.db.name).collection(configs.db.usergroups).insertOne({ userId: userId, groupId: groupId })
}

async function findUserById(id) {
    const client = await connect()
    let user = null

    try {
        user = await client.db(configs.db.name).collection(configs.db.users).findOne({ uuid: id }, { projection: { _id: 0, token: 0, password: 0 } })
    } catch (error) {
        console.log(error)
        user = null
    }

    return { id: user.uuid, name: user.name, email: user.email, rule: 'Owner' }
}

async function getAllGroups() {
    const client = await connect()
    let temp = []
    let groups = []

    try {
        temp = await client.db(configs.db.name).collection(configs.db.groups).find({}, { $sort: -1, projection: { _id: 0, admin_id: 0, members: 0 } }).toArray()
        for (let index = 0; index < temp.length; index++) {
            groups[index] = {
                id: temp[index].uuid,
                name: temp[index].name,
                description: temp[index].description
            }
        }
    } catch (error) {
        console.log(error)
        groups = null

    }

    return groups

}

async function findUserByLogin(email, password) {
    const client = await connect()
    let user = null
    let freshToken = null
    try {
        user = await client.db(configs.db.name).collection(configs.db.users).findOne({ email: email, password: password })
        if (!user) return null
        freshToken = jwtToken.generateToken(user.uuid)
        await client.db(configs.db.name).collection(configs.db.users).updateOne({ uuid: user.uuid }, { $set: { token: freshToken } })
    } catch (error) {
        console.log(error)
        freshToken = null
    }

    return freshToken
}

async function sendJoinRequest(token, groupId) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    const uuid = crypto.randomUUID()
    try {
        const userHasGroupAlready = await hasUserGroup(token)
        if (userHasGroupAlready) return false

        await client.db(configs.db.name).collection(configs.db.requestgroups).insertOne({ id: uuid, userId: userId, groupId: groupId, date: new Date().toISOString() })

    } catch (error) {
        console.log(error)
    }

    return true
}

async function showGroupRequests(token) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    let requests = []

    try {
        const group = await client.db(configs.db.name).collection(configs.db.groups).findOne({ admin_id: userId })

        if (!group) return null
        console.log(group)
        requests = await client.db(configs.db.name).collection(configs.db.requestgroups).find({ groupId: group.uuid }, { sort: { date: -1 } }).toArray()
        console.log(requests)
    } catch (error) {
        console.log(error)
        requests = null

    }

    return requests
}

async function showUserRequests(token) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    let requests = null
    try {
        requests = await client.db(configs.db.name).collection(configs.db.requestgroups).find({ userId: userId }, { sort: { date: -1 }, projection: { _id: 0 } }).toArray()
        requests = await JSON.parse(JSON.stringify(requests))

    } catch (error) {
        console.log(error)
        requests = null
    }


    return requests
}

async function hasUserGroup(userId) {
    const client = await connect()
    let flag = false
    try {
        const u = await client.db(configs.db.name).collection(configs.db.usergroups).findOne({ userId: userId })
        if (u) {
            flag = true
        }
    } catch (error) {
        console.log(error)
    }

    return flag

}

async function acceptRequest(token, requestId) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)

    try {
        const group = await client.db(configs.db.name).collection(configs.db.groups).findOne({ admin_id: userId })

        if (!group) return false

        const request = await client.db(configs.db.name).collection(configs.db.requestgroups).findOne({ groupId: group.uuid, id: requestId })

        if (request) {
            await addMember(requestId, group.uuid)
            removeRequest(requestId)

            return true
        }

        return false

    } catch (error) {
        console.log(error)
    }

    return true


}

async function removeRequest(requestId) {
    const client = await connect()

    try {
        await client.db(configs.db.name).collection(configs.db.requestgroups).deleteOne({ id: requestId })
    } catch (error) {
        console.log(error)
    }
}

async function removeConnectionRequest(requestId) {
    const client = await connect()

    try {
        await client.db(configs.db.name).collection(configs.db.connectionrequests).deleteOne({ id: requestId })
    } catch (error) {
        console.log(error)
    }
}

async function addMember(requestId, groupId) {
    const client = await connect()

    try {
        let userId = await client.db(configs.db.name).collection(configs.db.requestgroups).findOne({ id: requestId })
        userId = userId.userId

        const user = await client.db(configs.db.name).collection(configs.db.users).findOne({ uuid: userId }, { projection: { _id: 0, password: 0, token: 0 } })

        await client.db(configs.db.name).collection(configs.db.groups).updateOne({ uuid: groupId }, { $push: { members: { id: user.uuid, name: user.name, email: user.email, rule: "normal" } } })

    } catch (error) {
        console.log(error)
    }
}

async function getUserChats(token) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    let temp = []
    let chats = []

    try {
        temp = await client.db(configs.db.name).collection(configs.db.chats).find({ $or: [{ firstUserId: userId }, { secondUserId: userId }] }, { sort: { $natural: -1 }, projection: { _id: 0 } }).toArray()
        console.log(temp)
        for (let index = 0; index < temp.length; index++) {
            if (temp[index].firstUserId === userId) {
                chats[index] = { userId: temp[index].secondUserId, message: temp[index].message }
            } else if (temp[index].secondUserId === userId) {
                chats[index] = { userId: temp[index].firstUserId, message: temp[index].message }
            }

        }

        console.log(chats)

    } catch (error) {
        console.log(error)
        chats = []
    }

    return chats
}

async function sendChat(token, userId, message) {
    const client = await connect()
    const mainUserId = jwtToken.getUserIdByToken(token)

    try {
        const users = await client.db(configs.db.name).collection(configs.db.groups).findOne({ $and: [{ "members.id": mainUserId }, { "members.id": userId }] })


        if (!users) return null

        await client.db(configs.db.name).collection(configs.db.chats).insertOne({ firstUserId: mainUserId, secondUserId: userId, message: message })

    } catch (error) {
        console.log(error)
        return null
    }

    return true
}

async function getUserChatsById(token, secondUserId) {
    const client = await connect()
    const firstUserId = jwtToken.getUserIdByToken(token)
    let chats = null
    try {
        chats = await client.db(configs.db.name).collection(configs.db.chats).find(
            {
                $or: [
                    { $and: [{ firstUserId: firstUserId }, { secondUserId: secondUserId }] },
                    { $and: [{ secondUserId: firstUserId }, { firstUserId: secondUserId }] }]
            })

        if (!chats) return null
    } catch (error) {
        console.log(error)
        return null
    }

    return chats
}

async function acceptConnectionRequest(token, connectionRequestId) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)

    let flag = false

    try {
        const isOwner = await client.db(configs.db.name).collection(configs.db.groups).findOne({ admin_id: userId })

        if (!isOwner) return false


        flag = await mergeGroups(isOwner.uuid, connectionRequestId)
        removeConnectionRequest(connectionRequestId)
    } catch (error) {
        console.log(error)
        flag = false
    }

    return flag
}

async function mergeGroups(firstGroupId, connectionRequestId) {
    const client = await connect()

    try {
        const conRequest = await client.db(configs.db.name).collection(configs.db.connectionrequests).findOne({ uuid: connectionRequestId })

        const secondMembers = await client.db(configs.db.name).collection(configs.db.groups).findOne({ uuid: conRequest.first })
        console.log(secondMembers.members)
        await client.db(configs.db.name).collection(configs.db.groups).updateOne({ uuid: firstGroupId }, { $push: { members: secondMembers.members } })

        await client.db(configs.db.name).collection(configs.db.groups).deleteOne({ uuid: conRequest.first })
    } catch (error) {
        console.log(error)

        return false

    }

    return true
}

async function sendConnectionRequest(token, groupId) {
    const client = await connect()
    const userId = jwtToken.getUserIdByToken(token)
    const uuid = crypto.randomUUID()
    try {
        const isOwner = await client.db(configs.db.name).collection(configs.db.groups).findOne({ admin_id: userId })
        if (!isOwner) return false

        await client.db(configs.db.name).collection(configs.db.connectionrequests).insertOne({ uuid: uuid, first: isOwner.uuid, second: groupId })
    } catch (error) {
        console.log(error)
        return false
    }

    return true
}

async function dropCollection(name) {
    try {
        const client = await connect()
        await client.db(configs.db.name).collection(name).drop()
        client.close()
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    insertUser,
    findUserByLogin,
    createGroup,
    getAllGroups,
    getUserGroup,
    sendJoinRequest,
    showUserRequests,
    showGroupRequests,
    acceptRequest,
    sendConnectionRequest,
    acceptConnectionRequest,
    getUserChatsById,
    sendChat,
    getUserChats,
    isUserAlreadyExist,
    dropCollection
}