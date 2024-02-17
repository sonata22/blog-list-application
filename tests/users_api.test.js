const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const assert = require('assert')
//mongoose.set("bufferTimeoutMS", 30000)

// The tests only use the express application defined in the app.js file, which does not
// listen to any ports. The documentation for supertest says: if the server is not already
// listening for connections then it is bound to an ephemeral port for you so there is no
// need to keep track of ports. In other words, supertest takes care that the application 
// being tested is started at the port that it uses internally.

const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in db', () => {

    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({
            username: 'root',
            passwordHash
        })

        await user.save()
    }, 10000)

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper status code and message if username already taken',
        async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })

    describe('insure invalid user is not created', () => {
        test('if username undefined', async () => {
            const initialUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(initialUsersNum.body.length, 1)
            const newUser = {
                username: undefined,
                name: "Jonathan",
                password: "simplePassword",
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const error = (JSON.parse(result.error.text)).error
            assert.strictEqual(
                error,
                'User validation failed: username: Username is mandatory.')
            const finalUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(finalUsersNum.length, initialUsersNum.length)
        })

        test('if password undefined', async () => {
            const initialUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(initialUsersNum.body.length, 1)
            const newUser = {
                username: "smarty",
                name: "Jonathan",
            }
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const error = (JSON.parse(result.text)).error
            assert.strictEqual(
                error,
                'Password is mandatory.')
            const finalUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(finalUsersNum.length, initialUsersNum.length)
        })

        test('if username is under 3 chars', async () => {
            const initialUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(initialUsersNum.body.length, 1)
            const newUser = {
                username: "Jo",
                name: "Jonathan",
                password: "simplePassword",
            }
            const result = await api
                .post('/api/users/')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            const error = result.body.error
            assert.strictEqual(error,
                `User validation failed: username: Path \`username\` (\`${newUser.username}\`) is shorter than the minimum allowed length (3).`)
            const finalUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(finalUsersNum.length, initialUsersNum.length)
        })

        test('if password is under 3 chars', async () => {
            const initialUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(initialUsersNum.body.length, 1)
            const newUser = {
                username: "Joe",
                name: "Jonathan",
                password: "oo",
            }
            const result = await api
                .post('/api/users/')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            const error = result.body.error
            assert.strictEqual(error,
                "Password must be at least 3 characters long.")
            const finalUsersNum = await api
                .get('/api/users/')
                .expect(200)
            assert.strictEqual(finalUsersNum.length, initialUsersNum.length)
        })
    })
})
