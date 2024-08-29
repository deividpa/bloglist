const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');
const blogs = require('./blogs');

describe('most blogs', () => {
    test('when there are no blogs, returns null', () => {
        const result = listHelper.mostBlogs([])

        assert.strictEqual(result, null)
    });

    test('when there is only one blog, returns that author with one blog', () => {
        const singleBlog = [
            {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
            }
        ]

        const result = listHelper.mostBlogs(singleBlog)
        
        assert.deepStrictEqual(result, {
            author: 'Michael Chan',
            blogs: 1
        });
    });


    test('finds author with most blogs', () => {
        const result = listHelper.mostBlogs(blogs);
        
        assert.deepStrictEqual(result, {
            author: 'Robert C. Martin',
            blogs: 3
        });
    });
});