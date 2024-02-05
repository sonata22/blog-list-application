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

module.exports = {
    reverse,
    average,
    totalLikes,
    favoriteBlog
}