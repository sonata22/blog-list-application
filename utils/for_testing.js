const _ = require('lodash')

const reverse = (string) => {
    return string
        .split('')
        .reverse()
        .join('')
}

const average = (array) => {
    const reducer = (sum, item) => {
        return sum + item
    }

    return array.length === 0
        ? 0
        : array.reduce(reducer, 0) / array.length
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.reduce((acc, value) => acc + value.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length) {
        let maxValue = 0
        blogs.map((blog) => {
            maxValue = Math.max(maxValue, blog.likes)
        })
        return blogs.find((blog) => blog.likes === maxValue)
    }
    return {}
}

const mostBlogs = (blogs) => {
    if (blogs.length) {
        const authors = blogs.map(blog => blog.author)
        let authorBlogsNum = {}
        authors.forEach(author => {
            authorBlogsNum[author] = (authorBlogsNum[author] || 0) + 1
        })
        let maxBlogsNum = Math.max(...Object.values(authorBlogsNum))
        return {
            author: Object.keys(authorBlogsNum).find(key => authorBlogsNum[key] === maxBlogsNum),
            blogs: maxBlogsNum
        }
    }
    return {}
}

const mostLikes = (blogs) => {
    if (blogs.length) {
        const likesTotalPerAuthor = blogs.reduce((likesPerAuthor, blog) => {
            likesPerAuthor[blog.author] = likesPerAuthor[blog.author] || 0
            likesPerAuthor[blog.author] += blog.likes
            console.log(likesPerAuthor)
            return likesPerAuthor
        }, {})
        const maxLikesTotalPerAuthor = Math.max(...Object.values(likesTotalPerAuthor))
        return {
            author: Object
                .keys(likesTotalPerAuthor)
                .find(key => likesTotalPerAuthor[key] === maxLikesTotalPerAuthor),
            likes: maxLikesTotalPerAuthor,
        }
    }
    return {}
}

module.exports = {
    reverse,
    average,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}