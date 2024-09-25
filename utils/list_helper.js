const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  // Find the blog with the most amount of likes
  const favorite = blogs.reduce((prev, current) =>
    current.likes > prev.likes ? current : prev
  );

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  // Agroup the blogs by author and count its ocurrences
  const authorBlogsCount = _.countBy(blogs, 'author');
  // Find the author with the most blogs
  const author = _.maxBy(
    _.keys(authorBlogsCount),
    (author) => authorBlogsCount[author]
  );

  return {
    author,
    blogs: authorBlogsCount[author],
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  // Agroup the blogs by author and sum the likes
  const likesByAuthor = _.mapValues(_.groupBy(blogs, 'author'), (blogs) =>
    _.sumBy(blogs, 'likes')
  );

  // Find the author with most likes
  const author = _.maxBy(
    _.keys(likesByAuthor),
    (author) => likesByAuthor[author]
  );

  return {
    author,
    likes: likesByAuthor[author],
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
