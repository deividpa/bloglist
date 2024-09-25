const Blog = require('../models/Blog');
const User = require('../models/User');

const initialBlogs = require('./blogs');

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const randomBlog = async () => {
  const blogs = await blogsInDb();
  return blogs[Math.floor(Math.random() * blogs.length)];
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'tempTitle',
    author: 'tempAuthor',
    url: 'http://tempurl.com',
  });
  await blog.save();

  const id = blog._id.toString();
  await Blog.findByIdAndDelete(id);
  return id;
};

module.exports = {
  initialBlogs,
  blogsInDb,
  randomBlog,
  usersInDb,
  nonExistingId,
};
