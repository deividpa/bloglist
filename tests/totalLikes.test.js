const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const blogs = require('./blogs')

// Describe block for total likes
describe('total likes', () => {
    test('when list has multiple blogs, equals the sum of likes', () => {
      const result = listHelper.totalLikes(blogs)
      assert.strictEqual(result, 36) // 7 + 5 + 12 + 10 + 0 + 2 = 36 likes
    })
  
    test('when list is empty, equals zero likes', () => {
      const result = listHelper.totalLikes([])
      assert.strictEqual(result, 0) // 0 likes
    })
  
    test('when list has only one blog, equals the likes of that blog', () => {
      const result = listHelper.totalLikes([blogs[0]])
      assert.strictEqual(result, 7) // 7 likes
    })
  })