const lodash = require('lodash')

const dummy = () => 1

const totalLikes = (blogs) => (
  blogs.reduce((sum, current) => (
    sum + current.likes
  ), 0)
)

const favoriteBlog = (blogs) => (
  blogs.length ? blogs.reduce((favorite, current) => (
    favorite.likes < current.likes ? current : favorite
  )) : {}
)

const mostBlogs = (blogs) => {
  if (!blogs.length) return {}
  const blogsCombinedByAuthor = lodash.groupBy(blogs, (blog) => blog.author)
  const authorsAndBlogsCount = lodash
    .reduce(blogsCombinedByAuthor, (finalList, authorBlogs, author) => (
      lodash.concat(
        finalList,
        {
          author,
          blogs: authorBlogs.length,
        },
      )
    ), [])
  return authorsAndBlogsCount.reduce((leading, current) => (
    leading.blogs < current.blogs ? current : leading
  ))
}

const mostLikes = (blogs) => {
  if (!blogs.length) return {}
  const blogsCombinedByAuthor = lodash.groupBy(blogs, (blog) => blog.author)
  const authorsAndTotalLikes = lodash
    .reduce(blogsCombinedByAuthor, (finalList, authorBlogs, author) => (
      lodash.concat(
        finalList,
        {
          author,
          likes: authorBlogs.reduce((likesSum, currentBlog) => (
            likesSum + currentBlog.likes
          ), 0),
        },
      )
    ), [])
  return authorsAndTotalLikes.reduce((favorite, current) => (
    favorite.likes < current.likes ? current : favorite
  ))
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
