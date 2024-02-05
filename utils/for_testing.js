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

module.exports = {
    reverse,
    average,
    totalLikes
}