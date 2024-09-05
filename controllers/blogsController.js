const mongoose = require('mongoose')
const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/Blog')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id);
  if (blog) {
    response.status(200).json(blog);
  } else {
      response.status(404).end();
  }
});

blogsRouter.post('/', async (request, response) => {

  const { title, url, author, likes } = request.body

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (!title || !url) {
      return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: 'Malformatted ID' });
    }

    const result = await Blog.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    response.status(204).end();
});

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
    context: 'query'
  });

  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  response.json(blog);
});

module.exports = blogsRouter;