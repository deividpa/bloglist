const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');
const blogs = require('./blogs');

describe('most likes', () => {
  test('when there are no blogs, returns null', () => {
    const result = listHelper.mostLikes([]);
    assert.strictEqual(result, null);
  });

  test('when there is only one blog, returns that author with likes of that blog', () => {
    const singleBlog = [
      {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0,
      },
    ];

    const result = listHelper.mostLikes(singleBlog);

    assert.deepStrictEqual(result, {
      author: 'Michael Chan',
      likes: 7,
    });
  });

  test('finds author with most likes', () => {
    const result = listHelper.mostLikes(blogs);

    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
