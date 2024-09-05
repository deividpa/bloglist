const { test, after, beforeEach } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/User')
const helper = require('./tests_helper')

beforeEach(async () => {
    await User.deleteMany({});
    
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
});

test('4.15: a valid user can be created', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
        username: 'davidpa',
        name: 'David',
        password: '123456',
    };

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
});

test('4.16: a user with an invalid username is not created', async () => {
    const newUser = {
        username: 'da', // Invalid username length (less than 3 characters)
        name: 'David',
        password: '123456',
    };
  
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
    assert.strictEqual(result.body.error, 'Username must be at least 3 characters long');
});

test('4.16: a user with an invalid password is not created', async () => {
    const newUser = {
        username: 'davidpa',
        name: 'David',
        password: '12', // Invalid password length (less than 3 characters)
    };
  
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
    assert.strictEqual(result.body.error, 'Password must be at least 3 characters long');
});

test('4.16: a user with a duplicate username is not created', async () => {
    const newUser = {
        username: 'root', // Duplicate username
        name: 'Pepe',
        password: '12345678',
    };
  
    const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);
  
    assert.strictEqual(result.body.error, 'username must be unique');
});


after(async () => {
    await mongoose.connection.close();
});
