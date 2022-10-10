const axios = require('axios').default
const db = require('../units/database')
const configs = require('../configs.json')
const baseUrl = "http://localhost:3000"

let token;

beforeAll(async () => {
    const res = await axios.post(baseUrl + '/api/v1/auth/login', {
        email: "reza@gmail.com",
        password: "12345678@"
    })

    token = res.data.token
})

describe('Group', () => {

    test('returns 401 when jwt not provided', async () => {
        try {
            await axios.post(baseUrl + '/api/v1/groups')
        } catch (error) {
            expect(error.response.status).toBe(401)
        }
    })

    test('returns 400 when body not provided', async () => {
        try {
            await axios.post(baseUrl + '/api/v1/groups', {}, {
                headers: { "Authorization": `bearer ${token}`, "Content-Type": 'application/json' }
            })
        } catch (error) {
            expect(error.response.status).toBe(400)
        }
    })

    test('returns 200 when group created', async () => {
        const res = await axios.post(baseUrl + '/api/v1/groups', {
            name: "reza is king",
            description: "first group"
        }, {
            headers: { "Authorization": `bearer ${token}`, "Content-Type": 'application/json' }
        })

        expect(res.status).toBe(200)
    })
})