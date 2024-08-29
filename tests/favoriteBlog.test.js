const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const blogs = require('./blogs')

// Describe block for favorite blog
describe('favorite blog', () => {

    test('when list is empty, returns null', () => {
      const result = listHelper.favoriteBlog([])
      assert.strictEqual(result, null)
    })
  
    test('when list has only one blog, returns that blog', () => {
      const result = listHelper.favoriteBlog([blogs[0]])
      assert.deepStrictEqual(result, {
        title: 'React patterns',
        author: 'Michael Chan',
        likes: 7,
      })
    })
  
    test('when list has multiple blogs, returns the one with most likes', () => {
      const result = listHelper.favoriteBlog(blogs)
      assert.deepStrictEqual(result, {
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        likes: 12,
      })
    })
  })