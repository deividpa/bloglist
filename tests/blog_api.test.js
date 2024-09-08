const { test, after, beforeEach } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/Blog')
const User = require('../models/User')
const api = supertest(app)
const helper = require('./tests_helper')

/* 4.8 - 4-12 exercises start */

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const testUserObj = {
        username: 'davidpa',
        name: 'David',
        password: '123456',
    };

    await api.post('/api/users').send(testUserObj);
    const testUser = await User.findOne({ username: testUserObj.username });

    const blogObjects = helper.initialBlogs.map(
        (blog) => new Blog({ ...blog, user: testUser.id })
    );
    const promiseArray = blogObjects.map((blog) => blog.save());
    const savedBlogs = await Promise.all(promiseArray);
    testUser.blogs = savedBlogs.map((blog) => blog._id);
    await testUser.save();
})

test.only('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test.only('the correct amount of blog posts is returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test.only('verifies that unique identifier is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    
    blogs.forEach(blog => {
        assert.ok(blog.id)
        assert.strictEqual(blog._id, undefined)
    })
})

test.describe('Creating blogs', () => {

    let token = null;
    beforeEach(async () => {
        const testUser = {
            username: 'davidpa',
            password: '123456',
        };
        const result = await api
            .post('/api/login')
            .send(testUser);

        token = result.body.token;
    })

    test.only('a valid blog can be added', async () => {
        const newBlog = {
            title: 'David\'s Blog',
            author: 'David Pérez',
            url: 'https://www.linkedin.com/in/david-perez-aguirre/',
            likes: 12,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('authorization', `bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)

        const contents = response.body.map(blog => blog.title)
        assert.ok(contents.includes('David\'s Blog'))
    })

    test.only('if the likes property is missing, it defaults to 0', async () => {
        const newBlogWithoutLikes = {
            title: 'Blog with no likes defined',
            author: 'David Pérez',
            url: 'https://www.linkedin.com/in/david-perez-aguirre/'
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlogWithoutLikes)
            .set('authorization', `bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0)
    })

    test.only('if title is missing, response is 400 Bad Request', async () => {
        const newBlogWithoutTitle = {
            author: 'David Pérez',
            url: 'https://www.linkedin.com/in/david-perez-aguirre/',
            likes: 5
        }

        await api
            .post('/api/blogs')
            .send(newBlogWithoutTitle)
            .set('authorization', `bearer ${token}`)
            .expect(400)
    })

    test.only('if url is missing, response is 400 Bad Request', async () => {
        const newBlogWithoutUrl = {
            title: 'Blog with no URL',
            author: 'David Pérez',
            likes: 5
        }

        await api
            .post('/api/blogs')
            .send(newBlogWithoutUrl)
            .set('authorization', `bearer ${token}`)
            .expect(400)
    })
})

/* 4.8 - 4-12 exercises end */

/* 4.13 - 4.14 exercises start */

test.describe("Blogs can be deleted", () => {

    let token = null;
    beforeEach(async () => {
        const testUser = {
            username: 'davidpa',
            password: '123456',
        };

        const result = await api
            .post('/api/login')
            .send(testUser);

        token = result.body.token;
    })

    test.only('4.13: a blog can be deleted', async () => {
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = await helper.randomBlog();
    
        const deleteResponse = await 
            api.delete(`/api/blogs/${blogToDelete.id}`)
            .set('authorization', `bearer ${token}`)
    
        assert.strictEqual(deleteResponse.status, 204);
    
        const blogsAtEnd = await helper.blogsInDb();
    
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
    
        const titles = blogsAtEnd.map(blog => blog.title);
        assert(!titles.includes(blogToDelete.title));
    });
    
    test.only('4.13: deleting a non-existing blog returns 404', async () => {
        const nonExistingId = await helper.nonExistingId();
    
        await api
            .delete(`/api/blogs/${nonExistingId}`)
            .set('authorization', `bearer ${token}`)
            .expect(404);
    });
    
    test.only('4.13: deleting a blog with an invalid ID returns 400', async () => {
        const invalidId = '12345invalidid';
    
        await api
            .delete(`/api/blogs/${invalidId}`)
            .set('authorization', `bearer ${token}`)
            .expect(400);
    });
})

test('4.14: a blog\'s likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const updatedLikes = blogToUpdate.likes + 1;
  
    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: updatedLikes })
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    assert.strictEqual(response.body.likes, updatedLikes);
  
    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
    assert.strictEqual(updatedBlog.likes, updatedLikes);
  });

/* 4.13 - 4-14 exercises end */

after(async () => {
    await mongoose.connection.close()
})