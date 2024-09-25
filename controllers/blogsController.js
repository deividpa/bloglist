const mongoose = require('mongoose');
const middleware = require('../utils/middleware');
const blogsRouter = require('express').Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

// Deleted due to middleware.tokenExtractor
// const getTokenFrom = request => {
//   const authorization = request.get('authorization')
//   if (authorization && authorization.startsWith('Bearer ')) {
//     return authorization.replace('Bearer ', '')
//   }
//   return null
// }

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id).populate('user', {
    username: 1,
    name: 1,
  });
  if (blog) {
    response.status(200).json(blog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user;
  const { title, url, author, likes } = request.body;

  if (!title || !url) {
    return response.status(400).json({ error: 'title or url missing' });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const { id } = request.params;
    const user = request.user;

    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ error: 'Malformatted ID' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    // Check if the user is the creator of the blog
    if (blog.user.toString() !== user._id.toString()) {
      return response
        .status(403)
        .json({ error: 'You do not have permission to delete this blog' });
    }

    await Blog.findByIdAndDelete(id);
    response.status(204).end();
  }
);

blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params;
  const { likes } = request.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'Malformatted ID' });
  }

  const updatedBlog = { likes };

  // Search for the blog and update it
  const blog = await Blog.findByIdAndUpdate(id, updatedBlog, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  response.json(blog);
});

module.exports = blogsRouter;
