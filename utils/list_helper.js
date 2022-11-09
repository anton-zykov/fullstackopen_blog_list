const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, current) => {
      return sum + current.likes
    }, 0)
}

module.exports = {
  dummy,
  totalLikes
}