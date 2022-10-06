const axios = require('axios').default
const db = require('../units/database')
const configs = require('../configs.json')
const baseUrl = "http://localhost:3000"

describe('Login', () => {

    test('returns 400 when body not provided', async () => {
        try {
            await axios.post(baseUrl + '/api/v1/auth/login')
        } catch (error) {
            expect(error.response.status).toBe(400)
        }
    })

    test('returns 400 when user not found', async () => {
        try {
            await axios.post(baseUrl + '/api/v1/auth/login', {
                "email": "modos@gmail.com",
                "password": "12345678@"
            })
        } catch (error) {
            expect(error.response.status).toBe(400)
        }
    })

    test('returns 200 and jwt token when user found', async () => {
        const res = await axios.post(baseUrl + '/api/v1/auth/login', {
            email: "reza@gmail.com",
            password: "12345678@"
        })
        expect(res.status).toBe(200)
        expect(res.data.token.length > 0).toBeTruthy()
        expect(res.data.message).toBe("successful")
    })
})