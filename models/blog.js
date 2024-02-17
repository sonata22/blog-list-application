const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        unique: true
    },
    author: String,
    url: String,
    likes: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId, //for populate to work
        ref: 'User'
    }
})

blogSchema.set('toJSON', { //new method
    virtuals: true,
    versionKey: false,
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Blog', blogSchema)