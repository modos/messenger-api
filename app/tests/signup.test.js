const axios = require('axios').default
const db = require('../units/database')
const configs = require('../configs.json')
const baseUrl = "http://localhost:3000"

describe('Sign up', () => {

    test('returns 400 when body not provided', async () => {
        try {
            await axios.post(baseUrl + '/api/v1/auth/signup')
        } catch (error) {
            expect(error.response.status).toBe(400)
        }
    })

    test('returns 400 when user is already existed', async () => {
        try {
            const res = await axios.post(baseUrl + '/api/v1/auth/signup', {
                name: "reza",
                email: "reza@gmail.com",
                password: "12345678@"
            })

        } catch (error) {
            expect(error.response.status).toBe(400)
        }
    })

    test('returns 200 and jwt when unique data provided', async () => {
        await db.dropCollection("users")
        const res = await axios.post(baseUrl + '/api/v1/auth/signup', {
            name: "reza",
            email: "reza@gmail.com",
            password: "12345678@"
        })

        expect(res.status).toBe(200)
        expect(res.data.token.length > 0).toBeTruthy()
        expect(res.data.success).toBeTruthy()
    })
})